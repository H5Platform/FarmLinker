import { _decorator, Component, Node, Sprite, SpriteFrame, EventTarget, Vec3 } from 'cc';
import { GrowState, SceneItem, CommandState, SceneItemState, CommandType, SharedDefines, NetworkCareResult, NetworkTreatResult, NetworkCleanseResult } from '../misc/SharedDefines';
import { CooldownComponent } from '../components/CooldownComponent';
import { InventoryItem } from '../components/InventoryComponent';
import { ResourceManager } from '../managers/ResourceManager';
import { IDraggable } from '../components/DragDropComponent';
import { NetworkManager } from '../managers/NetworkManager';
import { DateHelper } from '../helpers/DateHelper';
import { SceneEntity } from './SceneEntity';
import { WindowManager } from '../ui/WindowManager';

const { ccclass, property } = _decorator;

@ccclass('GrowthableEntity')
export abstract class GrowthableEntity extends SceneEntity implements IDraggable {

    @property
    public id: string = '';

    @property
    public description: string = '';

    @property
    public farmType: string = '';

    @property
    public timeMin: number = 0;

    @property
    public growthTime: number = 0;     // in seconds

    @property
    public levelNeed: number = 0;

    @property(Sprite)
    public sprite: Sprite | null = null;
    @property(Sprite)
    public sickSprite: Sprite | null = null;
    @property(SpriteFrame)
    public deadSpriteFrame: SpriteFrame | null = null;

    protected growthStages: any[] = [];
    protected currentGrowthStageIndex: number = 0;

    protected sourceInventoryItem: InventoryItem | null = null;
    protected cooldownComponent: CooldownComponent | null = null;
    protected growState: GrowState = GrowState.NONE;
    //getter for harvest item id
    public get HarvestItemId(): string { return this.harvestItemId; }
    protected harvestItemId: string = '';
    protected baseSpritePath: string = '';

    public static readonly growthCompleteEvent = 'growthComplete';
    public eventTarget: EventTarget = new EventTarget();

    protected sceneItem: SceneItem | null = null;
    protected totalGrowthTime: number = 0;
    protected growthStartTime: number = 0;
    protected isSick: boolean = false;
    protected isHarvesting: boolean = false;
    

    @property
    protected careCount: number = 0;
    protected careCooldown: number = 0;
    protected lastCareTime: number = 0;
    @property
    protected treatCount: number = 0;
    protected treatCooldown: number = 0;
    protected lastTreatTime: number = 0;
    @property
    protected cleanseCount: number = 0;
    protected cleanseCooldown: number = 0;
    protected lastCleanseTime: number = 0;

    public get CareCount(): number { return this.careCount; }
    public set CareCount(value: number) {
        if (this.careCount !== value) {
            this.careCount = value;
            this.stopGrowth();
            this.updateTotalGrowthTime();
            this.requestNextGrowth();
        }
    }

    public get TreatCount(): number { return this.treatCount; }
    public set TreatCount(value: number) {
        if (this.treatCount !== value) {
            this.treatCount = value;
            this.stopGrowth();
            this.updateTotalGrowthTime();
            this.requestNextGrowth();
        }
    }

    public get CleanseCount(): number { return this.cleanseCount; }
    public set CleanseCount(value: number) {
        if (this.cleanseCount !== value) {
            this.cleanseCount = value;
            this.stopGrowth();
            this.updateTotalGrowthTime();
            this.requestNextGrowth();
        }
    }

    public get SourceInventoryItem(): InventoryItem | null { return this.sourceInventoryItem; }
    public get CooldownComponent(): CooldownComponent | null {
        if (!this.cooldownComponent) {
            this.cooldownComponent = this.getComponent(CooldownComponent);
            if (!this.cooldownComponent) {
                this.cooldownComponent = this.addComponent(CooldownComponent);
            }
        }
        return this.cooldownComponent;
    }
    public get SceneItem(): SceneItem | null { return this.sceneItem; }

    protected onLoad(): void {
        
        this.cooldownComponent = this.getComponent(CooldownComponent);
        if (!this.cooldownComponent) {
            this.cooldownComponent = this.addComponent(CooldownComponent);
        }
    }

