// Animal.ts

import { _decorator, Component, Node, Sprite, SpriteFrame, EventTarget, Vec3, director, Director } from 'cc';
import { CooldownComponent } from '../components/CooldownComponent';
import { GrowState, SharedDefines, SceneItem, CommandState, SceneItemState, CommandType, NetworkCleanseResult, NetworkTreatResult, NetworkCareResult } from '../misc/SharedDefines';
import { AnimalDataManager } from '../managers/AnimalDataManager';
import { ResourceManager } from '../managers/ResourceManager';
import { IDraggable } from '../components/DragDropComponent';
import { InventoryItem } from '../components/InventoryComponent';
import { GameController } from '../controllers/GameController';
import { ItemDataManager } from '../managers/ItemDataManager';
import { NetworkManager } from '../managers/NetworkManager';
import { DateHelper } from '../helpers/DateHelper';
import { GrowthableEntity } from './GrowthableEntity';
import { PlayerController } from '../controllers/PlayerController';

const { ccclass, property } = _decorator;

@ccclass('Animal')
export class Animal extends GrowthableEntity {


    @property
    public animalType: string = '';

    private gameController: GameController;
    private playerController: PlayerController;

    protected onLoad(): void {
        
        //find game controller by class
        this.gameController = director.getScene().getComponentInChildren(GameController);
        this.playerController = this.gameController.getPlayerController();

       
    }

    public initialize(id: string): void {
        this.baseSpritePath = SharedDefines.ANIMALS_TEXTURES;
        this.loadEntityData(id);
        if (this.growthStages.length > 0) {
            this.setupData(this.growthStages[0]);
           // this.updateSprite(`${this.baseSpritePath}${this.growthStages[0].png}`);
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
        this.growthTime = parseFloat(animalData.time_min) * SharedDefines.TIME_MINUTE;
        this.harvestItemId = animalData.harvest_item_id;
        this.farmType = animalData.farm_type;
        this.timeMin = parseFloat(animalData.time_min);
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

            this.stopDiseaseStatusUpdates();
            
        }
        else{
            console.error(`Animal ${this.node.name} harvest failed`);
        }
        this.node.off(Node.EventType.TOUCH_END, this.harvest, this);
        this.node.destroy();
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
                    //this.cleanse(result.data.cleanse_count);
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
        //log all variables
        console.log(`canCare: ${this.sceneItem.state} ${this.CareCount} ${this.lastCareTime} ${SharedDefines.CARE_COOLDOWN} ${Date.now() / 1000}`);
        return this.sceneItem.state !== SceneItemState.Dead && this.CareCount < SharedDefines.MAX_ANIMAL_CARE_COUNT && this.lastCareTime + SharedDefines.CARE_COOLDOWN < Date.now() / 1000;
    }

    public canTreat(): boolean {
        return this.sceneItem.state !== SceneItemState.Dead && this.TreatCount < SharedDefines.MAX_ANIMAL_TREAT_COUNT && this.lastTreatTime + SharedDefines.TREAT_COOLDOWN < Date.now() / 1000;
    }

    public canCleanse(): boolean {
        return this.sceneItem.state !== SceneItemState.Dead && this.CleanseCount < SharedDefines.MAX_ANIMAL_CLEANSE_COUNT && this.lastCleanseTime + SharedDefines.CLEANSE_COOLDOWN < Date.now() / 1000;
    }

    public async care(): Promise<NetworkCareResult> {
        let result: NetworkCareResult | null = null;
        //check friendId is valid
        result = await NetworkManager.instance.care(this.sceneItem.id);
        if(result && result.success){
            this.CareCount = result.data.care_count;
            this.lastCareTime = Date.now() / 1000;
        }
        return result;
    }

    public async careByFriend(friendId: string): Promise<NetworkCareResult> {
        let result: NetworkCareResult | null = null;
        //check friendId is valid
        result = await NetworkManager.instance.careFriend(this.sceneItem.id, friendId);
        if(result && result.success){
            this.CareCount = result.data.care_count;
            this.lastCareTime = Date.now() / 1000;
        }
        return result;
    }
    public async treat(): Promise<NetworkTreatResult> {
        let result: NetworkTreatResult | null = null;
        //check friendId is valid
        result = await NetworkManager.instance.treat(this.sceneItem.id);
        if(result && result.success){
            this.TreatCount = result.data.treat_count;
            this.lastTreatTime = Date.now() / 1000;
        }
        return result;
    }  

    public async treatByFriend(friendId: string): Promise<NetworkTreatResult> {
        let result: NetworkTreatResult | null = null;
        //check friendId is valid
        result = await NetworkManager.instance.treatFriend(this.sceneItem.id, friendId);
        if(result && result.success){
            this.TreatCount = result.data.treat_count;
            this.lastTreatTime = Date.now() / 1000;
        }
        return result;
    }

    public async cleanse(): Promise<NetworkCleanseResult> {
        let result: NetworkCleanseResult | null = null;
        //check friendId is valid

        result = await NetworkManager.instance.cleanse(this.sceneItem.id);
        if(result && result.success){
            this.CleanseCount = result.data.cleanse_count;
            this.lastCleanseTime = Date.now() / 1000;
        }
        return result;
    }
    public async cleanseByFriend(friendId: string): Promise<NetworkCleanseResult> {
        let result: NetworkCleanseResult | null = null;
        //check friendId is valid
        result = await NetworkManager.instance.cleanseFriend(this.sceneItem.id, friendId);
        if(result && result.success){
            this.CleanseCount = result.data.cleanse_count;
            this.lastCleanseTime = Date.now() / 1000;
        }
        return result;
    }
}