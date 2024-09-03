// Animal.ts

import { _decorator, Component, Node, Sprite, SpriteFrame, EventTarget, Vec3, director } from 'cc';
import { CooldownComponent } from '../components/CooldownComponent';
import { GrowState, SharedDefines, SceneItem, CommandState, SceneItemState, CommandType } from '../misc/SharedDefines';
import { AnimalDataManager } from '../managers/AnimalDataManager';
import { ResourceManager } from '../managers/ResourceManager';
import { IDraggable } from '../components/DragDropComponent';
import { InventoryItem } from '../components/InventoryComponent';
import { GameController } from '../controllers/GameController';
import { ItemDataManager } from '../managers/ItemDataManager';
import { NetworkManager } from '../managers/NetworkManager';
import { DateHelper } from '../helpers/DateHelper';
import { GrowthableEntity } from './GrowthableEntity';

const { ccclass, property } = _decorator;

@ccclass('Animal')
export class Animal extends GrowthableEntity {
    @property
    public animalType: string = '';

    public initialize(id: string): void {
        this.loadEntityData(id);
        if (this.growthStages.length > 0) {
            this.setupData(this.growthStages[0]);
        } else {
            console.error(`No growth stages found for animal with id: ${id}`);
        }
    }

    public initializeWithSceneItem(sceneItem: SceneItem,isPlayerOwner:boolean): void {
        this.baseSpritePath = SharedDefines.ANIMALS_TEXTURES;
        super.initializeWithSceneItem(sceneItem,isPlayerOwner);
        
    }

    protected loadEntityData(id: string): void {
        const baseAnimalData = AnimalDataManager.instance.findAnimalDataById(id);
        if (!baseAnimalData) {
            console.error(`No animal data found for id: ${id}`);
            return;
        }
    
        const animalType = baseAnimalData.animal_type; 
        this.growthStages = AnimalDataManager.instance.filterAnimalDataByAnimalType(animalType);
    }

    protected setupData(animalData: any): void {
        this.id = animalData.id;
        this.description = animalData.description;
        this.growthTime = parseInt(animalData.time_min) * SharedDefines.TIME_MINUTE;
        this.harvestItemId = animalData.harvest_item_id;
        this.farmType = animalData.farm_type;
        this.timeMin = parseInt(animalData.time_min);
        this.levelNeed = parseInt(animalData.level_need);
    }

    public canHarvest(): boolean {
        return (this.growState == GrowState.HARVESTING || this.sceneItem.state == SceneItemState.Dead) && this.harvestItemId != "" && this.isPlayerOwner;
    }

    public async harvest(): Promise<void> {
        if (!this.canHarvest()) {
            console.error(`Animal ${this.node.name} is not ready to harvest`);
            return;
        }

        const result = await NetworkManager.instance.harvest(this.sceneItem.id, this.sceneItem.item_id, this.sceneItem.type);
        if(result){
            this.growState = GrowState.NONE;
            this.eventTarget.emit(SharedDefines.EVENT_ANIMAL_HARVEST, this);
            this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
            this.stopDiseaseStatusUpdates();
            this.node.destroy();
            return;
        }
        else{
            console.error(`Animal ${this.node.name} harvest failed`);
            return;
        }
    }

    // Any additional Animal-specific methods can be added here

    public canPerformOperation(operation: CommandType): boolean {
        switch (operation) {
            case CommandType.Care:
                return this.canCare();
            case CommandType.Treat:
                return this.canTreat();
            case CommandType.Cleanse:
                return this.canCleanse();
            default:
                return false;
        }
    }

    public async performOperation(operation: CommandType): Promise<void> {
        const sceneItem = this.SceneItem;
        if (!sceneItem) return;

        let result: NetworkCareResult | NetworkTreatResult | NetworkCleanseResult | null = null;
        switch (operation) {
            case CommandType.Care:
                result = await NetworkManager.instance.care(sceneItem.id);
                if (result && result.success) {
                    this.CareCount = result.data.care_count;
                }
                break;
            case CommandType.Treat:
                result = await NetworkManager.instance.treat(sceneItem.id);
                if (result && result.success) {
                    this.TreatCount = result.data.treat_count;
                }
                break;
            case CommandType.Cleanse:
                result = await NetworkManager.instance.cleanse(sceneItem.id);
                if (result && result.success) {
                    this.cleanse(result.data.cleanse_count);
                }
                break;
        }

        if (result && result.success && result.data.friend_id) {
            console.log(`Operation ${operation} on friend's animal, friend_id = ${result.data.friend_id}, diamond_added = ${result.data.diamond_added}`);
            this.playerController.playerState.addDiamond(result.data.diamond_added);
            this.playerController.friendState.addDiamond(result.data.diamond_added);
        }
    }

    public canCare(): boolean {
        return this.growState !== GrowState.NONE && this.CareCount < SharedDefines.MAX_CARE_COUNT;
    }

    public canTreat(): boolean {
        return this.isSick && this.TreatCount < SharedDefines.MAX_TREAT_COUNT;
    }

    public canCleanse(): boolean {
        return this.isDirty && this.CleanseCount < SharedDefines.MAX_CLEANSE_COUNT;
    }
}