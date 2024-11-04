import { _decorator, Component, Node, EventTouch,Vec2, EventTarget, UITransform, Vec3, Canvas, Camera  } from 'cc';
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

    /**
 * 将节点从一个Canvas转换到GameplayCanvas中的坐标
 * @param node 要转换的节点
 * @param fromCanvas 源Canvas
 * @param toCanvas 目标Canvas (GameplayCanvas)
 * @returns 转换后的坐标
 */
    public static convertPositionBetweenCanvas(worldPos: Vec3, fromCanvas: Node, toCanvas: Node): Vec3 {
        // 1. 将世界坐标转换为屏幕坐标
        const camera = fromCanvas.getComponentInChildren(Camera)!;
        const screenPos = camera.worldToScreen(worldPos);

        // 5. 将屏幕坐标转回世界坐标
        const targetCamera = toCanvas.getComponentInChildren(Camera)!;
        const targetWorldPos = targetCamera.screenToWorld(screenPos);

        return targetWorldPos;
    }
}