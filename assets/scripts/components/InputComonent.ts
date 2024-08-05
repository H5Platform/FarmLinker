// TouchNode.ts

import { _decorator, Component, Node, EventTouch,Vec2  } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InputComponent')
export class InputComponent extends Component {
    private static readonly CLICK_THRESHOLD: number = 0.25; // 点击判定阈值，单位：秒

    private touchStartTime: number = 0;
    private touchStartPosition: Vec2 = new Vec2();

    public onTouchStart: ((event: EventTouch) => void) | null = null;
    public onTouchMove: ((event: EventTouch) => void) | null = null;
    public onTouchEnd: ((event: EventTouch) => void) | null = null;
    public onTouchCancel: ((event: EventTouch) => void) | null = null;
    public onClick: ((event: EventTouch) => void) | null = null;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.touchStartHandler, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEndHandler, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
    }

    private touchStartHandler(event: EventTouch): void {
        this.touchStartTime = Date.now();
        this.touchStartPosition = event.getLocation();
        if (this.onTouchStart) this.onTouchStart(event);
    }

    private touchMoveHandler(event: EventTouch): void {
        if (this.onTouchMove) this.onTouchMove(event);
    }

    private touchEndHandler(event: EventTouch): void {
        const touchEndTime = Date.now();
        const touchEndPosition = event.getLocation();
        if (this.onTouchEnd) this.onTouchEnd(event);

        // 判断是否为点击事件
        if (touchEndTime - this.touchStartTime <= InputComponent.CLICK_THRESHOLD * 1000 &&
            Vec2.distance(this.touchStartPosition, touchEndPosition) < 10) { // 添加一个小的位移容差
            if (this.onClick) {
                this.onClick(event);
            }
        }
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