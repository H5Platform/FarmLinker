import {  _decorator, Component, Node, Sprite, Vec3, Vec2, SpriteFrame, EventTarget  } from 'cc';
import { CooldownComponent } from '../components/CooldownComponent';
import { SharedDefines } from '../misc/SharedDefines';
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
    @property(SpriteFrame)
    public growSprites: SpriteFrame[] = [];

    @property(Vec3)
    public bottomOffset: Vec3 = new Vec3(-10, 50, 0);

    private static readonly MAX_LEVEL: number = 5;  // 假设最大等级为5

    private isDragging: boolean = false;
    private originalParent: Node | null = null;
    private originalPosition: Vec3 | null = null;

    private cooldownComponent: CooldownComponent | null = null;
    private currentGrowthStage: number = 0;

    public static readonly growthCompleteEvent = 'growthComplete';
    public eventTarget: EventTarget = new EventTarget();

    protected onLoad(): void {
        this.node.mobility = 2;
        this.cooldownComponent = this.getComponent(CooldownComponent);
        if (!this.cooldownComponent) {
            this.cooldownComponent = this.addComponent(CooldownComponent);
        }
    }

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
        if (this.sprite && this.currentGrowthStage < this.growSprites.length) {
            this.sprite.spriteFrame = this.growSprites[this.currentGrowthStage];
        }
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

    setPosition(position: Vec3): void 
    {
        this.node.position = new Vec3(position.x + this.bottomOffset.x, position.y + this.bottomOffset.y, position.z + this.bottomOffset.z);
    }

    public startGrowing(): void {
        // 在这里添加作物开始生长的逻辑
        console.log(`Crop ${this.id} started growing`);
        this.currentGrowthStage = 0;
        this.updateSprite();
        this.scheduleNextGrowth();
    }

    private scheduleNextGrowth(): void {
        if (this.currentGrowthStage < SharedDefines.CROP_GROWTH_STAGES - 1) {
            this.cooldownComponent?.startCooldown(
                'growth',
                SharedDefines.CROP_GROWTH_TIME,
                () => this.grow()
            );
        } else {
            this.onGrowthComplete();
        }
    }

    private grow(): void {
        this.currentGrowthStage++;
        this.updateSprite();
        this.scheduleNextGrowth();
    }

    private onGrowthComplete(): void {
        console.log(`Crop ${this.id} has completed growing`);
        this.eventTarget.emit(Crop.growthCompleteEvent, this);
    }
}
