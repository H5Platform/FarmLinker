import { _decorator, Component, Node, ScrollView, instantiate, Prefab, Sprite, Button, UITransform, Vec3, SpriteFrame, Vec2, EventTouch } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { PlayerController } from '../../controllers/PlayerController';
import { InventoryComponent, InventoryItem, ItemType } from '../../components/InventoryComponent';
import { PlotTile } from '../../entities/PlotTile';
import { CommandType, FarmSelectionType, InteractionMode, NetworkCareResult, NetworkCleanseResult, NetworkTreatResult, SharedDefines } from '../../misc/SharedDefines';
import { ResourceManager } from '../../managers/ResourceManager';
import { Fence } from '../../entities/Fence';
import { AnimalDataManager } from '../../managers/AnimalDataManager';
import { WindowManager } from '../WindowManager';
import { NetworkManager } from '../../managers/NetworkManager';
import { UIHelper } from '../../helpers/UIHelper';
import { GrowthableEntity } from '../../entities/GrowthableEntity';
import { GameWindow } from './GameWindow';
import { UIEffectHelper } from '../../helpers/UIEffectHelper';
import { CoinType } from '../../effects/CoinCollectionEffectComponent';
import { Animal } from '../../entities/Animal';

//TODO move to touch location when shown

const { ccclass, property } = _decorator;

enum OperationTargetType{
    None = 0,
    Crop = 1,
    Animal = 2
}

class DragOperation{
    public targetType: OperationTargetType = OperationTargetType.None;
    public operation: CommandType = CommandType.None;
    public dragNode: Node | null = null;
    public targetNode: Node | null = null;

    public constructor(targetType:OperationTargetType,operation:CommandType,dragNode:Node,targetNode:Node){
        this.targetType = targetType;
        this.operation = operation;
        this.dragNode = dragNode;
        this.targetNode = targetNode;
    }

    public reset(): void {
        this.targetType = OperationTargetType.None;
        this.operation = CommandType.None;
        this.dragNode = null;
        this.targetNode = null;
    }
}

@ccclass('FarmSelectionWindow')
export class FarmSelectionWindow extends WindowBase {
    @property(Node)
    private selectionNode: Node | null = null;
    @property(ScrollView)
    private scrollView: ScrollView | null = null;
    @property(Node)
    private plotCommandNode: Node | null = null;
    @property(Node)
    private animalCommandNode: Node | null = null;
    @property(Button)
    private btnCropCare: Button | null = null;
    @property(Button)
    private btnCropTreat: Button | null = null;
    @property(Button)
    private btnCropCleanse: Button | null = null;
    @property(Button)
    private btnAnimalCare: Button | null = null;
    @property(Button)
    private btnAnimalTreat: Button | null = null;
    @property(Button)
    private btnAnimalCleanse: Button | null = null;

    @property(Prefab)
    private itemPrefab: Prefab | null = null;
    @property(Sprite)
    private operationSprite: Sprite | null = null;

    private clickLocation: Vec2 = null;
    private currentSelectionType: FarmSelectionType = FarmSelectionType.NONE;
    private currentSelectionNode: Node | null = null;
    //#region drag and operation
    private dragOperation: DragOperation = null;

    //#endregion
    private fence : Fence | null = null;
    private playerController: PlayerController | null = null;
    private inventoryComponent: InventoryComponent | null = null;
    private callback: (string)=>void | null = null;
    private collectingDiamondRefCount: number = 0;
    private canHide: boolean = true;
   // private currentPlotTile: PlotTile | null = null;

    public initialize(): void {
        super.initialize();
        this.playerController = this.gameController.getPlayerController();
        this.inventoryComponent = this.playerController.inventoryComponent;
        
        this.btnCropTreat.node.on(Button.EventType.CLICK, this.onTreat, this);
        this.btnCropCleanse.node.on(Button.EventType.CLICK, this.onCleanse, this);
        this.btnAnimalCare.node.on(Button.EventType.CLICK, this.onCare, this);
        this.btnAnimalTreat.node.on(Button.EventType.CLICK, this.onTreat, this);
        this.btnAnimalCleanse.node.on(Button.EventType.CLICK, this.onCleanse, this);
    }

