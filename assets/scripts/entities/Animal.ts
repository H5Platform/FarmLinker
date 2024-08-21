// Animal.ts

import { _decorator, Component, Node, Sprite, SpriteFrame, EventTarget, Vec3, director } from 'cc';
import { CooldownComponent } from '../components/CooldownComponent';
import { GrowState, SharedDefines, SceneItem, CommandState } from '../misc/SharedDefines';
import { AnimalDataManager } from '../managers/AnimalDataManager';
import { ResourceManager } from '../managers/ResourceManager';
import { IDraggable } from '../components/DragDropComponent';
import { InventoryItem } from '../components/InventoryComponent';
import { GameController } from '../controllers/GameController';
import { ItemDataManager } from '../managers/ItemDataManager';
import { NetworkManager } from '../managers/NetworkManager';
import { DateHelper } from '../helpers/DateHelper';

const { ccclass, property } = _decorator;

@ccclass('Animal')
export class Animal extends Component implements IDraggable {
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

    @property
    public gridCapacity: string = '';

    @property(Sprite)
    public sprite: Sprite | null = null;

    private growthStages: any[] = [];
    private currentGrowthStageIndex: number = 0;

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
    private growState: GrowState = GrowState.NONE;
    private harvestItemId: string = '';

    public static readonly growthCompleteEvent = 'growthComplete';
    public eventTarget: EventTarget = new EventTarget();

    private sceneItem: SceneItem | null = null;
    private totalGrowthTime: number = 0;
    private growthStartTime: number = 0;

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

    public initialize(animalId: string): void {
        this.currentGrowthStageIndex = 0;
        this.growState = GrowState.NONE;
        this.loadAnimalData(animalId);
        if (this.growthStages.length > 0) {
            this.setupData(this.growthStages[0]);
        } else {
            console.error(`No growth stages found for animal with id: ${animalId}`);
        }
        this.updateSprite(`${SharedDefines.WINDOW_SHOP_TEXTURES}${this.sourceInventoryItem.iconName}`);
    }

    public initializeWithSceneItem(sceneItem: SceneItem): void {
        this.sceneItem = sceneItem;
        this.growState = GrowState.NONE;
        this.loadAnimalData(sceneItem.item_id);
        
        if (this.growthStages.length > 0) {
            this.setupDataFromSceneItem(sceneItem);
        } else {
            console.error(`No growth stages found for animal with id: ${sceneItem.item_id}`);
        }
    }

    private loadAnimalData(id: string): void {
        const baseAnimalData = AnimalDataManager.instance.findAnimalDataById(id);
        if (!baseAnimalData) {
            console.error(`No animal data found for id: ${id}`);
            return;
        }
    
        const animalType = baseAnimalData.animal_type; 
        this.growthStages = AnimalDataManager.instance.filterAnimalDataByAnimalType(animalType);
    }

    private setupData(animalData: any): void {
        this.id = animalData.id;
        this.description = animalData.description;
        this.growthTime = parseInt(animalData.time_min) * SharedDefines.TIME_MINUTE;
        this.harvestItemId = animalData.harvest_item_id;
        this.farmType = animalData.farm_type;
        this.timeMin = parseInt(animalData.time_min);
        this.levelNeed = parseInt(animalData.level_need);
        this.gridCapacity = animalData.grid_capacity;
    }

    private setupDataFromSceneItem(sceneItem: SceneItem): void {
        this.id = sceneItem.item_id;
        this.totalGrowthTime = this.calculateTotalGrowthTime();
        this.growthStartTime = DateHelper.stringToDate(sceneItem.command.start_time).getTime() / 1000;
        const remainingTime = this.calculateRemainingTime();
        console.log(`Total growth time: ${this.totalGrowthTime}, remainingGrowthTime = ${remainingTime}`);
        this.currentGrowthStageIndex = this.calculateCurrentStage(remainingTime);
        console.log(`Current stage: ${this.currentGrowthStageIndex}`);
        this.setupData(this.growthStages[this.currentGrowthStageIndex]);
        this.growthTime = remainingTime * SharedDefines.TIME_MINUTE;
    }

    private calculateTotalGrowthTime(): number {
        return this.growthStages.reduce((total, data) => total + parseInt(data.time_min), 0);
    }

    private calculateRemainingTime(): number {
        const currentTime = Date.now() / 1000; // current time in seconds
        const elapsedTime = (currentTime - this.growthStartTime) / 60; // elapsed time in minutes
        return Math.max(0, this.totalGrowthTime - elapsedTime);
    }

    private calculateCurrentStage(remainingTime: number): number {
        const elapsedTime = this.totalGrowthTime - remainingTime;
        let accumulatedTime = 0;
        for (let i = 0; i < this.growthStages.length; i++) {
            accumulatedTime += parseInt(this.growthStages[i].time_min);
            if (accumulatedTime > elapsedTime) {
                return i;
            }
        }
        return this.growthStages.length - 1;
    }