    public initializeWithInventoryItem(inventoryItem: InventoryItem): void {
        this.sickSprite.node.active = false;
        this.sourceInventoryItem = inventoryItem;
        this.init(inventoryItem.detailId,true);
        this.initialize(inventoryItem.detailId);
    }

    public abstract initialize(id: string): void;

    public initializeWithSceneItem(sceneItem: SceneItem,isPlayerOwner:boolean): void {
        console.log(`initializeWithSceneItem , id = ${sceneItem.id}`);
        this.init(sceneItem.id,isPlayerOwner);
        this.sceneItem = sceneItem;
        this.growState = GrowState.NONE;
        this.isPlayerOwner = isPlayerOwner;
        this.loadEntityData(sceneItem.item_id);
        
        if (this.growthStages.length > 0) {
            this.setupDataFromSceneItem(sceneItem);
        } else {
            console.error(`No growth stages found for entity with id: ${sceneItem.item_id}`);
            return;
        }
        //log current growth stage index
        console.log(`current growth stage index: ${this.currentGrowthStageIndex}`);
        this.updateSprite(`${this.baseSpritePath}${this.growthStages[this.currentGrowthStageIndex].png}`);
        if(this.isPlayerOwner){
            //only player owner can update disease status
            let lastUpdateTime = DateHelper.stringToDate(sceneItem.last_updated_time) || new Date();
            if(sceneItem.commands){
                const diseaseCommand = sceneItem.commands.find(command => command.type === CommandType.Disease);
                if(diseaseCommand){
                    lastUpdateTime = DateHelper.stringToDate(diseaseCommand.last_updated_time);
                }
            }
            this.scheduleDiseaseStatusUpdate(lastUpdateTime);
        }
        else{
            //The friends can only see the disease status
           //check sceneItem.commands to see if there is any disease command
            const diseaseCommand = sceneItem.commands.find(command => command.type === CommandType.Disease);
            if (diseaseCommand) {
                this.isSick = diseaseCommand.state === CommandState.InProgress && diseaseCommand.count == 1;
                
                console.log(`Entity ${this.id} has become sick`);
                this.updateEntityState();
            }
            else {
                this.isSick = false;
            }
        }
    }

    protected abstract loadEntityData(id: string): void;

    protected abstract setupData(entityData: any): void;

    protected setupDataFromSceneItem(sceneItem: SceneItem): void {
        this.id = sceneItem.item_id;
        this.careCount = sceneItem.commands && sceneItem.commands.find(command => command.type === CommandType.Care)?.count || 0;
        this.treatCount = sceneItem.commands && sceneItem.commands.find(command => command.type === CommandType.Treat)?.count || 0;
        this.cleanseCount = sceneItem.commands && sceneItem.commands.find(command => command.type === CommandType.Cleanse)?.count || 0;
        console.log(`careCount = ${this.careCount} , treatCount = ${this.treatCount} , cleanseCount = ${this.cleanseCount}`);
        this.updateTotalGrowthTime();
        this.growthStartTime = DateHelper.stringToDate(sceneItem.last_updated_time).getTime() / 1000;
        const remainingTime = this.calculateRemainingTime();
        this.currentGrowthStageIndex = this.calculateCurrentStage(remainingTime);
        this.setupData(this.growthStages[this.currentGrowthStageIndex]);
        this.growthTime = remainingTime ;
        //log growth time
        console.log(`growth time: ${this.growthTime}`);

        if (sceneItem.state === SceneItemState.Dead) {
            this.setDeadState();
        } else {
            this.updateSickState();
        }
    }

    protected updateTotalGrowthTime(): void {
        let baseTime = this.growthStages.reduce((total, data) => total + parseFloat(data.time_min) * SharedDefines.TIME_MINUTE, 0);
        let careReduction = SharedDefines.CARE_TIME_RATIO_REDUCE * this.careCount;
        let treatReduction = SharedDefines.TREAT_TIME_RATIO_REDUCE * this.treatCount;
        this.totalGrowthTime = baseTime * (1 - (careReduction + treatReduction));
        console.log(`[GrowthableEntity:updateTotalGrowthTime] totalGrowthTime = ${this.totalGrowthTime}`);
    }

