import { _decorator, Component, Node, PolygonCollider2D, Vec2, Vec3 ,EventTarget, instantiate, Director} from 'cc';
import { IDropZone,IDraggable, DragDropComponent } from '../components/DragDropComponent';
import { Crop } from './Crop';
import { FarmSelectionType, SharedDefines } from '../misc/SharedDefines';
import { ResourceManager } from '../managers/ResourceManager';
import { WindowManager } from '../ui/WindowManager';
const { ccclass, property } = _decorator;

@ccclass('PlotTile')
export class PlotTile extends Component implements IDropZone {
    @property
    public isOccupied: boolean = false;

    @property(Vec2)
    public gridPosition: Vec2 = new Vec2(0, 0);
    private polygonCollider: PolygonCollider2D | null = null;

    private occupiedCrop: Crop | null = null;
    private dragDropComponent: DragDropComponent | null = null;

    public eventTarget: EventTarget = new EventTarget();

    protected onLoad(): void {
        this.polygonCollider = this.getComponent(PolygonCollider2D);
        if (!this.polygonCollider) {
            console.error('PlotTile: PolygonCollider2D component is missing!');
        }
        //listening to click event
        //this.node.on(Node.EventType.TOUCH_END, this.onTouchStart, this);
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
        if (this.isOccupied) {
            //TODO: 当被占用时再选中应该显示浇花、割草等操作
            return;
        }
        else{
            this.dragDropComponent = dragComponent;
            WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME,FarmSelectionType.PLOT,this.node,this.node.getWorldPosition(),this.onSelectionWindowItemClicked.bind(this));
        }
    }

    private async onSelectionWindowItemClicked(id:string): Promise<void> {
        const cropPrefab = await ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_CROP_CORN);
        const cropNode = instantiate(cropPrefab);
        cropNode.name = id;
        const crop = cropNode.getComponent(Crop);
        crop.initialize(id);
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
            draggable.node.removeFromParent();
            this.node.addChild(draggable.node);
            draggable.node.position = Vec3.ZERO;
            this.occupy(draggable)
            draggable.startGrowing();
        }
    }

    private onCropHarvest(crop: Crop): void 
    {
        console.log('crop harvest , name = ' + this.node.name);
        this.clear();
    }

    //#endregion
}
