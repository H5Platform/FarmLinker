// TouchNode.ts

import { _decorator, Component, Node, EventTouch,Vec2, EventTarget  } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';
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

    public eventTarget: EventTarget = new EventTarget();

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
        this.eventTarget.emit(SharedDefines.EVENT_TOUCH_START, event);
    }

    private touchMoveHandler(event: EventTouch): void {
        if (this.onTouchMove) this.onTouchMove(event);
        this.eventTarget.emit(SharedDefines.EVENT_TOUCH_MOVE, event);
    }

    private touchEndHandler(event: EventTouch): void {
        const touchEndTime = Date.now();
        const touchEndPosition = event.getLocation();

        // 判断是否为点击事件
        const touchDuration = touchEndTime - this.touchStartTime;
        const touchDistance = Vec2.distance(this.touchStartPosition, touchEndPosition);
        
        if (touchDuration <= InputComponent.CLICK_THRESHOLD * 1000 && touchDistance < 10) {
            console.log("InputComponent: onClick");
            if (this.onClick) {
                this.onClick(event);
            }
            this.eventTarget.emit(SharedDefines.EVENT_CLICK, event);
        }

        if (this.onTouchEnd) this.onTouchEnd(event);
        this.eventTarget.emit(SharedDefines.EVENT_TOUCH_END, event);
    }

    private touchCancelHandler(event: EventTouch): void {
        if (this.onTouchCancel) this.onTouchCancel(event);
        this.eventTarget.emit(SharedDefines.EVENT_TOUCH_CANCEL, event);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.touchStartHandler, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
        this.node.off(Node.EventType.TOUCH_END, this.touchEndHandler, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
    }
}