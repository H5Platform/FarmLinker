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
        this.baseSpritePath = SharedDefines.CROPS_TEXTURES;
        this.loadEntityData(id);
        if (this.growthStages.length > 0) {
            this.setupData(this.growthStages[0]);
           // this.updateSprite(`${this.baseSpritePath}${this.growthStages[0].png}`);
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
        this.growthTime = parseFloat(cropData.time_min) * SharedDefines.TIME_MINUTE;
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