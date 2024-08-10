import {  _decorator, Component, Node, Sprite, Vec3, Vec2, SpriteFrame, EventTarget,Enum,director   } from 'cc';
import { CooldownComponent } from '../components/CooldownComponent';
import { GrowState, CropType, SharedDefines } from '../misc/SharedDefines';
import { CropDataManager } from '../managers/CropDataManager';
import { PlayerController } from '../controllers/PlayerController';
import { InventoryItem } from '../components/InventoryComponent';
import { ItemDataManager } from '../managers/ItemDataManager';
import { GameController } from '../controllers/GameController';
import { IDraggable } from '../components/DragDropComponent';
import { ResourceManager } from '../managers/ResourceManager';
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
    @property(SpriteFrame)
    public growSprites: SpriteFrame[] = [];
    

    @property(Vec3)
    public bottomOffset: Vec3 = new Vec3(-10, 50, 0);

    @property({
        type: Enum(CropType)
    })
    public cropType: CropType = CropType.CORN;


    private cropDatas: any[] = [];
    private cropDataIndex: number = 0;
    private harvestItemId: string = '';
    private levelRequirement: number = 0;
    private growState:GrowState = GrowState.NONE;
    private static readonly MAX_LEVEL: number = 5;  // 假设最大等级为5

    //getter sourceInventoryItem
    public get SourceInventoryItem(): InventoryItem | null {
        return this.sourceInventoryItem;
    }
    private sourceInventoryItem: InventoryItem | null = null;

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

    public initializeWithInventoryItem(inventoryItem: InventoryItem): void {
        this.sourceInventoryItem = inventoryItem;
        this.initialize(inventoryItem.detailId);
    }

    public initialize(id : string) : void{
        this.currentGrowthStage = 0;
        this.growState = GrowState.NONE;
        this.loadCropData(id);
        if (this.cropDatas.length > this.cropDataIndex) {
            this.setupData(this.cropDatas[this.cropDataIndex]); // 初始化时使用第一级数据
            
        } else {
            console.error(`No crop data found for crop type: ${this.cropType}`);
            return;
        }
        this.updateSprite(`${SharedDefines.WINDOW_GAME_TEXTURES}${this.cropDatas[0].icon}`);
    }

    private loadCropData(id:string): void {
        const cropData = CropDataManager.instance.findCropDataById(id);
        if (!cropData) {
            console.error(`No crop data found for id: ${id}`);
            return;
        }
        this.cropType = parseInt(cropData.crop_type) as CropType;
        this.cropDatas = CropDataManager.instance.filterCropDataByCropType(this.cropType.toString());
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
            this.updateSprite(`${SharedDefines.CROPS_TEXTURES}${this.cropDatas[this.currentGrowthStage].png}`);  // 更新精灵图片
            return true;
        }
        return false;
    }

    public isMaxLevel(): boolean {
        return this.level >= Crop.MAX_LEVEL;
    }

    private updateSprite(pngPath:string): void {
        if (this.sprite ) {
            ResourceManager.instance.loadAsset(pngPath + '/spriteFrame', SpriteFrame).then((texture) => {
                if (texture) {
                    this.sprite.spriteFrame = texture as SpriteFrame;
                }
            });
        }
    }

    internalSetPosition(position: Vec3): void 
    {
        this.node.position = new Vec3(position.x + this.bottomOffset.x, position.y + this.bottomOffset.y, position.z + this.bottomOffset.z);
    }

    //#region IDraggable implementation
    public setPosition(position: Vec3): void {
        this.node.position = position;
    }

    public onDragStart(): void {

    }

    public onDragging(newPosition: Vec3): void {
        this.setPosition(newPosition);
    }

    public onDragEnd(endPosition: Vec3, isDestroy: boolean): boolean {
        if (isDestroy) {
            this.node.destroy();
            return true;
        }
        // this.setPosition(endPosition);
        // this.node.setWorldPosition(endPosition);
        return true;
    }

    //#endregion

    public startGrowing(): void {
        // 在这里添加作物开始生长的逻辑
        console.log(`Crop ${this.id} started growing`);
        this.growState = GrowState.GROWING;
        
        this.updateSprite(`${SharedDefines.CROPS_TEXTURES}${this.cropDatas[this.currentGrowthStage].png}`);
        this.scheduleNextGrowth();
    }

    private scheduleNextGrowth(): void {
        if (!this.isGrowEnd()) {
            this.cooldownComponent?.startCooldown(
                'growth',
                this.growthTime,
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
        this.setupData(this.cropDatas[this.currentGrowthStage]);
        this.updateSprite(`${SharedDefines.CROPS_TEXTURES}${this.cropDatas[this.currentGrowthStage].png}`);
        this.scheduleNextGrowth();
    }

    private onGrowthComplete(): void {
        console.log(`Crop ${this.id} has completed growing`);
        this.growState = GrowState.HARVESTING;
        this.eventTarget.emit(Crop.growthCompleteEvent, this);
        this.node.on(Node.EventType.TOUCH_END, this.harvest, this);
    }

    public harvest():void
    {
        if (this.growState != GrowState.HARVESTING || this.harvestItemId == "") {
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

        this.growState = GrowState.NONE;
        this.eventTarget.emit(SharedDefines.EVENT_CROP_HARVEST, this);
        this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
        //destroy node
        this.node.destroy();
    }
}