    protected calculateRemainingTime(): number {
        const currentTime = Date.now() / 1000;
        const elapsedTime = currentTime - this.growthStartTime;
        return Math.max(0, this.totalGrowthTime - elapsedTime);
    }

    protected calculateCurrentStage(remainingTime: number): number {
        const elapsedTime = this.totalGrowthTime - remainingTime;
        let accumulatedTime = 0;
        let expectedStageIndex = 0;
        if (elapsedTime >= this.totalGrowthTime) {
            expectedStageIndex = this.growthStages.length - 1;
        } else {
            for (let i = 0; i < this.growthStages.length; i++) {
                accumulatedTime += parseFloat(this.growthStages[i].time_min) * SharedDefines.TIME_MINUTE;
                if (elapsedTime >= accumulatedTime) {
                    expectedStageIndex = i;
                }
            }
        }
        return expectedStageIndex;
    }

    public async updateSprite(pngPath: string): Promise<void> {
        console.log(`updateSprite start..., pngPath = ${pngPath}`);
        if (this.sprite) {
            if(this.sceneItem?.state === SceneItemState.Dead){
                //this.sprite.spriteFrame = this.deadSpriteFrame;
                this.updateDeadSprite();
            }
            else{
                return ResourceManager.instance.loadAsset(pngPath + '/spriteFrame', SpriteFrame).then((texture) => {
                if (texture) {
                    this.sprite.spriteFrame = texture as SpriteFrame;
                    }
                });
            }
        }
        return Promise.resolve();
    }

    public startGrowing(): void {
        console.log(`start growing currentGrowthStageIndex = ${this.currentGrowthStageIndex} , growthStages.length = ${this.growthStages.length}`);
        if(this.currentGrowthStageIndex < this.growthStages.length){
            this.updateSprite(`${this.baseSpritePath}${this.growthStages[this.currentGrowthStageIndex].png}`);
        }
        if (this.sceneItem) {
            if (this.sceneItem.state === SceneItemState.Complete) {
                this.onGrowthComplete();
            } else if (this.sceneItem.state === SceneItemState.InProgress) {
                this.continueGrowing(this.sceneItem);
            }
            else if(this.sceneItem.state === SceneItemState.Dead){
                this.setDeadState();
            }
        } else {
            this.growState = GrowState.GROWING;
            
            
            this.requestNextGrowth();
        }
    }

    protected continueGrowing(sceneItem: SceneItem): void {
        this.growState = GrowState.GROWING;
        this.updateSprite(`${this.baseSpritePath}${this.growthStages[this.currentGrowthStageIndex].png}`);
        this.scheduleNextGrowth();
    }

    protected scheduleNextGrowth(): void {
        if (!this.isGrowEnd()) {
            this.CooldownComponent.startCooldown(
                'growth',
                this.growthTime,
                () => this.grow()
            );
        } else {
            this.onGrowthComplete();
        }
    }

    protected async requestNextGrowth(): Promise<void> {
        console.log(`request next growth `);
        try {
            const latestDuration = await this.getLatestCommandDuration();
            if (latestDuration !== null) {
                this.updateGrowthTimes(latestDuration);
            }

            this.updateTotalGrowthTime();
            const remainingTime = this.calculateRemainingTime();
            console.log(`remainingTime = ${remainingTime}`);
            if (remainingTime <= 0 && this.isGrowEnd()) {
                this.onGrowthComplete();
            } else {
                this.cooldownComponent?.startCooldown(
                    'growth',
                    remainingTime,
                    () => this.grow()
                );
            }
        } catch (error) {
            console.error('Failed to get latest command duration:', error);
            this.cooldownComponent?.startCooldown(
                'growth',
                this.calculateRemainingTime(),
                () => this.grow()
            );
        }
    }

    protected updateGrowthTimes(latestDuration: number): void {
        const elapsedTime = latestDuration / 60;
        const remainingTime = this.calculateRemainingTime();
        
        this.currentGrowthStageIndex = this.calculateCurrentStage(remainingTime);
        
        if (this.currentGrowthStageIndex >= this.growthStages.length) {
            this.currentGrowthStageIndex = this.growthStages.length - 1;
        }

        this.setupData(this.growthStages[this.currentGrowthStageIndex]);
        
        const newSpritePath = `${this.baseSpritePath}${this.growthStages[this.currentGrowthStageIndex].png}`;
        this.updateSprite(newSpritePath);
    }

