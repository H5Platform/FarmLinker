import { _decorator, Component, Node, Sprite, SpriteFrame, EventTarget, Vec3 } from 'cc';
import { GrowState, SceneItem, CommandState, SceneItemState, CommandType, SharedDefines } from '../misc/SharedDefines';
import { CooldownComponent } from '../components/CooldownComponent';
import { InventoryItem } from '../components/InventoryComponent';
import { ResourceManager } from '../managers/ResourceManager';
import { IDraggable } from '../components/DragDropComponent';
import { NetworkManager } from '../managers/NetworkManager';
import { DateHelper } from '../helpers/DateHelper';

const { ccclass, property } = _decorator;

@ccclass('FarmEntity')
export abstract class FarmEntity extends Component implements IDraggable {
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

    protected growthStages: any[] = [];
    protected currentGrowthStageIndex: number = 0;

    protected sourceInventoryItem: InventoryItem | null = null;
    protected cooldownComponent: CooldownComponent | null = null;
    protected growState: GrowState = GrowState.NONE;
    protected harvestItemId: string = '';
    protected baseSpritePath: string = '';

    public static readonly growthCompleteEvent = 'growthComplete';
    public eventTarget: EventTarget = new EventTarget();

    protected sceneItem: SceneItem | null = null;
    protected totalGrowthTime: number = 0;
    protected growthStartTime: number = 0;
    protected isSick: boolean = false;

