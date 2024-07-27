import { _decorator, Component, Node, EventTouch, Vec3, UITransform, Vec2, input,Input,  director } from 'cc';
const { ccclass, property } = _decorator;

// 定义可拖拽对象的接口
export interface IDraggable {
    onDragStart(): void;
    onDragging(newPosition: Vec3): void;
    onDragEnd(endPosition: Vec3): boolean;
}

// 定义放置区域的接口
export interface IDropZone {
    isPointInside(point: Vec2): boolean;
    canAcceptDrop(draggable: IDraggable): boolean;
    onDrop(draggable: IDraggable): void;
}

@ccclass('DragDropComponent')
export class DragDropComponent extends Component {
    @property({type: Node})
    public dragContainer: Node | null = null;

    private currentDraggingObject: IDraggable | null = null;
    private dropZones: IDropZone[] = [];
    private isDragging: boolean = false;
    private currentMousePos: Vec2 = new Vec2();
    private startDragPosition: Vec3 = new Vec3();

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    update() {
        if (this.isDragging && this.currentDraggingObject) {
            const mousePos = this.getMousePosition();
            this.currentDraggingObject.onDragging(mousePos);
        }
    }

    public registerDropZone(dropZone: IDropZone): void {
        this.dropZones.push(dropZone);
    }

    public unregisterDropZone(dropZone: IDropZone): void {
        const index = this.dropZones.indexOf(dropZone);
        if (index !== -1) {
            this.dropZones.splice(index, 1);
        }
    }

    public startDragging(draggable: IDraggable, node: Node): void {
        this.currentDraggingObject = draggable;
        this.isDragging = true;
        draggable.onDragStart();
        // 将拖拽对象移动到拖拽容器中，以确保它在最上层
        if (this.dragContainer && node.parent !== this.dragContainer) {
            const worldPos = node.getWorldPosition();
            node.removeFromParent();
            this.dragContainer.addChild(node);
            node.setWorldPosition(worldPos);
        }
        // 立即更新位置到鼠标位置
        const mousePos = this.getMousePosition();
        draggable.onDragging(mousePos);
        this.startDragPosition = mousePos;
    }

    private onTouchStart(event: EventTouch): void {
        if (this.isDragging && this.currentDraggingObject) {
            const endPosition = event.getUILocation();
            let canAcceptDrop = false;
            let acceptedDropZone: IDropZone | null = null;
            for (const dropZone of this.dropZones) {
                if (dropZone.isPointInside(endPosition) && dropZone.canAcceptDrop(this.currentDraggingObject)) {
                    acceptedDropZone = dropZone;
                    break;
                }
            }
            if (acceptedDropZone) {
                acceptedDropZone.onDrop(this.currentDraggingObject);
                this.currentDraggingObject.onDragEnd(new Vec3(endPosition.x, endPosition.y, 0));
            }
            else {
                this.currentDraggingObject.onDragEnd(this.startDragPosition);
            }
            this.currentDraggingObject = null;
            this.isDragging = false;
            this.startDragPosition = new Vec3();
        }
    }

    private onMouseMove(event: EventTouch): void 
    {
        this.currentMousePos = event.getUILocation();
    }


    private getMousePosition(): Vec3 {
        const mousePos = this.currentMousePos;
        return this.dragContainer!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(mousePos.x, mousePos.y, 0));
    }

    onDestroy() {
        //director.getScene()!.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }
}