    public show(...args: any[]): void {
        super.show(...args);
        if(args.length === 0){
            console.log("FarmSelectionWindow: no arguments passed");
            return;
        }
        this.currentSelectionType = args[0] as FarmSelectionType;
        this.currentSelectionNode = args[1] as Node;
        this.clickLocation = args[2] as Vec2;
        this.callback = args[3] as (string)=>void;
        this.collectingDiamondRefCount = 0;
        this.canHide = true;
        this.operationSprite.node.active = false;

        //set selection node active true
        this.selectionNode!.active = true;
        this.selectionNode!.setWorldPosition(new Vec3(this.clickLocation.x,this.clickLocation.y,0));
        this.updateFarmSelectionViewVisibilityByType(this.currentSelectionType);
        if (this.currentSelectionType === FarmSelectionType.PLOT) {
            
            const animations = this.getItemsByType(ItemType.CROPSEED);
            console.log(`crop seed count: ${animations.length}`);
            this.updateScrollView(animations);
        }
        else if(this.currentSelectionType === FarmSelectionType.FENCE){
            this.fence = this.currentSelectionNode!.getComponent(Fence);
            const animations = this.getItemsByType(ItemType.ANIMALCUB);
            console.log(`animation count: ${animations.length}`);
            this.updateScrollView(animations);
        }
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.playerController.inputComponent.eventTarget.on(SharedDefines.EVENT_CLICK, this.onClick, this);
        this.playerController.inputComponent.eventTarget.on(SharedDefines.EVENT_TOUCH_MOVE, this.onTouchMove, this);
        this.playerController.inputComponent.eventTarget.on(SharedDefines.EVENT_TOUCH_END, this.onTouchEnd, this);
    }

    private removeEventListeners(): void {
        this.playerController.inputComponent.eventTarget.off(SharedDefines.EVENT_CLICK, this.onClick, this);
        this.playerController.inputComponent.eventTarget.off(SharedDefines.EVENT_TOUCH_MOVE, this.onTouchMove, this);
        this.playerController.inputComponent.eventTarget.off(SharedDefines.EVENT_TOUCH_END, this.onTouchEnd, this);
    }

    public hide(): void {
        if(!this.canHide || this.collectingDiamondRefCount > 0){
            return;
        }
        console.log(`hide FarmSelectionWindow`);
        super.hide();
        this.callback = null;
        this.removeEventListeners();
    }

    private updateFarmSelectionViewVisibilityByType(type:FarmSelectionType): void {
        console.log(`updateFarmSelectionViewVisibilityByType: ${type}`);
        if(type === FarmSelectionType.PLOT || type === FarmSelectionType.FENCE){
            this.scrollView.node.active = true;
            this.plotCommandNode.active = false;
            this.animalCommandNode.active = false;
            console.log("Show scroll view");
        }
        else if(type === FarmSelectionType.PLOT_COMMAND){
            this.scrollView.node.active = false;
            this.plotCommandNode.active = true;
            this.animalCommandNode.active = false;
            console.log("Show plot command");
        }
        else if(type === FarmSelectionType.ANIMAL_COMMAND){
            this.scrollView.node.active = false;
            this.plotCommandNode.active = false;
            this.animalCommandNode.active = true;
            console.log("Show animal command");
        }
    }

    //#region handle touch events

