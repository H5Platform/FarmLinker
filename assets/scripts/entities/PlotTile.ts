import { _decorator, Component,  PolygonCollider2D, Vec2, Vec3 ,EventTarget, instantiate, Director, Node} from 'cc';
import { IDropZone,IDraggable, DragDropComponent } from '../components/DragDropComponent';
import { Crop } from './Crop';
import { CommandType, FarmSelectionType, NetworkCareResult, NetworkCleanseResult, NetworkTreatResult, SceneItem, SceneItemType, SharedDefines } from '../misc/SharedDefines';
import { ResourceManager } from '../managers/ResourceManager';
import { WindowManager } from '../ui/WindowManager';
import { PlayerController } from '../controllers/PlayerController';
import { InventoryItem } from '../components/InventoryComponent';
import { CooldownComponent } from '../components/CooldownComponent';
import { NetworkManager } from '../managers/NetworkManager';
import { GameController } from '../controllers/GameController';
import { SceneEntity } from './SceneEntity';
import { UIEffectHelper } from '../helpers/UIEffectHelper';
import { CoinType } from '../effects/CoinCollectionEffectComponent';
import { GameWindow } from '../ui/windows/GameWindow';
import { UIHelper } from '../helpers/UIHelper';
const { ccclass, property } = _decorator;

@ccclass('PlotTile')
export class PlotTile extends SceneEntity implements IDropZone {
    //define max care count
    public static readonly MAX_CARE_COUNT: number = 4;
    public static readonly MAX_TREAT_COUNT: number = 4;
    public static readonly MAX_CLEANSE_COUNT: number = 4;
    public static readonly CARE_COOLDOWN: number = 5 * SharedDefines.TIME_MINUTE;
    public static readonly TREAT_COOLDOWN: number = 5 * SharedDefines.TIME_MINUTE;
    public static readonly CLEANSE_COOLDOWN: number = 5 * SharedDefines.TIME_MINUTE;


    @property
    public isOccupied: boolean = false;
    private isDragging: boolean = false;

    @property(Vec2)
    public gridPosition: Vec2 = new Vec2(0, 0);
    private polygonCollider: PolygonCollider2D | null = null;

    private cooldownComponent: CooldownComponent | null = null;
    private gameController: GameController | null = null;
    node: any;

    //getter ocuippedCrop
    public get OcuippedCrop(): Crop | null {
        return this.occupiedCrop;
    }
    private occupiedCrop: Crop | null = null;

    private careCooldown: number = 0;

    private currentDraggable: IDraggable | null = null;
    private dragDropComponent: DragDropComponent | null = null;
    private playerController: PlayerController | null = null;

    public eventTarget: EventTarget = new EventTarget();

    protected onLoad(): void {
        this.polygonCollider = this.getComponent(PolygonCollider2D);
        if (!this.polygonCollider) {
            console.error('PlotTile: PolygonCollider2D component is missing!');
        }
        //listening to click event
        //this.node.on(Node.EventType.TOUCH_END, this.onTouchStart, this);
        this.gameController = Director.instance.getScene().getComponentInChildren(GameController);
        if (!this.gameController) {
            console.error('PlotTile: GameController not found!');
        }
        this.cooldownComponent = this.addComponent(CooldownComponent);

    }

    protected start(): void {
        this.playerController = Director.instance.getScene().getComponentInChildren(PlayerController);
        if (!this.playerController) {
            console.error('PlotTile: PlayerController not found!');
        }

        console.log(`start , name = ${this.node.name} pos = ${this.node.getWorldPosition()}`);
    }

    public initialize(isPlayerOwner: boolean): void {
        //console.log(`initialize , name = ${this.node.name} , isPlayerOwner = ${isPlayerOwner}`);
        this.init(this.node.name,isPlayerOwner);
    }

    //ondestroy
    public onDestroy(): void {
       // this.node.off(Node.EventType.TOUCH_END, this.onTouchStart, this);
    }

    public getWorldPosition(): Vec2 {
        const worldPos = this.node.getWorldPosition();
        return new Vec2(worldPos.x, worldPos.y);
    }

    public occupy(crop : Crop): void {
        if(!crop || this.isOccupied) return;
        console.log(`occupy crop , name = ${crop.node.name}`);
        this.occupiedCrop = crop;
        this.node.addChild(crop.node);
        this.isOccupied = true;
        console.log(`occupy crop 3, name = ${crop.node.name}`);
        this.eventTarget.emit(SharedDefines.EVENT_PLOT_OCCUPIED,this);
        crop.eventTarget.on(SharedDefines.EVENT_CROP_HARVEST, this.onCropHarvest, this);
        console.log(`occupy crop 4, name = ${crop.node.name}`);
    }

