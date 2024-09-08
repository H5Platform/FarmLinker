import { _decorator, Component, Node, EventTouch,Vec2, EventTarget, UITransform, Vec3  } from 'cc';
const { ccclass, property } = _decorator;

export class UIHelper {
    public static isPointInUINode(point: Vec2, node: Node): boolean {
        const uiTransform = node.getComponent(UITransform);
        if (!uiTransform) {
            return false;
        }
        const buttonRect = uiTransform.getBoundingBoxToWorld();
        return buttonRect.contains(point);//new Vec2(point.x, point.y)
    }

    public static isPointInUINodeWorldPosition(point: Vec3, node: Node): boolean {
        const uiTransform = node.getComponent(UITransform);
        if (!uiTransform) {
            return false;
        }
        const buttonRect = uiTransform.getBoundingBoxToWorld();
        return buttonRect.contains(new Vec2(point.x, point.y));//
    }
}