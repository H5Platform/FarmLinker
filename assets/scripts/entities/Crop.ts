import {  _decorator, Component, Node, Sprite, Vec3, Vec2, SpriteFrame, EventTarget,Enum,director   } from 'cc';
import { CooldownComponent } from '../components/CooldownComponent';
import { GrowState, CropType, SharedDefines, SceneItem, CommandState, SceneItemState, CommandType, DiseaseState, NetworkCareResult, NetworkTreatResult, NetworkCleanseResult } from '../misc/SharedDefines';
import { CropDataManager } from '../managers/CropDataManager';
import { PlayerController } from '../controllers/PlayerController';
import { InventoryItem } from '../components/InventoryComponent';
import { ItemDataManager } from '../managers/ItemDataManager';
import { GameController } from '../controllers/GameController';
import { IDraggable } from '../components/DragDropComponent';
import { ResourceManager } from '../managers/ResourceManager';
import { NetworkManager } from '../managers/NetworkManager';
import { DateHelper } from '../helpers/DateHelper';
import { GrowthableEntity } from './GrowthableEntity';
const { ccclass, property } = _decorator;

@ccclass('Crop')
export class Crop extends GrowthableEntity {
    
    @property({
        type: Enum(CropType)
    })
    public cropType: CropType = CropType.CORN;

    private cropDatas: any[] = [];
    private cropDataIndex: number = 0;

    public initialize(id: string): void {
        this.loadEntityData(id);
        if (this.growthStages.length > 0) {
            this.setupData(this.growthStages[0]);
        } else {
            console.error(`No growth stages found for crop with id: ${id}`);
        }
       // this.updateSprite(`${SharedDefines.WINDOW_GAME_TEXTURES}${this.cropDatas[0].icon}`);
    }

    public initializeWithSceneItem(sceneItem: SceneItem,isPlayerOwner:boolean): void 
    {
        this.baseSpritePath = SharedDefines.CROPS_TEXTURES;
        super.initializeWithSceneItem(sceneItem,isPlayerOwner);
    }

    protected loadEntityData(id: string): void {
        const cropData = CropDataManager.instance.findCropDataById(id);
        if (!cropData) {
            console.error(`No crop data found for id: ${id}`);
            return;
        }
        this.cropType = parseInt(cropData.crop_type) as CropType;
        this.growthStages = CropDataManager.instance.filterCropDataByCropType(this.cropType.toString());
    }

    protected setupData(cropData: any): void {
        this.id = cropData.id;
        this.growthTime = cropData.time_min * SharedDefines.TIME_MINUTE;
        this.harvestItemId = cropData.harvest_item_id;
        this.levelNeed = cropData.level_need;
    }

    public canHarvest(): boolean {
        //log states
        console.log(`Crop ${this.node.name} growState = ${this.growState}, sceneItem.state = ${this.sceneItem.state}, harvestItemId = ${this.harvestItemId}`);
        return (this.growState == GrowState.HARVESTING || this.sceneItem.state == SceneItemState.Dead) && this.harvestItemId != "" && this.isPlayerOwner;
    }

    public async harvest(): Promise<void> {
        console.log(`Crop ${this.node.name} harvest`);
        if(!this.canHarvest()){
            console.error(`Crop ${this.node.name} harvest failed`);
            return;
        }
        
        const result = await NetworkManager.instance.harvest(this.sceneItem.id, this.sceneItem.item_id, this.sceneItem.type);
        if(result){
            this.growState = GrowState.NONE;
            this.eventTarget.emit(SharedDefines.EVENT_CROP_HARVEST, this);
            this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
            this.stopDiseaseStatusUpdates();
            this.node.destroy();
            return;
        }
        else{
            console.error(`Crop ${this.node.name} harvest failed`);
            return;
        }
    }

    public canCare(): boolean {
        return this.careCount >= 0 && this.careCount < SharedDefines.MAX_CROP_CARE_COUNT && this.lastCareTime + SharedDefines.CARE_COOLDOWN < Date.now() / 1000;
    }

    public canTreat(): boolean {
        return this.treatCount >= 0 && this.treatCount < SharedDefines.MAX_CROP_TREAT_COUNT && this.lastTreatTime + SharedDefines.TREAT_COOLDOWN < Date.now() / 1000;
    }