    public clear(): void {
        if(this.occupiedCrop)
        {
            this.occupiedCrop.eventTarget.off(SharedDefines.EVENT_CROP_HARVEST, this.onCropHarvest, this);
        }
        
        this.node.removeAllChildren();
        this.occupiedCrop = null;
        this.isOccupied = false;
    }

    public canCare(): boolean {
        return this.occupiedCrop && this.occupiedCrop.CareCount >= 0 && this.occupiedCrop.CareCount < PlotTile.MAX_CARE_COUNT && !this.cooldownComponent.isOnCooldown(SharedDefines.COOLDOWN_KEY_CARE);
    }

    public canTreat(): boolean {
        return this.occupiedCrop && this.occupiedCrop.TreatCount >= 0 && this.occupiedCrop.TreatCount < PlotTile.MAX_TREAT_COUNT && !this.cooldownComponent.isOnCooldown(SharedDefines.COOLDOWN_KEY_TREAT);
    }

    public canCleanse(): boolean {
        return this.occupiedCrop && this.occupiedCrop.CleanseCount >= 0 && this.occupiedCrop.CleanseCount < PlotTile.MAX_CLEANSE_COUNT && !this.cooldownComponent.isOnCooldown(SharedDefines.COOLDOWN_KEY_CLEANSE);
    }

    public getNode(): Node 
    {
        return this.node;
    }

    private onTouchStart(event: any): void {
        if (this.isOccupied) {
            return;
        }
        this.eventTarget.emit(SharedDefines.EVENT_PLOT_SELECTED,this);
    }

    //#region select