    private onClick(event:EventTouch): void {
        console.log("FarmSelectionWindow: onClick");
        if(!this.selectionNode.activeInHierarchy){
            return;
        }
        //get world position of touch
        const worldPosition = event.getUILocation();
        if((this.btnCropCare.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropCare.node)) || (this.btnAnimalCare.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalCare.node))){
            this.onCare();
        }
        else if((this.btnCropTreat.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropTreat.node)) || (this.btnAnimalTreat.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalTreat.node))){
            this.onTreat();
        }
        else if((this.btnCropCleanse.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropCleanse.node)) || (this.btnAnimalCleanse.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalCleanse.node))){
            this.onCleanse();
        }
    }


    private onTouchMove(event:EventTouch): void {
        //console.log("FarmSelectionWindow: onTouchMove");
        //get world position of touch
        const worldPosition = event.getUILocation();
        if (!this.dragOperation) {
            this.initializeDragOperation(worldPosition);
        }
        else if(this.dragOperation && this.dragOperation.dragNode && this.dragOperation.operation !== CommandType.None){
            //update current drag target position
            this.dragOperation.dragNode.setWorldPosition(new Vec3(worldPosition.x, worldPosition.y, 0));
            //if selection node is active, set it to inactive
            if(this.selectionNode!.active){
                this.selectionNode!.active = false;
            }
            if(this.dragOperation.targetType === OperationTargetType.Crop){
                this.handleCropDragOperation();
            }
            else if(this.dragOperation.targetType === OperationTargetType.Animal){
                this.handleAnimalDragOperation();
            }
        }
    }

    private onTouchEnd(event:EventTouch): void {
        console.log("FarmSelectionWindow: onTouchEnd");
        this.playerController.interactionMode = InteractionMode.CameraDrag;
        this.canHide = true;
        this.hide();
        this.dragOperation = null;
    }

    //#endregion

    //#region handle shop items

    private updateScrollView(items:any[]): void {
        if (!this.scrollView || !this.itemPrefab) return;

        this.scrollView.content.removeAllChildren();

        const itemCount = Math.min(items.length, 5);

        // 设置 ScrollView 的大小
        // const scrollViewHeight = itemCount * 110;
        // const uiTransform = this.scrollView.node.getComponent(UITransform);
        // if (uiTransform) {
        //     uiTransform.height = scrollViewHeight;
        // }

        // 禁用或启用滚动
        this.scrollView.vertical = items.length > 1;

        items.forEach(seed => this.createItem(seed.iconName,seed));
    }

    private getItemsByType(itemType:ItemType): InventoryItem[] {
        const itemTypeNumber = itemType as number;
        return this.inventoryComponent?.getAllItems().filter(item => item.itemType === itemTypeNumber.toString()) || [];
    }

    private createItem(textureName:string,data:any|null = null): void {
        const itemNode = instantiate(this.itemPrefab!);
        const sprite = itemNode.getComponent(Sprite);
        const button = itemNode.getComponent(Button);

        if (sprite) {
            ResourceManager.instance.loadAsset<SpriteFrame>(`${SharedDefines.WINDOW_SHOP_TEXTURES}${textureName}/spriteFrame`, SpriteFrame)
                .then(spriteFrame => {
                    if (spriteFrame) {
                        sprite.spriteFrame = spriteFrame;
                    }
                });
        }

        if (button) {
            button.node.on(Button.EventType.CLICK, () => this.onItemSelected(data), this);
        }

        this.scrollView!.content.addChild(itemNode);
    }

    //#endregion


//#region handle button click

    private async onCare(): Promise<void> {
        console.log("onCare");
        this.onItemSelected(CommandType.Care);

    }

    private onTreat(): void {
        console.log("onTreat");
        this.onItemSelected(CommandType.Treat);
    }

    private onCleanse(): void {
        console.log("onCleanse");
        this.onItemSelected(CommandType.Cleanse);
    }

