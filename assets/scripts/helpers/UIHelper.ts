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

        // 3. 将屏幕坐标标准化（转换为0-1之间的值）
        const fromUI = fromCanvas.getComponent(UITransform)!;
        const normalizedPos = new Vec3(
            screenPos.x / fromUI.width,
            screenPos.y / fromUI.height,
            0
        );

        // 4. 将标准化坐标转换为目标Canvas的坐标
        const toUI = toCanvas.getComponent(UITransform)!;
        const targetPos = new Vec3(
            normalizedPos.x * toUI.width,
            normalizedPos.y * toUI.height,
            0
        );

        // 5. 将屏幕坐标转回世界坐标
        const targetCamera = toCanvas.getComponentInChildren(Camera)!;
        const targetWorldPos = targetCamera.screenToWorld(targetPos);

        return targetWorldPos;
    }
}