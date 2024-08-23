import { _decorator, Component, Node, PolygonCollider2D, Vec2, Vec3 ,EventTarget, instantiate, Director} from 'cc';
import { IDropZone,IDraggable, DragDropComponent } from '../components/DragDropComponent';
import { Crop } from './Crop';
import { FarmSelectionType, SceneItem, SceneItemType, SharedDefines } from '../misc/SharedDefines';
import { ResourceManager } from '../managers/ResourceManager';
import { WindowManager } from '../ui/WindowManager';
import { PlayerController } from '../controllers/PlayerController';
import { InventoryItem } from '../components/InventoryComponent';
import { CooldownComponent } from '../components/CooldownComponent';
import { NetworkManager } from '../managers/NetworkManager';
import { GameController } from '../controllers/GameController';
const { ccclass, property } = _decorator;

@ccclass('PlotTile')
export class PlotTile extends Component implements IDropZone {
    //define max care count
    public static readonly MAX_CARE_COUNT: number = 5;
    public static readonly CARE_COOLDOWN: number = 5 * SharedDefines.TIME_MINUTE;


    @property
    public isOccupied: boolean = false;

    @property(Vec2)
    public gridPosition: Vec2 = new Vec2(0, 0);
    private polygonCollider: PolygonCollider2D | null = null;

    private cooldownComponent: CooldownComponent | null = null;
    private gameController: GameController | null = null;

    //getter ocuippedCrop
    public get OcuippedCrop(): Crop | null {
        return this.occupiedCrop;
    }
    private occupiedCrop: Crop | null = null;

    public careCount: number = 0;
    private careCooldown: number = 0;

    private currentDraggable: IDraggable | null = null;
    private dragDropComponent: DragDropComponent | null = null;

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
        this.occupiedCrop = crop;
        this.node.addChild(crop.node);
        this.isOccupied = true;
        this.eventTarget.emit(SharedDefines.EVENT_PLOT_OCCUPIED,this);
        crop.eventTarget.on(SharedDefines.EVENT_CROP_HARVEST, this.onCropHarvest, this);
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
        return this.careCount >= 0 && this.careCount < PlotTile.MAX_CARE_COUNT && !this.cooldownComponent.isOnCooldown(SharedDefines.COOLDOWN_KEY_CARE);
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

        if (this.isOccupied) {
            //TODO: 当被占用时再选中应该显示浇花、割草等操作
            WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME,FarmSelectionType.PLOT_COMMAND,this.node,this.node.getWorldPosition(),this.onSelectionWindowItemClicked.bind(this));
            console.log('select plot command , name = ' + this.node.name);
        }
        else{
            this.dragDropComponent = dragComponent;
            WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME,FarmSelectionType.PLOT,this.node,this.node.getWorldPosition(),this.onSelectionWindowItemClicked.bind(this));
            console.log('select plot , name = ' + this.node.name);
        }
    }

    private async onSelectionWindowItemClicked(data: any): Promise<void> {
        if (this.isOccupied) {
            const sceneItem = this.occupiedCrop.SceneItem;
            if (sceneItem) {
                const careResult = await NetworkManager.instance.care(sceneItem.id, sceneItem.parent_node_name);
                if (careResult.success) {
                    //TODO 更新（缩短）成熟时间
                    this.careCount = careResult.data.care_count;
                }
                else {
                    console.log("Care failed");
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
        return !this.isOccupied && draggable instanceof Crop;
    }

    public onDrop(draggable: IDraggable): void {
        if (draggable instanceof Crop) {
            console.log('drop crop , name = ' + this.node.name);
            
            const crop = draggable as Crop;
            NetworkManager.instance.eventTarget.once(NetworkManager.EVENT_PLANT, (result)=>{
                if(!result.success || this.currentDraggable === null){
            
                    console.log('crop plant failed , name = ' + this.node.name);
                    return;
                }
                const crop = this.currentDraggable as Crop;
                crop.initializeWithSceneItem(result.data as SceneItem);
                this.plant(crop);
                this.currentDraggable = null;
            });
            const worldPos = this.node.getWorldPosition();
            this.currentDraggable = draggable;
            NetworkManager.instance.plant(
                crop.id,
                SceneItemType.Crop,
                worldPos.x,
                worldPos.y,
                this.node.name
            );
            
        }
    }

    public plant(crop : Crop): void {
        if(crop.node.parent){
            crop.node.removeFromParent();
        }
        this.node.addChild(crop.node);
        crop.node.position = Vec3.ZERO;
        this.occupy(crop);
        crop.startGrowing();
        //this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, () => { });
        NetworkManager.instance.eventTarget.off(NetworkManager.EVENT_PLANT, this.plant);

    }

    private onCropHarvest(crop: Crop): void 
    {
        console.log('crop harvest , name = ' + this.node.name);
        this.clear();
    }

    //#endregion
}