    public canCleanse(): boolean {
        return this.cleanseCount >= 0 && this.cleanseCount < SharedDefines.MAX_CROP_CLEANSE_COUNT && this.lastCleanseTime + SharedDefines.CLEANSE_COOLDOWN < Date.now() / 1000;
    }

    public async care(): Promise<NetworkCareResult|null> {
        if(!this.canCare()){
            return null;
        }

        const careResult:NetworkCareResult = await NetworkManager.instance.care(this.sceneItem.id);
        
        if (careResult.success) {
            this.CareCount = careResult.data.care_count;
            this.lastCareTime = Date.now() / 1000;
            return careResult;
        }
        else {
            console.log("Care failed");
           
        }
        return null;
        
    }
    public async careByFriend(friendId: string): Promise<NetworkCareResult|null> {
        if(!this.canCare()){
            return null;
        }
        const careResult:NetworkCareResult = await NetworkManager.instance.careFriend(this.sceneItem.id,friendId);

        if(careResult.success){
            this.CareCount = careResult.data.care_count;
            this.lastCareTime = Date.now() / 1000;
            if(careResult.data.friend_id){
                console.log(`care friend , name = ${careResult.data.friend_id} , friend_id = ${friendId} , diamond_added = ${careResult.data.diamond_added}`);
                
                //await this.playDiamondCollectionEffect(careResult.data.diamond_added);
            }
            return careResult;
        }
        else{
            console.log("Care failed");
        }
        return null;
    }

    public async treat(): Promise<NetworkTreatResult|null> {
        if(!this.canTreat()){
            return null;
        }
        const treatResult:NetworkTreatResult = await NetworkManager.instance.treat(this.sceneItem.id);
        if(treatResult.success){
            this.TreatCount = treatResult.data.treat_count;
            this.lastTreatTime = Date.now() / 1000;
            return treatResult;
        }
        else{
            console.log("Treat failed");
        }
        return null;
    }
    public async treatByFriend(friendId: string): Promise<NetworkTreatResult|null> {
        if(!this.canTreat()){
            return null;
        }
        const treatResult:NetworkTreatResult = await NetworkManager.instance.treatFriend(this.sceneItem.id,friendId);
        if(treatResult.success){
            this.TreatCount = treatResult.data.treat_count;
            this.lastTreatTime = Date.now() / 1000;
            if(treatResult.data.friend_id){
                console.log(`treat friend , name = ${treatResult.data.friend_id} , friend_id = ${friendId} , diamond_added = ${treatResult.data.diamond_added}`);
            }
            return treatResult;
        }
        else{
            console.log("Treat failed");
        }
        return null;
    }
    public async cleanse(): Promise<NetworkCleanseResult|null> {
        if(!this.canCleanse()){
            return null;
        }
        const cleanseResult:NetworkCleanseResult = await NetworkManager.instance.cleanse(this.sceneItem.id);
        if(cleanseResult.success){
            this.CleanseCount = cleanseResult.data.cleanse_count;
            this.lastCleanseTime = Date.now() / 1000;
            return cleanseResult;
        }
        else{
            console.log("Cleanse failed");
        }
        return null;
    }
    public async cleanseByFriend(friendId: string): Promise<NetworkCleanseResult|null> {
        if(!this.canCleanse()){
            return null;
        }
        const cleanseResult:NetworkCleanseResult = await NetworkManager.instance.cleanseFriend(this.sceneItem.id,friendId);
        if(cleanseResult.success){
            this.CleanseCount = cleanseResult.data.cleanse_count;
            this.lastCleanseTime = Date.now() / 1000;
            return cleanseResult;
        }
        else{
            console.log("Cleanse failed");
        }
        return null;
    }
}