    private updateSprite(pngPath: string): void {
        if (this.sprite) {
            ResourceManager.instance.loadAsset(pngPath + '/spriteFrame', SpriteFrame).then((texture) => {
                if (texture) {
                    this.sprite.spriteFrame = texture as SpriteFrame;
                }
            });
        }
    }

    private isGrowEnd(): boolean {
        return this.growthTime == 0;
    }

    public startGrowing(): void {
        console.log(`Animal ${this.id} started growing`);
        if (this.sceneItem) {
            if (this.sceneItem.command.state === CommandState.Complete) {
                this.onGrowthComplete();
            } else if (this.sceneItem.command.state === CommandState.InProgress) {
                this.continueGrowing(this.sceneItem);
            }
        } else {
            this.growState = GrowState.GROWING;
            this.updateSprite(`${SharedDefines.ANIMALS_TEXTURES}${this.growthStages[this.currentGrowthStageIndex].png}`);
            this.requestNextGrowth();
        }
    }

    private continueGrowing(sceneItem: SceneItem): void {
        console.log(`Animal ${this.id} continued growing this.currentGrowthStageIndex:${this.currentGrowthStageIndex}`);
        this.growState = GrowState.GROWING;
        this.updateSprite(`${SharedDefines.ANIMALS_TEXTURES}${this.growthStages[this.currentGrowthStageIndex].png}`);
        this.scheduleNextGrowth();
    }

    private scheduleNextGrowth(): void {
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

    private async requestNextGrowth(): Promise<void> {
        console.log(`Animal ${this.id}: Requesting next growth`);
        try {
            const latestDuration = await this.getLatestCommandDuration();
            if (latestDuration !== null) {
                this.updateGrowthTimes(latestDuration);
            }

            const remainingTime = this.calculateRemainingTime();
            console.log(`Animal ${this.id}: Remaining time: ${remainingTime} minutes`);
            if (remainingTime <= 0 && this.isGrowEnd()) {
                this.onGrowthComplete();
            } else {
                console.log(`Animal ${this.id}: Starting cooldown for ${remainingTime} minutes`);
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

    private updateGrowthTimes(latestDuration: number): void {
        const elapsedTime = latestDuration / 60; // convert to minutes
        const remainingTime = this.calculateRemainingTime();
        
        console.log(`Animal ${this.id}: Updating growth times. Elapsed time: ${elapsedTime} minutes, Remaining time: ${remainingTime} minutes`);
        
        this.currentGrowthStageIndex = this.calculateCurrentStage(remainingTime);
        console.log(`Animal ${this.id}: Current growth stage calculated: ${this.currentGrowthStageIndex}`);

        if (this.currentGrowthStageIndex >= this.growthStages.length) {
            this.currentGrowthStageIndex = this.growthStages.length - 1;
            console.log(`Animal ${this.id}: All stages completed. Setting to final stage: ${this.currentGrowthStageIndex}`);
        }

        this.setupData(this.growthStages[this.currentGrowthStageIndex]);
        console.log(`Animal ${this.id}: Setup data for stage ${this.currentGrowthStageIndex}`);
        
        const newSpritePath = `${SharedDefines.ANIMALS_TEXTURES}${this.growthStages[this.currentGrowthStageIndex].png}`;
        console.log(`Animal ${this.id}: Updating sprite to ${newSpritePath}`);
        this.updateSprite(newSpritePath);
    }

    private grow(): void {
        this.currentGrowthStageIndex++;
        this.setupData(this.growthStages[this.currentGrowthStageIndex]);
        this.updateSprite(`${SharedDefines.ANIMALS_TEXTURES}${this.growthStages[this.currentGrowthStageIndex].png}`);
        this.requestNextGrowth();
    }

    private onGrowthComplete(): void {
        console.log(`Animal ${this.id} has completed growing`);
        this.growState = GrowState.HARVESTING;
        this.eventTarget.emit(Animal.growthCompleteEvent, this);
        this.node.on(Node.EventType.TOUCH_END, this.harvest, this);
    }

    private async getLatestCommandDuration(): Promise<number | null> {
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

    // IDraggable implementation
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

    public async harvest(): Promise<void> {
        if (this.growState != GrowState.HARVESTING || this.harvestItemId == "") {
            console.error(`Animal ${this.node.name} is not ready to harvest`);
            return;
        }

        const result = await NetworkManager.instance.harvest(this.sceneItem.command_id, this.sceneItem.item_id, this.sceneItem.type);
        if (result) {
            this.growState = GrowState.NONE;
            this.eventTarget.emit(SharedDefines.EVENT_ANIMAL_HARVEST, this);
            this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
            this.node.destroy();
        } else {
            console.error(`Animal ${this.node.name} harvest failed`);
        }
    }
}