import { _decorator, Component, Node, EventTouch, Vec3, UITransform, Vec2, input,Input,  director, Camera, Layers } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';
import { Crop } from '../entities/Crop';
const { ccclass, property } = _decorator;

// 定义可拖拽对象的接口
export interface IDraggable {

    setPosition(position: Vec3): void;

    onDragStart(): void;
    onDragging(newPosition: Vec3): void;
    onDragEnd(endPosition: Vec3,isDestroy:boolean): boolean;
}

// 定义放置区域的接口
export interface IDropZone {
    getNode(): Node;
    isPointInside(point: Vec2): boolean;
    canAcceptDrop(draggable: IDraggable): boolean;
    onDrop(draggable: IDraggable): void;
}

@ccclass('DragDropComponent')
export class DragDropComponent extends Component {
    @property({type: Node})
    public dragContainer: Node | null = null;
    //camera
    @property({type: Camera})
    public camera: Camera | null = null;

    private currentDraggingObject: IDraggable | null = null;
    private dropZones: IDropZone[] = [];
    //getter isdragging
    public get IsDragging(): boolean {
        return this.isDragging;
    }
    private isDragging: boolean = false;
    // 地面与屏幕之间的偏移量
    private deltaSizeBetweenGroundAndScreen:Vec2 = new Vec2(0,0);
    private currentMousePos: Vec2 = new Vec2();
    private startDragPosition: Vec3 = new Vec3();
    private originDragNodeLayer: number = 0;

    onLoad() {
        //find gameplay canvas by name
        const gameplayCanvasNode = director.getScene()!.getChildByName('GameplayCanvas');
        if (!gameplayCanvasNode) {
            console.error('GameplayCanvas not found');
            return;
        }
        const gameplayCanvasContentSize = gameplayCanvasNode.getComponent(UITransform)!.contentSize;

        //get canvas by name
        const canvasNode = director.getScene()!.getChildByName('Canvas');
        if (!canvasNode) {
            console.error('Canvas not found');
            return;
        }
        const canvasContentSize = canvasNode.getComponent(UITransform)!.contentSize;

        this.deltaSizeBetweenGroundAndScreen = new Vec2((gameplayCanvasContentSize.x - canvasContentSize.x) / 2, (gameplayCanvasContentSize.y - canvasContentSize.y) / 2);
    }

    protected start(): void {

        
        this.dragContainer = this.node;

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
        //if drop zone is already registered, do nothing
        if (this.dropZones.indexOf(dropZone) !== -1) {
            return;
        }
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
        this.originDragNodeLayer = node.layer;
        draggable.onDragStart();
        // 将拖拽对象移动到拖拽容器中，以确保它在最上层
        if (this.dragContainer && node.parent !== this.dragContainer) {
            node.layer = this.dragContainer.layer;
            node.walk((child: Node) => {
                child.layer = this.dragContainer.layer;
            });
            const worldPos = node.getWorldPosition();
            node.removeFromParent();
            this.dragContainer.addChild(node);
            node.setWorldPosition(worldPos);
            console.log(`Dragging object ${node.name} to drag container`);
        }
       
       
        // 立即更新位置到鼠标位置
        const mousePos = this.getMousePosition();
        draggable.onDragging(mousePos);
        this.startDragPosition = node.getWorldPosition();
    }

    private onTouchStart(event: EventTouch): void {
        if (this.isDragging && this.currentDraggingObject) {
            // const crop = this.currentDraggingObject as Crop;
            // const worldPos = crop.node.getWorldPosition();
            // //find gameplay canvas
            // const gameplayCanvasNode = director.getScene()!.getChildByName('GameplayCanvas');
            // if (!gameplayCanvasNode) {
            //     console.error('GameplayCanvas not found');
            //     return;
            // }
            // //find child camera
            // const camera = gameplayCanvasNode.getChildByName('Camera')!.getComponent(Camera);
            // if (!camera) {
            //     console.error('Camera not found');
            //     return;
            // }
            // //const uiPos = new Vec3();
            // camera.convertToUINode(worldPos,crop.node,uiPos);
            

            // const uiPos = crop.node.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);
            // console.log(`crop pos = ${uiPos}`);
            
            const endPosition = event.getUILocation();
            
            let acceptedDropZone: IDropZone | null = null;
            for (const dropZone of this.dropZones) {
                if (dropZone.isPointInside(endPosition) && dropZone.canAcceptDrop(this.currentDraggingObject)) {
                    acceptedDropZone = dropZone;
                    break;
                }
            }
            if (acceptedDropZone) {
                let worldPos = acceptedDropZone.getNode().getWorldPosition();
                this.currentDraggingObject.onDragEnd(worldPos,false);
                acceptedDropZone.onDrop(this.currentDraggingObject);
            }
            else {
                this.currentDraggingObject.onDragEnd(this.startDragPosition,true);
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
        // if (this.camera) {
        //     const worldPos = this.camera.screenToWorld(new Vec3(mousePos.x, mousePos.y, 0));
        //     console.log(`worldPos = ${worldPos}`);
        //     let localPos = new Vec3();
        //     localPos = this.dragContainer.inverseTransformPoint(localPos,new Vec3(mousePos.x, mousePos.y, 0));
        //     console.log(`localPos = ${localPos}`);
        //     return localPos;
        // }
        // return new Vec3(mousePos.x, mousePos.y, 0);
        const worldPos = new Vec3(mousePos.x + this.deltaSizeBetweenGroundAndScreen.x, mousePos.y + this.deltaSizeBetweenGroundAndScreen.y, 0);
        const localPos = this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(mousePos.x, mousePos.y, 0));//this.dragContainer!.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);

        // return this.dragContainer ? this.dragContainer!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(mousePos.x, mousePos.y, 0)) 
        // : this.node.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(mousePos.x, mousePos.y, 0));

        return localPos;
    }

    onDestroy() {
        //director.getScene()!.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }
}