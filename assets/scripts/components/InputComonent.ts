// TouchNode.ts

import { _decorator, Component, Node, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InputComponent')
export class InputComponent extends Component {
    public onTouchStart: ((event: EventTouch) => void) | null = null;
    public onTouchMove: ((event: EventTouch) => void) | null = null;
    public onTouchEnd: ((event: EventTouch) => void) | null = null;
    public onTouchCancel: ((event: EventTouch) => void) | null = null;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.touchStartHandler, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEndHandler, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
    }

    private touchStartHandler(event: EventTouch): void {
        if (this.onTouchStart) this.onTouchStart(event);
    }

    private touchMoveHandler(event: EventTouch): void {
        if (this.onTouchMove) this.onTouchMove(event);
    }

    private touchEndHandler(event: EventTouch): void {
        if (this.onTouchEnd) this.onTouchEnd(event);
    }

    private touchCancelHandler(event: EventTouch): void {
        if (this.onTouchCancel) this.onTouchCancel(event);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.touchStartHandler, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
        this.node.off(Node.EventType.TOUCH_END, this.touchEndHandler, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
    }
}