    protected grow(): void {
        this.currentGrowthStageIndex++;
        this.setupData(this.growthStages[this.currentGrowthStageIndex]);
        this.updateSprite(`${this.baseSpritePath}${this.growthStages[this.currentGrowthStageIndex].png}`);
        this.requestNextGrowth();
    }

    protected onGrowthComplete(): void {
        console.log(`growth complete , current growth stage index: ${this.currentGrowthStageIndex}`);
        this.growState = GrowState.HARVESTING;
        this.eventTarget.emit(GrowthableEntity.growthCompleteEvent, this);
        if(this.isPlayerOwner){
            this.node.on(Node.EventType.TOUCH_END, this.harvest, this);
        }
        console.log(`growth complete , growState = ${this.growState}`);
    }

    protected async getLatestCommandDuration(): Promise<number | null> {
        if (!this.sceneItem?.id) {
            console.warn('Scene item ID is not set');
            return null;
        }

        try {
            const response = await NetworkManager.instance.getLatestCommandDuration(this.sceneItem.id,!this.isPlayerOwner ? this.sceneItem.userid : null);
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

    public getNode(): Node {
        return this.node;
    }

    public setPosition(position: Vec3): void {
        this.node.position = position;
    }

    public onDragStart(): void {}

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

    public stopGrowth(): void {
        console.log(`stop growth , growState = ${this.growState}`);
        this.CooldownComponent?.removeCooldown('growth');
        this.growState = GrowState.NONE;
    }

    //abstract canHarvest
    public abstract canHarvest(): boolean;
    public abstract harvest(): Promise<void>;
    

    protected isGrowEnd(): boolean {
        return this.growthTime == 0;
    }

    //#region Care, Treat, Cleanse
    public abstract canCare(): boolean;
    public abstract canTreat(): boolean;
    public abstract canCleanse(): boolean;
    public abstract care(): Promise<NetworkCareResult>;
    public abstract careByFriend(friendId: string): Promise<NetworkCareResult>;
    public abstract treat(): Promise<NetworkTreatResult>;
    public abstract treatByFriend(friendId: string): Promise<NetworkTreatResult>;
    public abstract cleanse(): Promise<NetworkCleanseResult>;
    public abstract cleanseByFriend(friendId: string): Promise<NetworkCleanseResult>;
    //#endregion

    private async updateDiseaseStatus(updateDiseaseTimes:number = 1): Promise<void> {
        if (!this.sceneItem || !this.sceneItem.id) {
            console.warn('Cannot update disease status: Scene item or ID is not set');
            return;
        }

        let lastUpdateTime = DateHelper.stringToDate(this.sceneItem?.last_updated_time) || new Date();

        try {
            const result = await NetworkManager.instance.updateDiseaseStatus(this.sceneItem.id, updateDiseaseTimes);
            if (result && result.success) {
                if (result.is_sick) {
                    this.isSick = true;
                    this.updateSickState();
                    console.log(`Entity ${this.id} has become sick`);
                }
                //update last_updated_time for this.sceneItem?.commands.find(cmd => cmd.type === CommandType.Disease)
                const diseaseCommandIndex = this.sceneItem.commands.findIndex(cmd => cmd.type === CommandType.Disease);
                if (diseaseCommandIndex !== -1 && result.last_updated_time) {
                    this.sceneItem.commands[diseaseCommandIndex].last_updated_time = result.last_updated_time;
                    console.log(`update disease status success, last_updated_time = ${result.last_updated_time}`);
                }
                else{
                    console.warn(`update disease status failed , diseaseCommandIndex = ${diseaseCommandIndex} , result.last_updated_time = ${result.last_updated_time}`);
                }
                if(result.last_updated_time){
                    lastUpdateTime = DateHelper.stringToDate(result.last_updated_time);
                }
            }
        } catch (error) {
            console.error('Failed to update disease status:', error);
        }

        this.scheduleDiseaseStatusUpdate(lastUpdateTime);
    }

    protected scheduleDiseaseStatusUpdate(last_updated_time:Date): void {
        if(this.sceneItem?.state === SceneItemState.Dead){
            this.updateEntityState();
            this.stopDiseaseStatusUpdates();
            return;
        }
        const currentTime = Date.now() / 1000;
        const interval = SharedDefines.DISEASE_STATUS_UPDATE_INTERVAL;

        const diseaseCommand = this.sceneItem?.commands.find(cmd => cmd.type === CommandType.Disease);
        if(diseaseCommand && diseaseCommand.state === CommandState.InProgress){
            this.isSick = true;
            this.updateSickState();
            console.log(`Entity ${this.id} has become sick`);
        }
        else{
            this.isSick = false;
            this.updateSickState();
        }

        const lastUpdateTime = last_updated_time.getTime() / 1000;

        const timeSinceLastUpdate = currentTime - lastUpdateTime;
        const missedIntervals = Math.floor(timeSinceLastUpdate / interval);

        if(missedIntervals > 0){
            console.log(`Missed intervals: ${missedIntervals}`);
            this.updateDiseaseStatus(missedIntervals);
        }

        const nextUpdateTime = interval - (timeSinceLastUpdate % interval);
        console.log(`Next disease update time: ${nextUpdateTime}`);
        this.unschedule(this.updateDiseaseStatus);
        this.scheduleOnce(this.updateDiseaseStatus, nextUpdateTime);
    }

    public stopDiseaseStatusUpdates(): void {
        this.unschedule(this.updateDiseaseStatus);
    }

    public setImmunityDuration(immunityDuration: number,lastUpdateTime:Date): void {
        this.isSick = false;
        this.updateSickState();
        this.unschedule(this.updateDiseaseStatus);
        this.scheduleOnce(() => {
            
            this.scheduleDiseaseStatusUpdate(lastUpdateTime);
        }, immunityDuration * 3600);
    }

    protected updateSickState(): void {
        console.log(`updateSickState start..., isSick = ${this.isSick}`);
        if (this.sickSprite) {
            this.sickSprite.node.active = this.isSick;
        }
    }

    protected updateDeadSprite(): void {
        console.log(`updateDeadSprite start..., currentGrowthStageIndex = ${this.currentGrowthStageIndex} , growthStages.length = ${this.growthStages.length}`);

        if (this.sprite && this.deadSpriteFrame) {
            this.sprite.spriteFrame = this.deadSpriteFrame;
        }
    }

    protected setDeadState(): void {
        console.log(`setDeadState start ...`);
        // if (this.sprite && this.deadSpriteFrame) {
        //     this.sprite.spriteFrame = this.deadSpriteFrame;
        // }
        if(this.currentGrowthStageIndex < this.growthStages.length){
            // this.updateSprite(`${this.baseSpritePath}${this.growthStages[this.currentGrowthStageIndex].png}`);
            const pngPath = `${this.baseSpritePath}${this.growthStages[this.currentGrowthStageIndex].png}`;
             ResourceManager.instance.loadAsset(pngPath + '/spriteFrame', SpriteFrame).then((texture) => {
             if (texture) {
                 this.sprite.spriteFrame = texture as SpriteFrame;
                 }
             });
        }
        this.updateDeadSprite();
        this.isSick = false;
        this.updateSickState();
        this.growState = GrowState.NONE;
        this.stopGrowth();
        this.stopDiseaseStatusUpdates();
    }

    public updateEntityState(): void {
        if (this.sceneItem) {
            if (this.sceneItem.state === SceneItemState.Dead) {
                this.setDeadState();
            } else {
                this.updateSickState();
            }
        }
    }

    protected notifyPlayExpEffect(expValue: number): void {
        const gameWindow = WindowManager.instance.getWindow(SharedDefines.WINDOW_GAME_NAME);
        if (gameWindow) {
            gameWindow.node.emit(SharedDefines.EVENT_PLAY_EXP_EFFECT, {
                expValue: expValue,
                expNode: this.node
            });
        }
    }

    protected onDestroy(): void {
        this.stopDiseaseStatusUpdates();
        //this.stopGrowth();
        if(this.isPlayerOwner){
            this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
        }
    }
}