//#endregion

    
//#region handle drag operation
    private initializeDragOperation(worldPosition:Vec2): void {

        if (this.btnCropCare.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropCare.node)) {
            console.log(`initializeDragOperation: Crop Care active = ${this.btnCropCare.node.activeInHierarchy}`);
            this.operationSprite.spriteFrame = this.btnCropCare.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Crop,CommandType.Care,null,null);
        }
        else if (this.btnAnimalCare.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalCare.node)) {
            this.operationSprite.spriteFrame = this.btnAnimalCare.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Animal,CommandType.Care,null,null);
        }
        else if (this.btnCropTreat.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropTreat.node)) {
            this.operationSprite.spriteFrame = this.btnCropTreat.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Crop,CommandType.Treat,null,null);
        }
        else if (this.btnAnimalTreat.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalTreat.node)) {
            this.operationSprite.spriteFrame = this.btnAnimalTreat.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Animal,CommandType.Treat,null,null);
        }
        else if (this.btnCropCleanse.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnCropCleanse.node)) {
            this.operationSprite.spriteFrame = this.btnCropCleanse.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Crop,CommandType.Cleanse,null,null);
        }
        else if (this.btnAnimalCleanse.node.activeInHierarchy && UIHelper.isPointInUINode(worldPosition, this.btnAnimalCleanse.node)) {
            this.operationSprite.spriteFrame = this.btnAnimalCleanse.node.getComponent(Sprite).spriteFrame;
            this.dragOperation = new DragOperation(OperationTargetType.Animal,CommandType.Cleanse,null,null);
        }

        if(this.dragOperation){
            this.canHide = false;
            this.collectingDiamondRefCount = 0;
            this.operationSprite.node.active = true;
            this.dragOperation.dragNode = this.operationSprite.node;
            this.playerController.interactionMode = InteractionMode.Command;
        }
    }

    private handleCropDragOperation(): void {
       // console.log("FarmSelectionWindow: handleCropDragOperation");
        const plots = this.playerController.visitMode ? this.gameController.FriendPlotTiles : this.gameController.PlayerPlotTiles;
        for(let i = 0; i < plots.length; i++){
            const plot = plots[i];
            //check if currentDragTarget is in the pilot
            if(this.dragOperation.targetNode !== plot.node && UIHelper.isPointInUINodeWorldPosition(this.dragOperation.dragNode!.worldPosition, plot.node)){
                if(this.dragOperation.operation === CommandType.Care){
                    this.handleCarePlot(plot);
                }
                else if(this.dragOperation.operation === CommandType.Treat){
                    this.handleTreatPlot(plot);
                }
                else if(this.dragOperation.operation === CommandType.Cleanse){
                    this.handleCleansePlot(plot);
                }
                this.dragOperation.targetNode = plot.node;
                break;
            }
            
        }

    }

    private handleAnimalDragOperation(): void {
        //console.log("FarmSelectionWindow: handleAnimalDragOperation");
        const fence = this.gameController.getAvailableFence();
        const animals = fence.getAnimals();
        for(let i = 0; i < animals.length; i++){
            const animal = animals[i];
            //check if currentDragTarget is in the pilot
            if(this.dragOperation.targetNode !== animal.node && UIHelper.isPointInUINodeWorldPosition(this.dragOperation.dragNode!.worldPosition, animal.node)){
                if(this.dragOperation.operation === CommandType.Care){
                    this.handleCareAnimal(animal);
                }
                else if(this.dragOperation.operation === CommandType.Treat){
                    this.handleTreatAnimal(animal);
                }
                else if(this.dragOperation.operation === CommandType.Cleanse){
                    this.handleCleanseAnimal(animal);
                }
                this.dragOperation.targetNode = animal.node;
            }
        }
    }

    //#region handle crop operation

    private async handleCarePlot(plotTile:PlotTile): Promise<void> {
        console.log(`handleCare plot = ${plotTile.node.name} , occupied = ${plotTile.isOccupied}`);
        if(!plotTile.isOccupied){ return; }
        const crop = plotTile.OcuippedCrop;
        if(crop){
            if(crop.canCare()){
                let careResult:NetworkCareResult|null = null;
                if(this.playerController.visitMode){
                    careResult = await crop.careByFriend(this.playerController.friendState.id);
                }
                else{
                    careResult = await crop.care();
                }
                if(careResult && careResult.success){
                    console.log(`care result: ${careResult.success}`);
                    if(careResult.data.friend_id){
                        console.log(`care friend , name = ${careResult.data.friend_id} , friend_id = ${this.playerController.friendState.id} , diamond_added = ${careResult.data.diamond_added}`);
                        this.collectingDiamondRefCount++;
                        this.playDiamondCollectionEffect(plotTile.node,careResult.data.diamond_added,()=>{
                            this.collectingDiamondRefCount--;
                            this.hide();
                        });
                    }
                }
            }
            else{
                console.log("Crop cannot care");
            }
        }
        this.hide();
    }

    private async handleTreatPlot(plotTile:PlotTile): Promise<void> {
        console.log("handleTreat");
        if(!plotTile.isOccupied){ return; }
        const crop = plotTile.OcuippedCrop;
        if(crop){
            if(crop.canTreat()){
                let treatResult:NetworkTreatResult|null = null;
                if(this.playerController.visitMode){
                    treatResult = await crop.treatByFriend(this.playerController.friendState.id);
                }
                else{
                    treatResult = await crop.treat();
                }
                if(treatResult && treatResult.success){
                    console.log(`treat result: ${treatResult.success}`);
                    this.collectingDiamondRefCount++;
                    this.playDiamondCollectionEffect(plotTile.node,treatResult.data.diamond_added,()=>{
                        this.collectingDiamondRefCount--;
                        this.hide();
                    });
                }
            }
            else{
                console.log("Crop cannot treat");
            }
        }
        this.hide();
    }

    private async handleCleansePlot(plotTile:PlotTile): Promise<void> {
        console.log("handleCleanse");
        if(!plotTile.isOccupied){ return; }
        const crop = plotTile.OcuippedCrop;
        if(crop){
            if(crop.canCleanse()){
                let cleanseResult:NetworkCleanseResult|null = null;
                if(this.playerController.visitMode){
                    cleanseResult = await crop.cleanseByFriend(this.playerController.friendState.id);
                }
                else{
                    cleanseResult = await crop.cleanse();
                }
                if(cleanseResult && cleanseResult.success){
                    console.log(`cleanse result: ${cleanseResult.success}`);
                    this.collectingDiamondRefCount++;
                    this.playDiamondCollectionEffect(plotTile.node,cleanseResult.data.diamond_added,()=>{
                        this.collectingDiamondRefCount--;
                        this.hide();
                    });
                }
            }
            else{
                console.log("Crop cannot cleanse");
            }
        }
        this.hide();
    }

    //#endregion

    //#region handle animal operation

    private async handleCareAnimal(animal:Animal): Promise<void> {
        if(animal.canCare()){
            let careResult:NetworkCareResult|null = null;
            if(this.playerController.visitMode){
                careResult = await animal.careByFriend(this.playerController.friendState.id);
            }
            else{
                careResult = await animal.care();
            }
            if(careResult && careResult.success){
                console.log(`care result: ${careResult.success}`);
                this.collectingDiamondRefCount++;
                this.playDiamondCollectionEffect(animal.node,careResult.data.diamond_added,()=>{
                    this.collectingDiamondRefCount--;
                    this.hide();
                });
            }
        }
        this.hide();
    }

    private async handleTreatAnimal(animal:Animal): Promise<void> {
        console.log("handleTreatAnimal");
        if(animal.canTreat()){
            let treatResult:NetworkTreatResult|null = null;
            if(this.playerController.visitMode){
                treatResult = await animal.treatByFriend(this.playerController.friendState.id);
            }
            else{
                treatResult = await animal.treat();
            }
            if(treatResult && treatResult.success){
                console.log(`treat result: ${treatResult.success}`);
                this.collectingDiamondRefCount++;
                this.playDiamondCollectionEffect(animal.node,treatResult.data.diamond_added,()=>{
                    this.collectingDiamondRefCount--;
                    this.hide();
                });
            }
        }

        this.hide();
    }

    private async handleCleanseAnimal(animal:Animal): Promise<void> {
        console.log("handleCleanseAnimal");
        if(animal.canCleanse()){
            let cleanseResult:NetworkCleanseResult|null = null;
            if(this.playerController.visitMode){
                cleanseResult = await animal.cleanseByFriend(this.playerController.friendState.id);
            }
            else{
                cleanseResult = await animal.cleanse();
            }
            if(cleanseResult && cleanseResult.success){
                console.log(`cleanse result: ${cleanseResult.success}`);
                this.collectingDiamondRefCount++;
                this.playDiamondCollectionEffect(animal.node,cleanseResult.data.diamond_added,()=>{
                    this.collectingDiamondRefCount--;
                    this.hide();
                });
            }
        }
        this.hide();
    }
    
    //#endregion

    //#endregion


    private onItemSelected(data:any = null): void {

        // if(this.operationSprite){
        //     this.operationSprite.spriteFrame = this.btnCropCare.node.getComponent(Sprite).spriteFrame;
        //     this.operationSprite.node.active = true;
        //     const currentPosition = this.operationSprite.node.worldPosition;
        //    // this.gameController.
        // }


        this.callback(data);

        WindowManager.instance.hide(SharedDefines.WINDOW_SELECTION_NAME);
    }

    private async playDiamondCollectionEffect(startNode:Node,diamondAmount: number,callback:()=>void): Promise<void> {
        const gameWindow = WindowManager.instance.getWindow(SharedDefines.WINDOW_GAME_NAME) as GameWindow;
        const diamondDisplay = gameWindow.diamondDisplay;
        if(!diamondDisplay){
            console.error('diamondDisplay not found');
            return;
        }
        const endPos = diamondDisplay.currencySpriteNode.getWorldPosition();
        const coinEffect = await UIEffectHelper.playCoinCollectionEffect(CoinType.DIAMOND, this.node, startNode.getWorldPosition(), endPos);
        coinEffect.node.on("effectComplete", () => {
            this.playerController.playerState.addDiamond(diamondAmount);
            this.playerController.friendState.addDiamond(diamondAmount);
            callback();
        }, coinEffect.node);

    }
}