    public select(dragComponent : DragDropComponent): void {
        if (this.cooldownComponent.isOnCooldown('select')) {
            return; // if cooldown is on, ignore this select
        }
        const uiCanvas = this.gameController.UICanvas;
        const gameplayCanvas = this.gameController.GameplayCanvas;
        console.log(`select plot tile , name = ${this.node.name} , occupied = ${this.isOccupied}`);
        if (this.isOccupied) {
             if(this.occupiedCrop.canHarvest()){
                 this.occupiedCrop.harvest();
                 return;
             }
            else{
                const worldPos = UIHelper.convertPositionBetweenCanvas(this.node.getWorldPosition(),gameplayCanvas.node,uiCanvas.node);
                WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME,FarmSelectionType.PLOT_COMMAND,this.node,worldPos,this.onSelectionWindowItemClicked.bind(this));
                console.log('select plot command , name = ' + this.node.name);
            }
        }
        else{
            if(!this.isPlayerOwner){
                return;
            }
            this.dragDropComponent = dragComponent;
            const worldPos = UIHelper.convertPositionBetweenCanvas(this.node.getWorldPosition(),gameplayCanvas.node,uiCanvas.node);

            WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME,FarmSelectionType.PLOT,this.node,worldPos,this.onSelectionWindowItemClicked.bind(this));
            console.log('select plot , name = ' + this.node.name);
        }
        this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, () => {
            console.log(`select cooldown end , name = ${this.node.name}`);
         });
    }

    private async onSelectionWindowItemClicked(data: any): Promise<void> {
        console.log(`onSelectionWindowItemClicked start...`);
        this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, () => { });
        if (this.isOccupied) {
            const sceneItem = this.occupiedCrop.SceneItem;
            if (sceneItem) {
                if (data == CommandType.Care) {
                    let careResult:NetworkCareResult|null = null;
                    if(this.playerController.visitMode){
                        careResult = await NetworkManager.instance.careFriend(sceneItem.id,this.playerController.friendState.id);
                    }
                    else{
                        careResult = await NetworkManager.instance.care(sceneItem.id);
                    }
                    if (careResult.success) {
                        this.occupiedCrop.CareCount = careResult.data.care_count;
                        if(careResult.data.friend_id){
                            console.log(`care friend , name = ${careResult.data.friend_id} , friend_id = ${this.playerController.friendState.id} , diamond_added = ${careResult.data.diamond_added}`);
                            await this.playDiamondCollectionEffect(careResult.data.diamond_added);
                        }
                    }
                    else {
                        console.log("Care failed");
                    }
                }
                else if (data == CommandType.Treat) {
                    let treatResult:NetworkTreatResult|null = null;
                    if(this.playerController.visitMode){
                        treatResult = await NetworkManager.instance.treatFriend(sceneItem.id, this.playerController.friendState.id);
                    }
                    else{
                        treatResult = await NetworkManager.instance.treat(sceneItem.id);
                    }
                    if (treatResult.success) {
                        this.occupiedCrop.TreatCount = treatResult.data.treat_count;
                        if(treatResult.data.friend_id){
                            console.log(`treat friend , name = ${treatResult.data.friend_id} , friend_id = ${this.playerController.friendState.id} , diamond_added = ${treatResult.data.diamond_added}`);
                            await this.playDiamondCollectionEffect(treatResult.data.diamond_added);
                        }
                    }
                    else {
                        console.log("Treat failed");
                    }
                }
                else if(data == CommandType.Cleanse){
                    let cleanseResult:NetworkCleanseResult|null = null;
                    if(this.playerController.visitMode){
                        cleanseResult = await NetworkManager.instance.cleanseFriend(sceneItem.id,this.playerController.friendState.id);
                    }
                    else{
                        cleanseResult = await NetworkManager.instance.cleanse(sceneItem.id);
                    }
                    if (cleanseResult.success) {
                       // this.occupiedCrop.CleanseCount = cleanseResult.data.cleanse_count;
                       const immunityDuration = cleanseResult.data.cleanse_count; // Default to 24 hours if not provided
                        this.occupiedCrop.setImmunityDuration(immunityDuration,new Date());
                        if(cleanseResult.data.friend_id){
                            console.log(`cleanse friend , name = ${cleanseResult.data.friend_id} , friend_id = ${this.playerController.friendState.id} , diamond_added = ${cleanseResult.data.diamond_added}`);
                            await this.playDiamondCollectionEffect(cleanseResult.data.diamond_added);
                        }
                    }
                    else {
                        console.log("Cleanse failed");
                    }
                }
            }

        }
        else {
            const inventoryItem = data as InventoryItem;
            await this.createAndStartDraggingCrop(inventoryItem);
        }

    }

    private async createAndStartDraggingCrop(inventoryItem:InventoryItem): Promise<void> {
        const cropPrefab = await ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_CROP_CORN);
        const cropNode = instantiate(cropPrefab);
        cropNode.name = inventoryItem.detailId;
        const crop = cropNode.getComponent(Crop);
        crop.initializeWithInventoryItem(inventoryItem);
        crop.updateSprite(`${SharedDefines.WINDOW_SHOP_TEXTURES}${inventoryItem.iconName}`);
        const gameplayNode = Director.instance.getScene().getChildByPath(SharedDefines.PATH_GAMEPLAY);
        gameplayNode.addChild(crop.node);
        //cropNode.setWorldPosition(worldPos);
        this.dragDropComponent.startDragging(crop, cropNode);
    }

    //#endregion

    private isPointInPolygon(point: Vec2, polygon: Vec2[]): boolean {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            const intersect = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    private getWorldPoints(): Vec2[] {
        const worldPos = this.node.getWorldPosition();
        const worldScale = this.node.getWorldScale();
        const angle = this.node.angle;

        return this.polygonCollider.points.map(point => {
           
            // 应用平移
            return new Vec2(point.x + worldPos.x, point.y + worldPos.y);
        });
    }

    public isPointInside(point: Vec2): boolean {
        if (this.polygonCollider) {
            const worldPoints = this.getWorldPoints();
            return this.isPointInPolygon(point, worldPoints);
        }
        else
        {
            const worldPos = this.node.getWorldPosition();
            const size = this.node.getContentSize();
            const halfWidth = size.width / 2;
            const halfHeight = size.height / 2;
            return (
                point.x >= worldPos.x - halfWidth &&
                point.x <= worldPos.x + halfWidth &&
                point.y >= worldPos.y - halfHeight &&
                point.y <= worldPos.y + halfHeight
            );
        }
    }

    //#region IDraggable

    public canAcceptDrop(draggable: IDraggable): boolean {
        return !this.isOccupied && draggable instanceof Crop && !this.isDragging;
    }

    public async onDrop(draggable: IDraggable): Promise<void> {
        this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, () => {});
        this.isDragging = true;
        if (draggable instanceof Crop) {
            console.log('drop crop , name = ' + this.node.name);
            
            const crop = draggable as Crop;
            NetworkManager.instance.eventTarget.once(NetworkManager.EVENT_PLANT, (result)=>{
                if(!result.success || this.currentDraggable === null){
            
                    console.log('crop plant failed , name = ' + this.node.name);
                    return;
                }
                const crop = this.currentDraggable as Crop;
                crop.initializeWithSceneItem(result.data as SceneItem,this.isPlayerOwner);
                this.plant(crop);
                this.currentDraggable = null;
                
            });
            const worldPos = this.node.getWorldPosition();
            const worldScale = this.node.getWorldScale();
            //convert world pos to design pos
            const designPos = new Vec2(worldPos.x / worldScale.x, worldPos.y / worldScale.y);
            this.currentDraggable = draggable;
            const result = await NetworkManager.instance.plant(
                crop.id,
                SceneItemType.Crop,
                designPos.x,
                designPos.y,
                this.node.name
            );
            //result is not success, then remove the crop
            if(!result){
                crop.node.removeFromParent();
            }
        }
        this.isDragging = false;
    }

    public plant(crop : Crop,useInventory: boolean = true): void {
        if(crop.node.parent){
            crop.node.removeFromParent();
        }
        this.node.addChild(crop.node);
        crop.node.position = Vec3.ZERO;
        console.log(`plant crop 1, name = ${crop.node.name}`);
        this.occupy(crop);
        console.log(`plant crop 2, name = ${crop.node.name}`);
        crop.startGrowing();
        if(useInventory){
            //remove crop from inventory
            this.playerController.inventoryComponent.removeItem(crop.SourceInventoryItem.id,1);
        }
        //this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, () => { });
        NetworkManager.instance.eventTarget.off(NetworkManager.EVENT_PLANT, this.plant);

    }

    private onCropHarvest(crop: Crop): void 
    {
        console.log('crop harvest , name = ' + this.node.name);
        this.clear();
    }

    //#endregion

    //#region care

    public onCare(careCount: number): void {
        console.log(`onCare , name = ${this.node.name} , careCount = ${careCount} , isPlayer = ${this.isPlayerOwner}`);
        this.occupiedCrop.CareCount = careCount;
    }

    //#endregion

    // Add these methods to the PlotTile class

    public canPerformOperation(operation: CommandType): boolean {
        if (!this.occupiedCrop) return false;
        switch (operation) {
            case CommandType.Care:
                return this.canCare();
            case CommandType.Treat:
                return this.canTreat();
            case CommandType.Cleanse:
                return this.canCleanse();
            default:
                return false;
        }
    }

    public async performOperation(operation: CommandType): Promise<void> {
        if (!this.occupiedCrop) return;
        const sceneItem = this.occupiedCrop.SceneItem;
        if (!sceneItem) return;

        let result: NetworkCareResult | NetworkTreatResult | NetworkCleanseResult | null = null;
        switch (operation) {
            case CommandType.Care:
                result = await NetworkManager.instance.care(sceneItem.id);
                if (result && result.success) {
                    this.occupiedCrop.CareCount = result.data.care_count;
                }
                break;
            case CommandType.Treat:
                result = await NetworkManager.instance.treat(sceneItem.id);
                if (result && result.success) {
                    this.occupiedCrop.TreatCount = result.data.treat_count;
                }
                break;
            case CommandType.Cleanse:
                result = await NetworkManager.instance.cleanse(sceneItem.id);
                if (result && result.success) {
                    this.occupiedCrop.setImmunityDuration(result.data.cleanse_count,new Date());
                }
                break;
        }

        if (result && result.success && result.data.friend_id) {
            console.log(`Operation ${operation} on friend's crop, friend_id = ${result.data.friend_id}, diamond_added = ${result.data.diamond_added}`);
            this.playerController.playerState.addDiamond(result.data.diamond_added);
            this.playerController.friendState.addDiamond(result.data.diamond_added);
        }
    }

    private async playDiamondCollectionEffect(diamondAmount: number): Promise<void> {
        const gameWindow = WindowManager.instance.getWindow(SharedDefines.WINDOW_GAME_NAME) as GameWindow;
        const diamondDisplay = gameWindow.diamondDisplay;
        if(!diamondDisplay){
            console.error('diamondDisplay not found');
            return;
        }
        const endPos = diamondDisplay.currencySpriteNode.getWorldPosition();
        const coinEffect = await UIEffectHelper.playCoinCollectionEffect(CoinType.DIAMOND, this.node, this.node.getWorldPosition(), endPos);
        coinEffect.node.on("effectComplete", () => {
            this.playerController.playerState.addDiamond(diamondAmount);
            this.playerController.friendState.addDiamond(diamondAmount);
        }, coinEffect.node);
    }
}