    @property
    protected careCount: number = 0;
    @property
    protected treatCount: number = 0;
    @property
    protected cleanseCount: number = 0;

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
        this.sourceInventoryItem = inventoryItem;
        this.initialize(inventoryItem.detailId);
    }

    public abstract initialize(id: string): void;

    public initializeWithSceneItem(sceneItem: SceneItem): void {
        this.sceneItem = sceneItem;
        this.growState = GrowState.NONE;
        this.loadEntityData(sceneItem.item_id);
        
        if (this.growthStages.length > 0) {
            this.setupDataFromSceneItem(sceneItem);
        } else {
            console.error(`No growth stages found for entity with id: ${sceneItem.item_id}`);
            return;
        }

        this.scheduleDiseaseStatusUpdate();
    }

    protected abstract loadEntityData(id: string): void;

    protected abstract setupData(entityData: any): void;

    protected setupDataFromSceneItem(sceneItem: SceneItem): void {
        this.id = sceneItem.item_id;
        this.careCount = sceneItem.commands && sceneItem.commands.find(command => command.type === CommandType.Care)?.count || 0;
        this.treatCount = sceneItem.commands && sceneItem.commands.find(command => command.type === CommandType.Treat)?.count || 0;
        this.cleanseCount = sceneItem.commands && sceneItem.commands.find(command => command.type === CommandType.Cleanse)?.count || 0;
        this.updateTotalGrowthTime();
        this.growthStartTime = DateHelper.stringToDate(sceneItem.last_updated_time).getTime() / 1000;
        const remainingTime = this.calculateRemainingTime();
        this.currentGrowthStageIndex = this.calculateCurrentStage(remainingTime);
        this.setupData(this.growthStages[this.currentGrowthStageIndex]);
        this.growthTime = remainingTime * SharedDefines.TIME_MINUTE;
    }

    protected updateTotalGrowthTime(): void {
        let baseTime = this.growthStages.reduce((total, data) => total + parseInt(data.time_min), 0);
        let careReduction = SharedDefines.CARE_TIME_RATIO_REDUCE * this.careCount;
        let treatReduction = SharedDefines.TREAT_TIME_RATIO_REDUCE * this.treatCount;
        this.totalGrowthTime = baseTime * (1 - (careReduction + treatReduction));
    }

    protected calculateRemainingTime(): number {
        const currentTime = Date.now() / 1000;
        const elapsedTime = (currentTime - this.growthStartTime) / 60;
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
                accumulatedTime += parseInt(this.growthStages[i].time_min);
                if (elapsedTime >= accumulatedTime) {
                    expectedStageIndex = i;
                }
            }
        }
        return expectedStageIndex;
    }

    protected async updateSprite(pngPath: string): Promise<void> {
        if (this.sprite) {
            ResourceManager.instance.loadAsset(pngPath + '/spriteFrame', SpriteFrame).then((texture) => {
                if (texture) {
                    this.sprite.spriteFrame = texture as SpriteFrame;
                }
            });
        }
    }

    public startGrowing(): void {
        if (this.sceneItem) {
            if (this.sceneItem.state === SceneItemState.Complete) {
                this.onGrowthComplete();
            } else if (this.sceneItem.state === SceneItemState.InProgress) {
                this.continueGrowing(this.sceneItem);
            }
        } else {
            this.growState = GrowState.GROWING;
            
            this.updateSprite(`${this.baseSpritePath}${this.growthStages[this.currentGrowthStageIndex].png}`);
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
        try {
            const latestDuration = await this.getLatestCommandDuration();
            if (latestDuration !== null) {
                this.updateGrowthTimes(latestDuration);
            }

            this.updateTotalGrowthTime();
            const remainingTime = this.calculateRemainingTime();
            if (remainingTime <= 0 && this.isGrowEnd()) {
                this.onGrowthComplete();
            } else {
                this.cooldownComponent?.startCooldown(
                    'growth',
                    remainingTime * SharedDefines.TIME_MINUTE,
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
        
        const newSpritePath = `${SharedDefines.WINDOW_SHOP_TEXTURES}${this.growthStages[this.currentGrowthStageIndex].png}`;
        this.updateSprite(newSpritePath);
    }

    protected grow(): void {
        this.currentGrowthStageIndex++;
        this.setupData(this.growthStages[this.currentGrowthStageIndex]);
        this.updateSprite(`${SharedDefines.WINDOW_SHOP_TEXTURES}${this.growthStages[this.currentGrowthStageIndex].png}`);
        this.requestNextGrowth();
    }

    protected onGrowthComplete(): void {
        this.growState = GrowState.HARVESTING;
        this.eventTarget.emit(FarmEntity.growthCompleteEvent, this);
        this.node.on(Node.EventType.TOUCH_END, this.harvest, this);
    }

    protected async getLatestCommandDuration(): Promise<number | null> {
        if (!this.sceneItem?.id) {
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
        this.CooldownComponent?.removeCooldown('growth');
        this.growState = GrowState.NONE;
    }

    public abstract harvest(): Promise<void>;

    protected isGrowEnd(): boolean {
        return this.growthTime == 0;
    }

    private async updateDiseaseStatus(updateDiseaseTimes:number = 1): Promise<void> {
        if (!this.sceneItem || !this.sceneItem.id) {
            console.warn('Cannot update disease status: Scene item or ID is not set');
            return;
        }

        try {
            const result = await NetworkManager.instance.updateDiseaseStatus(this.sceneItem.id, updateDiseaseTimes);
            if (result && result.success) {
                if (result.is_sick) {
                    this.isSick = true;
                    console.log(`Entity ${this.id} has become sick`);
                }
            }
        } catch (error) {
            console.error('Failed to update disease status:', error);
        }

        this.scheduleDiseaseStatusUpdate();
    }

    protected scheduleDiseaseStatusUpdate(): void {
        if(this.isSick){
            this.stopDiseaseStatusUpdates();
            return;
        }
        const currentTime = Date.now() / 1000;
        const interval = SharedDefines.DISEASE_STATUS_UPDATE_INTERVAL;

        const diseaseCommand = this.sceneItem?.commands.find(cmd => cmd.type === CommandType.Disease);
        if(diseaseCommand && diseaseCommand.state === CommandState.InProgress){
            this.isSick = true;
            console.log(`Entity ${this.id} has become sick`);
        }
        else{
            this.isSick = false;
        }
        const lastUpdateTime = diseaseCommand 
            ? DateHelper.stringToDate(diseaseCommand.last_updated_time).getTime() / 1000
            : DateHelper.stringToDate(this.sceneItem?.last_updated_time || '').getTime() / 1000;

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

    public cleanse(immunityDuration: number): void {
        this.isSick = false;
        this.unschedule(this.updateDiseaseStatus);
        this.scheduleOnce(() => {
            this.scheduleDiseaseStatusUpdate();
        }, immunityDuration * 3600);
    }

    protected onDestroy(): void {
        this.stopDiseaseStatusUpdates();
        this.stopGrowth();
        this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
    }
}