/*
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
    private isSick: boolean = false;
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
    //getter sceneItem
    public get SceneItem(): SceneItem | null {
        return this.sceneItem;
    }

    //getter careCount
    public get CareCount(): number {
        return this.careCount;
    }
    public set CareCount(value: number) {
        if (this.careCount !== value) {
            this.careCount = value;
            this.stopGrowth();
            this.updateTotalGrowthTime();
            this.requestNextGrowth();
        }
    }
    private careCount: number = 0;


    //getter treatCount
    public get TreatCount(): number {
        return this.treatCount;
    }
    public set TreatCount(value: number) {
        if (this.treatCount !== value) {
            this.treatCount = value;
            this.stopGrowth();
            this.updateTotalGrowthTime();
            this.requestNextGrowth();
        }
    }
    private treatCount: number = 0;

        //getter cleanseCount
    public get CleanseCount(): number {
        return this.cleanseCount;
    }
    public set CleanseCount(value: number) {
        if (this.cleanseCount !== value) {
            this.cleanseCount = value;
            this.stopGrowth();
            this.updateTotalGrowthTime();
            this.requestNextGrowth();
        }
    }
    private cleanseCount: number = 0;

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
        
        // Start the disease status update cycle
        this.scheduleDiseaseStatusUpdate();
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
        
        this.careCount = sceneItem.commands && sceneItem.commands.find(command => command.type === CommandType.Care)?.count || 0;
        console.log(`Crop ${this.id}: Care count: ${this.careCount}`);
        this.treatCount = sceneItem.commands && sceneItem.commands.find(command => command.type === CommandType.Treat)?.count || 0;
        console.log(`Crop ${this.id}: Treat count: ${this.treatCount}`);
        this.cleanseCount = sceneItem.commands && sceneItem.commands.find(command => command.type === CommandType.Cleanse)?.count || 0;
        console.log(`Crop ${this.id}: Cleanse count: ${this.cleanseCount}`);
        this.updateTotalGrowthTime();
        console.log(`Crop ${this.id}: last_update_time: ${sceneItem.last_updated_time}`);
        this.growthStartTime = DateHelper.stringToDate(sceneItem.last_updated_time).getTime() / 1000;
        const remainingTime = this.calculateRemainingTime();
        console.log(`Total growth time: ${this.totalGrowthTime}, remainingGrowthTime = ${remainingTime}`);
        this.cropDataIndex = this.calculateCurrentStage(remainingTime);
        console.log(`Current stage: ${this.cropDataIndex}`);
        this.setupData(this.cropDatas[this.cropDataIndex]);
        this.growthTime = remainingTime * SharedDefines.TIME_MINUTE;
    }

    private updateTotalGrowthTime(): void {
        let baseTime = this.cropDatas.reduce((total, data) => total + parseInt(data.time_min), 0);
        let careReduction = SharedDefines.CARE_TIME_RATIO_REDUCE * this.careCount;
        let treatReduction = SharedDefines.TREAT_TIME_RATIO_REDUCE * this.treatCount;
        this.totalGrowthTime = baseTime * (1 - (careReduction + treatReduction));
        console.log(`Crop ${this.id}: Updated total growth time to ${this.totalGrowthTime} minutes`);
    }

    private calculateRemainingTime(): number {
        const currentTime = Date.now() / 1000; // 当前时间（秒）
        const elapsedTime = (currentTime - this.growthStartTime) / SharedDefines.TIME_MINUTE; 
        return Math.max(0, this.totalGrowthTime - elapsedTime);
    }

    private calculateCurrentStage(remainingTime: number): number {
        const elapsedTime = this.totalGrowthTime - remainingTime;
        console.log(`Crop ${this.id}: Elapsed time: ${elapsedTime} minutes`);
        let accumulatedTime = 0;
        let exptectedStageIndex = 0;
        if (elapsedTime >= this.totalGrowthTime) {
            exptectedStageIndex = this.cropDatas.length - 1;
            console.log(`Crop ${this.id}: Fully grown, expected stage index: ${exptectedStageIndex}`);
        } else {
            for (let i = 0; i < this.cropDatas.length; i++) {
                accumulatedTime += parseInt(this.cropDatas[i].time_min);
                if (elapsedTime >= accumulatedTime) {
                    exptectedStageIndex = i;
                    console.log(`Crop ${this.id}: Expected stage index: ${exptectedStageIndex}, accumulatedTime: ${accumulatedTime}, elapsedTime: ${elapsedTime}`);
                }
            }
        }
        return exptectedStageIndex;
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
            if (this.sceneItem.state === SceneItemState.Complete) {
                this.onGrowthComplete();
            } else if (this.sceneItem.state === SceneItemState.InProgress) {
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
                this.growState = GrowState.GROWING;
                console.log(`Crop ${this.id}: Starting cooldown for ${remainingTime} minutes`);
                this.cooldownComponent?.startCooldown(
                    'growth',
                    remainingTime * SharedDefines.TIME_MINUTE,
                    () => this.grow()
                );
            }
        } catch (error) {
            console.error('Failed to get latest command duration:', error);
            // 如果获取失败，使用当前的remainingGrowthTime
            const remainingTime = this.calculateRemainingTime();
            this.growState = GrowState.GROWING;
            this.cooldownComponent?.startCooldown(
                'growth',
                remainingTime * SharedDefines.TIME_MINUTE,
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
        if ((this.growState != GrowState.HARVESTING && this.sceneItem.state != SceneItemState.Dead) || this.harvestItemId == "") {
            console.error(`Crop ${this.node.name} is not ready to harvest`);
            return;
        }

        const result = await NetworkManager.instance.harvest( this.sceneItem.id,this.sceneItem.item_id,this.sceneItem.type);
        if(result){
            this.growState = GrowState.NONE;
            this.eventTarget.emit(SharedDefines.EVENT_CROP_HARVEST, this);
            this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
            this.stopDiseaseStatusUpdates();
            this.node.destroy();
            return;
        }
        else{
            console.error(`Crop ${this.node.name} harvest failed`);
            return;
        }
        
    }

    public stopGrowth(): void {
        console.log(`Crop ${this.id}: Stopping growth`);
        this.CooldownComponent?.removeCooldown('growth');
        this.growState = GrowState.NONE;
    }

    private async updateDiseaseStatus(updateDiseaseTimes:number = 1): Promise<void> {
        if (!this.sceneItem || !this.sceneItem.id) {
            console.warn('Cannot update disease status: Scene item or ID is not set');
            return;
        }

        try {
            const result = await NetworkManager.instance.updateDiseaseStatus(this.sceneItem.id,updateDiseaseTimes);
            if (result && result.success) {
                // Handle the updated disease status
                if (result.is_sick) {
                    // Implement logic for when the crop becomes sick
                    this.isSick = true;
                    console.log(`Crop ${this.id} has become sick`);
                }
            }
        } catch (error) {
            console.error('Failed to update disease status:', error);
        }

        // Schedule the next update
        this.scheduleDiseaseStatusUpdate();
    }

    private scheduleDiseaseStatusUpdate(): void {
        if(this.isSick){
            this.stopDiseaseStatusUpdates();
            return;
        }
        const currentTime = Date.now() / 1000;
        let nextUpdateTime = SharedDefines.DISEASE_STATUS_UPDATE_INTERVAL;

        const diseaseCommand = this.sceneItem?.commands.find(cmd => cmd.type === CommandType.Disease);
        if(diseaseCommand && diseaseCommand.state === CommandState.InProgress){
            this.isSick = true;
        }
        else{
            this.isSick = false;
        }
        console.log(`isSick = ${this.isSick}`);
        const lastUpdateTime = diseaseCommand 
            ? DateHelper.stringToDate(diseaseCommand.last_updated_time).getTime() / 1000
            : DateHelper.stringToDate(this.sceneItem?.last_updated_time || '').getTime() / 1000;

        const timeSinceLastUpdate = currentTime - lastUpdateTime;
        const missedIntervals = Math.floor(timeSinceLastUpdate / SharedDefines.DISEASE_STATUS_UPDATE_INTERVAL);
        
        if(missedIntervals > 0){
            //Put missedIntervals as parameter to server
            //update missedIntervals times disease status to see if crop is sick
            this.updateDiseaseStatus(missedIntervals);
        }
        nextUpdateTime = Math.max(0, SharedDefines.DISEASE_STATUS_UPDATE_INTERVAL - timeSinceLastUpdate);
        console.log(`Disease nextUpdateTIme:${nextUpdateTime}`);
        this.unschedule(this.updateDiseaseStatus);
        this.scheduleOnce(this.updateDiseaseStatus, nextUpdateTime);
    }

    public stopDiseaseStatusUpdates(): void {
        this.unschedule(this.updateDiseaseStatus);
    }

    public cleanse(immunityDuration: number): void {
        this.isSick = false;
        //this.updateSprite(`${SharedDefines.CROPS_TEXTURES}${this.growthStages[this.currentGrowthStageIndex].png}`);
        
        // Schedule immunity
        this.unschedule(this.updateDiseaseStatus);
        this.scheduleOnce(() => {
            this.scheduleDiseaseStatusUpdate();
        }, immunityDuration * 3600); // Convert hours to seconds
    }

    protected onDestroy(): void {
        this.stopDiseaseStatusUpdates();
        // Any other cleanup code...
    }
}
*/