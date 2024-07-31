import {  _decorator, Component, Node, Sprite, Vec3, Vec2, SpriteFrame, EventTarget,Enum,director   } from 'cc';
import { CooldownComponent } from '../components/CooldownComponent';
import { CropState, CropType, SharedDefines } from '../misc/SharedDefines';
import { CropDataManager } from '../managers/CropDataManager';
import { PlayerController } from '../controllers/PlayerController';
import { InventoryItem } from '../components/InventoryComponent';
import { ItemDataManager } from '../managers/ItemDataManager';
import { GameController } from '../controllers/GameController';
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

    @property({
        type: Enum(CropType)
    })
    public cropType: CropType = CropType.CORN;


    private cropData: any[] = [];
    private cropDataIndex: number = 0;
    private harvestItemId: string = '';
    private levelRequirement: number = 0;
    private cropState:CropState = CropState.NONE;
    private static readonly MAX_LEVEL: number = 5;  // 假设最大等级为5

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

    public initialize() : void{
        this.currentGrowthStage = 0;
        this.cropState = CropState.NONE;
        this.loadCropData();
        if (this.cropData.length > this.cropDataIndex) {
            this.setupData(this.cropData[this.cropDataIndex]); // 初始化时使用第一级数据
        } else {
            console.error(`No crop data found for crop type: ${this.cropType}`);
            return;
        }
    }

    private loadCropData(): void {
        this.cropData = CropDataManager.instance.filterCropDataByCropType(this.cropType.toString());
       // this.cropData.sort((a, b) => parseInt(a.id) - parseInt(b.id)); 
    }

    private setupData(cropData: any): void 
    {
        this.id = cropData.id;
        this.growthTime = cropData.time_min /* SharedDefines.TIME_MINUTE*/;
        this.harvestItemId = cropData.harvest_item_id;
        this.levelRequirement = cropData.level_need;
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

    setPosition(position: Vec3): void 
    {
        this.node.position = new Vec3(position.x + this.bottomOffset.x, position.y + this.bottomOffset.y, position.z + this.bottomOffset.z);
    }

    public startGrowing(): void {
        // 在这里添加作物开始生长的逻辑
        console.log(`Crop ${this.id} started growing`);
        this.cropState = CropState.GROWING;
        this.updateSprite();
        this.scheduleNextGrowth();
    }

    private scheduleNextGrowth(): void {
        if (!this.isGrowEnd()) {
            this.cooldownComponent?.startCooldown(
                'growth',
                SharedDefines.CROP_GROWTH_TIME,
                () => this.grow()
            );
        } else {
            this.onGrowthComplete();
        }
    }

    private isGrowEnd(): boolean 
    {
        return this.growthTime == 0;
    }

    private grow(): void {
        this.currentGrowthStage++;
        this.setupData(this.cropData[this.currentGrowthStage]);
        this.updateSprite();
        this.scheduleNextGrowth();
    }

    private onGrowthComplete(): void {
        console.log(`Crop ${this.id} has completed growing`);
        this.cropState = CropState.HARVESTING;
        this.eventTarget.emit(Crop.growthCompleteEvent, this);
        this.node.on(Node.EventType.TOUCH_END, this.harvest, this);
    }

    public harvest():void
    {
        if (this.cropState != CropState.HARVESTING || this.harvestItemId == "") {
            console.error(`Crop ${this.node.name} is not ready to harvest`);
            return;
        }

        //get item by itemdatamanager
        const item = ItemDataManager.instance.getItemById(this.harvestItemId);
        if (!item) {
            console.error(`Item ${this.harvestItemId} not found`);
            return;
        }

        //find gamecontroller in scene
        const gameControllerNode = director.getScene()?.getChildByName('GameController');
        if (gameControllerNode) {
            const gameController = gameControllerNode.getComponent(GameController);
            if (!gameController) {
                console.error('GameController not found');
                return;
            }
            const playerController = gameController.getPlayerController();
            if (!playerController) {
                console.error('PlayerController not found');
                return;
            }
            playerController.playerState.addExperience(parseInt(item.exp_get));
            const inventoryItem = new InventoryItem(item);
            playerController.inventoryComponent.addItem(inventoryItem);
        }

        this.cropState = CropState.NONE;
        this.eventTarget.emit(SharedDefines.EVENT_CROP_HARVEST, this);
        this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
        //destroy node
        this.node.destroy();
    }
}
