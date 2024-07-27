import { _decorator, Component, Node, Sprite, Vec3, Vec2  } from 'cc';
import { IDraggable } from '../components/DragDropComponent';
const { ccclass, property } = _decorator;

@ccclass('Crop')
export class Crop extends Component implements IDraggable {
    @property
    public id: string = '';

    @property
    public level: number = 1;

    @property
    public price: number = 0;

    @property
    public yieldAmount: number = 0;

    @property
    public yieldInterval: number = 0;  // 以秒为单位

    @property
    public growthTime: number = 0;     // 以秒为单位

    @property
    public harvestTime: number = 0;    // 以秒为单位

    @property(Sprite)
    public sprite: Sprite | null = null;

    private static readonly MAX_LEVEL: number = 5;  // 假设最大等级为5

    private isDragging: boolean = false;
    private originalParent: Node | null = null;
    private originalPosition: Vec3 | null = null;

    public calculateYield(time: number): number {
        const intervals = Math.floor(time / this.yieldInterval);
        return intervals * this.yieldAmount;
    }

    public upgrade(): boolean {
        if (this.level < Crop.MAX_LEVEL) {
            this.level++;
            // 这里可以添加升级后的属性变化逻辑
            this.price *= 1.5;  // 价格增加50%
            this.yieldAmount *= 1.2;  // 产量增加20%
            this.updateSprite();  // 更新精灵图片
            return true;
        }
        return false;
    }

    public isMaxLevel(): boolean {
        return this.level >= Crop.MAX_LEVEL;
    }

    private updateSprite(): void {
        // 这里需要实现根据 id 和 level 更新 sprite 的逻辑
        // 可能需要使用资源加载系统来动态加载新的精灵图片
    }

    // 用于在游戏运行时动态创建 Crop 实例
    public static create(
        id: string,
        level: number,
        price: number,
        yieldAmount: number,
        yieldInterval: number,
        growthTime: number,
        harvestTime: number
    ): Crop {
        const node = new Node('Crop');
        const crop = node.addComponent(Crop);
        crop.id = id;
        crop.level = level;
        crop.price = price;
        crop.yieldAmount = yieldAmount;
        crop.yieldInterval = yieldInterval;
        crop.growthTime = growthTime;
        crop.harvestTime = harvestTime;
        return crop;
    }

    onDragStart(): void {
        this.isDragging = true;
        this.originalParent = this.node.parent;
        this.originalPosition = this.node.position.clone();
        if (this.sprite) {
            this.sprite.opacity = 180;
        }
    }

    onDragging(newPosition: Vec3): void {
        this.node.position = newPosition;
    }

    onDragEnd(endPosition: Vec3): boolean {
        this.isDragging = false;
        this.node.position = endPosition;
        if (this.sprite) {
            this.sprite.opacity = 255;
        }
        return true; // 允许放置
    }

    public returnToOriginalPosition(): void {
        if (this.originalParent && this.originalPosition) {
            this.node.parent = this.originalParent;
            this.node.position = this.originalPosition;
        }
    }

    public startGrowing(): void {
        // 在这里添加作物开始生长的逻辑
        console.log(`Crop ${this.id} started growing`);
        // 可以在这里启动一个计时器来模拟生长过程
    }
}
