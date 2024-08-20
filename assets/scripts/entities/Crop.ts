import {  _decorator, Component, Node, Sprite, Vec3, Vec2, SpriteFrame, EventTarget,Enum,director   } from 'cc';
import { CooldownComponent } from '../components/CooldownComponent';
import { GrowState, CropType, SharedDefines, SceneItem, CommandState } from '../misc/SharedDefines';
import { CropDataManager } from '../managers/CropDataManager';
import { PlayerController } from '../controllers/PlayerController';
import { InventoryItem } from '../components/InventoryComponent';
import { ItemDataManager } from '../managers/ItemDataManager';
import { GameController } from '../controllers/GameController';
import { IDraggable } from '../components/DragDropComponent';
import { ResourceManager } from '../managers/ResourceManager';
import { NetworkManager } from '../managers/NetworkManager';
import { DateHelper } from '../helpers/DateHelper';
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

    //getter cooldownComponent
    public get CooldownComponent(): CooldownComponent | null {
        if (!this.cooldownComponent) {
            this.cooldownComponent = this.getComponent(CooldownComponent);
            if (!this.cooldownComponent) {
                this.cooldownComponent = this.addComponent(CooldownComponent);
            }
        }
        return this.cooldownComponent;
    }
    private cooldownComponent: CooldownComponent | null = null;
    private currentGrowthStage: number = 0;
    private totalGrowthTime: number = 0;
    private growthStartTime: number = 0;

    private sceneItem: SceneItem | null = null;

    public static readonly growthCompleteEvent = 'growthComplete';
    public eventTarget: EventTarget = new EventTarget();

    protected onLoad(): void {
        this.node.mobility = 2;
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

    public initializeWithSceneItem(sceneItem: SceneItem): void {
        console.log(`Crop initialized with scene item`,sceneItem);
        this.sceneItem = sceneItem;
        this.growState = GrowState.NONE;
        this.loadCropData(sceneItem.item_id);
        
        if (this.cropDatas.length > 0) {
            this.setupDataFromSceneItem(sceneItem);
        } else {
            console.error(`No crop data found for crop type: ${this.cropType}`);
            return;
        }
        
    }

    private loadCropData(id:string): void {
        const cropData = CropDataManager.instance.findCropDataById(id);
        if (!cropData) {
            console.error(`No crop data found for id: ${id}`);
            return;
        }
        this.cropType = parseInt(cropData.crop_type) as CropType;
        this.cropDatas = CropDataManager.instance.filterCropDataByCropType(this.cropType.toString());
    }

    private setupData(cropData: any): void 
    {
        this.id = cropData.id;
        this.growthTime = cropData.time_min * SharedDefines.TIME_MINUTE;
        this.harvestItemId = cropData.harvest_item_id;
        this.levelRequirement = cropData.level_need;
    }

    private setupDataFromSceneItem(sceneItem: SceneItem): void {
        this.id = sceneItem.item_id;
        this.totalGrowthTime = this.calculateTotalGrowthTime();
        this.growthStartTime = DateHelper.stringToDate(sceneItem.command.start_time).getTime() / 1000;
        const remainingTime = this.calculateRemainingTime();
        console.log(`Total growth time: ${this.totalGrowthTime}, remainingGrowthTime = ${remainingTime}`);
        this.cropDataIndex = this.calculateCurrentStage(remainingTime);
        console.log(`Current stage: ${this.cropDataIndex}`);
        this.setupData(this.cropDatas[this.cropDataIndex]);
        this.growthTime = remainingTime * SharedDefines.TIME_MINUTE;
    }

    private calculateTotalGrowthTime(): number {
        return this.cropDatas.reduce((total, data) => total + parseInt(data.time_min), 0);
    }

    private calculateRemainingTime(): number {
        const currentTime = Date.now() / 1000; // 当前时间（秒）
        const elapsedTime = (currentTime - this.growthStartTime) / SharedDefines.TIME_MINUTE; 
        return Math.max(0, this.totalGrowthTime - elapsedTime);
    }

    private calculateCurrentStage(remainingTime: number): number {
        const elapsedTime = this.totalGrowthTime - remainingTime;
        let accumulatedTime = 0;
        for (let i = 0; i < this.cropDatas.length; i++) {
            accumulatedTime += parseInt(this.cropDatas[i].time_min);
            if (accumulatedTime > elapsedTime) {
                return i;
            }
        }
        return this.cropDatas.length - 1;
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
        return true;
    }

    //#endregion

    private async getLatestCommandDuration(): Promise<number | null> {
        if (!this.sceneItem.id) {
            console.warn('Scene item ID is not set');
            return null;
        }

        try {
            const response = await NetworkManager.instance.getLatestCommandDuration(this.sceneItem.id);
            if (response.success) {
                return response.duration;
            } else {
                console.warn('Failed to get latest command duration:', response.message);
                return null;
            }
        } catch (error) {
            console.error('Error getting latest command duration:', error);
            return null;
        }
    }

    public startGrowing(): void {
        console.log(`Crop ${this.id} started growing`);
        if(this.sceneItem)
        {
            if (this.sceneItem.command.state === CommandState.Complete) {
                this.onGrowthComplete();
            } else if (this.sceneItem.command.state === CommandState.InProgress) {
                this.continueGrowing(this.sceneItem);
            }
        }
        else{
            this.growState = GrowState.GROWING;
            this.updateSprite(`${SharedDefines.CROPS_TEXTURES}${this.cropDatas[this.currentGrowthStage].png}`);
            this.requestNextGrowth();
        }
    }

    private continueGrowing(sceneItem: SceneItem): void {
        console.log(`Crop ${this.id} continued growing this.cropDataIndex:${this.cropDataIndex}`);
        this.growState = GrowState.GROWING;
        this.updateSprite(`${SharedDefines.CROPS_TEXTURES}${this.cropDatas[this.cropDataIndex].png}`);
        this.scheduleNextGrowth();
    }

    private scheduleNextGrowth(): void {
        console.log(`Crop ${this.id}: Scheduling next growth , isGrowEnd:${this.isGrowEnd()} , growthTime:${this.growthTime}`);
        if (!this.isGrowEnd()) {
            this.CooldownComponent?.startCooldown(
                'growth',
                this.growthTime,
                () => this.grow()
            );
        } else {
            this.onGrowthComplete();
        }
    }

    private async requestNextGrowth(): Promise<void> {
        console.log(`Crop ${this.id}: Requesting next growth`);
        try {
            const latestDuration = await this.getLatestCommandDuration();
            if (latestDuration !== null) {
                this.updateGrowthTimes(latestDuration);
            }

            const remainingTime = this.calculateRemainingTime();
            console.log(`Crop ${this.id}: Remaining time: ${remainingTime} minutes`);
            if (remainingTime <= 0 && this.isGrowEnd()) {
                this.onGrowthComplete();
            } else {
                console.log(`Crop ${this.id}: Starting cooldown for ${remainingTime} minutes`);
                this.cooldownComponent?.startCooldown(
                    'growth',
                    remainingTime,
                    () => this.grow()
                );
            }
        } catch (error) {
            console.error('Failed to get latest command duration:', error);
            // 如果获取失败，使用当前的remainingGrowthTime
            this.cooldownComponent?.startCooldown(
                'growth',
                this.calculateRemainingTime(),
                () => this.grow()
            );
        }
    }

    private updateGrowthTimes(latestDuration: number): void {
        const elapsedTime = latestDuration / 60; // 转换为分钟
        const remainingTime = this.calculateRemainingTime();
        
        console.log(`Crop ${this.id}: Updating growth times. Elapsed time: ${elapsedTime} minutes, Remaining time: ${remainingTime} minutes`);
        
        // 更新当前生长阶段
        this.currentGrowthStage = this.calculateCurrentStage(remainingTime);
        console.log(`Crop ${this.id}: Current growth stage calculated: ${this.currentGrowthStage}`);

        // 如果所有阶段都已完成
        if (this.currentGrowthStage >= this.cropDatas.length) {
            this.currentGrowthStage = this.cropDatas.length - 1;
            console.log(`Crop ${this.id}: All stages completed. Setting to final stage: ${this.currentGrowthStage}`);
        }

        this.setupData(this.cropDatas[this.currentGrowthStage]);
        console.log(`Crop ${this.id}: Setup data for stage ${this.currentGrowthStage}`);
        
        const newSpritePath = `${SharedDefines.CROPS_TEXTURES}${this.cropDatas[this.currentGrowthStage].png}`;
        console.log(`Crop ${this.id}: Updating sprite to ${newSpritePath}`);
        this.updateSprite(newSpritePath);
    }

    private isGrowEnd(): boolean 
    {
        return this.growthTime == 0;
    }

    private grow(): void {
        console.log(`Crop ${this.id}: grow start ...`);
        this.currentGrowthStage++;
        this.setupData(this.cropDatas[this.currentGrowthStage]);
        this.updateSprite(`${SharedDefines.CROPS_TEXTURES}${this.cropDatas[this.currentGrowthStage].png}`);
        this.requestNextGrowth();
    }

    private onGrowthComplete(): void {
        console.log(`Crop ${this.id} has completed growing`);
        this.growState = GrowState.HARVESTING;
        this.eventTarget.emit(Crop.growthCompleteEvent, this);
        this.node.on(Node.EventType.TOUCH_END, this.harvest, this);
    }

    public async harvest():Promise<void>
    {
        if (this.growState != GrowState.HARVESTING || this.harvestItemId == "") {
            console.error(`Crop ${this.node.name} is not ready to harvest`);
            return;
        }

        const result = await NetworkManager.instance.harvest( this.sceneItem.command_id,this.sceneItem.item_id,this.sceneItem.type);
        if(result){
            this.growState = GrowState.NONE;
            this.eventTarget.emit(SharedDefines.EVENT_CROP_HARVEST, this);
            this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
            //destroy node
            this.node.destroy();
            return;
        }
        else{
            console.error(`Crop ${this.node.name} harvest failed`);
            return;
        }
        

        // //get item by itemdatamanager
        // const item = ItemDataManager.instance.getItemById(this.harvestItemId);
        // if (!item) {
        //     console.error(`Item ${this.harvestItemId} not found`);
        //     return;
        // }

        // //find gamecontroller in scene
        // const gameControllerNode = director.getScene()?.getChildByName('GameController');
        // if (gameControllerNode) {
        //     const gameController = gameControllerNode.getComponent(GameController);
        //     if (!gameController) {
        //         console.error('GameController not found');
        //         return;
        //     }
        //     const playerController = gameController.getPlayerController();
        //     if (!playerController) {
        //         console.error('PlayerController not found');
        //         return;
        //     }
        //     playerController.playerState.addExperience(parseInt(item.exp_get));
        //     const inventoryItem = new InventoryItem(item);
        //     playerController.inventoryComponent.addItem(inventoryItem);
        // }

        // this.growState = GrowState.NONE;
        // this.eventTarget.emit(SharedDefines.EVENT_CROP_HARVEST, this);
        // this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
        // //destroy node
        // this.node.destroy();
    }
}
