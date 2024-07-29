import { _decorator, Component, Node, PolygonCollider2D, Vec2, Vec3 ,EventTarget} from 'cc';
import { IDropZone,IDraggable } from '../components/DragDropComponent';
import { Crop } from './Crop';
import { SharedDefines } from '../misc/SharedDefines';
const { ccclass, property } = _decorator;

@ccclass('PlotTile')
export class PlotTile extends Component implements IDropZone {
    @property
    public isOccupied: boolean = false;

    @property(Vec2)
    public gridPosition: Vec2 = new Vec2(0, 0);
    private polygonCollider: PolygonCollider2D | null = null;

    public onSelectedEvent: EventTarget = new EventTarget();

    protected onLoad(): void {
        this.polygonCollider = this.getComponent(PolygonCollider2D);
        if (!this.polygonCollider) {
            console.error('PlotTile: PolygonCollider2D component is missing!');
        }
        //listening to click event
        this.node.on(Node.EventType.TOUCH_END, this.onTouchStart, this);
    }

    //ondestroy
    public onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this.onTouchStart, this);
    }

    public getWorldPosition(): Vec2 {
        const worldPos = this.node.getWorldPosition();
        return new Vec2(worldPos.x, worldPos.y);
    }

    public occupy(): void {
        this.isOccupied = true;
    }

    public clear(): void {
        this.isOccupied = false;
    }

    public getNode(): Node 
    {
        return this.node;
    }

    private onTouchStart(event: any): void {
        console.log('touch start');
        this.onSelectedEvent.emit(SharedDefines.EVENT_PLOT_SELECTED,this);
    }

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

    public canAcceptDrop(draggable: IDraggable): boolean {
        return !this.isOccupied && draggable instanceof Crop;
    }

    public onDrop(draggable: IDraggable): void {
        if (draggable instanceof Crop) {
            console.log('drop crop , name = ' + this.node.name);
            this.isOccupied = true;
            const worldPos = this.getWorldPosition();
            draggable.node.removeFromParent();
            this.node.addChild(draggable.node);
            draggable.node.position = Vec3.ZERO;
            draggable.startGrowing();
        }
    }
}
