import { _decorator, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Crop')
export class Crop extends Component {
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
}
