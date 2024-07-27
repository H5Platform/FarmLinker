import { _decorator, Component, Node, Vec2 } from 'cc';
import { IDropZone,IDraggable } from '../components/DragDropComponent';
import { Crop } from './Crop';
const { ccclass, property } = _decorator;

@ccclass('PlotTile')
export class PlotTile extends Component implements IDropZone {
    @property
    public isOccupied: boolean = false;

    @property(Vec2)
    public gridPosition: Vec2 = new Vec2(0, 0);

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

    public isPointInside(point: Vec2): boolean {
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

    public canAcceptDrop(draggable: IDraggable): boolean {
        return !this.isOccupied && draggable instanceof Crop;
    }

    public onDrop(draggable: IDraggable): void {
        if (draggable instanceof Crop) {
            console.log('drop crop , name = ' + this.node.name);
            this.isOccupied = true;
            const worldPos = this.getWorldPosition();
            draggable.node.setWorldPosition(worldPos.x, worldPos.y, 0);
            draggable.startGrowing();
        }
    }
}
