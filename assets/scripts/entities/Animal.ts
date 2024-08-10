// Animal.ts

import { _decorator, Component, Node, Sprite, SpriteFrame, EventTarget, Vec3, director } from 'cc';
import { CooldownComponent } from '../components/CooldownComponent';
import { GrowState, SharedDefines } from '../misc/SharedDefines';
import { AnimalDataManager } from '../managers/AnimalDataManager';
import { ResourceManager } from '../managers/ResourceManager';
import { IDraggable } from '../components/DragDropComponent';
import { InventoryItem } from '../components/InventoryComponent';
import { GameController } from '../controllers/GameController';
import { ItemDataManager } from '../managers/ItemDataManager';
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
    public growthTime: number = 0;     // 以秒为单位

    @property
    public levelNeed: number = 0;

    @property
    public gridCapacity: string = '';

    @property(Sprite)
    public sprite: Sprite | null = null;

    private growthStages: any[] = [];
    private currentGrowthStageIndex: number = 0;

    //getter sourceInventoryItem
    public get SourceInventoryItem(): InventoryItem | null {
        return this.sourceInventoryItem;
    }
    private sourceInventoryItem: InventoryItem | null = null;

    private cooldownComponent: CooldownComponent | null = null;
    private growState:GrowState = GrowState.NONE;
    private harvestItemId: string = '';

    public static readonly growthCompleteEvent = 'growthComplete';
    public eventTarget: EventTarget = new EventTarget();

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
        // const animalData = AnimalDataManager.instance.findAnimalDataById(animalId);
        // if (!animalData) {
        //     console.error(`No animal data found for id: ${animalId}`);
        //     return;
        // }

        // this.id = animalData.id;
        // this.name = animalData.name;
        // this.description = animalData.description;
        // this.farmType = animalData.farm_type;
        // this.timeMin = parseInt(animalData.time_min);
        // this.levelNeed = parseInt(animalData.level_need);
        // this.gridCapacity = animalData.grid_capacity;

        // this.updateSprite(animalData.png);
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

    private loadAnimalData(id: string): void {
        const baseAnimalData = AnimalDataManager.instance.findAnimalDataById(id);
        if (!baseAnimalData) {
            console.error(`No animal data found for id: ${id}`);
            return;
        }
    
        // 加载所有生长阶段
        const animalType = baseAnimalData.animal_type; 
        this.growthStages = AnimalDataManager.instance.filterAnimalDataByAnimalType(animalType);
    }

    private setupData(animalData: any): void {
        this.id = animalData.id;
        this.name = animalData.name;
        this.description = animalData.description;
        this.growthTime = parseInt(animalData.time_min) /* SharedDefines.TIME_MINUTE*/;
        this.harvestItemId = animalData.harvest_item_id;
        this.farmType = animalData.farm_type;
        this.timeMin = parseInt(animalData.time_min);
        this.levelNeed = parseInt(animalData.level_need);
        this.gridCapacity = animalData.grid_capacity;
    }

    private updateSprite(pngPath:string): void {
        //TODO 目前字段定义有问题，需要修改，暂时先不管。
        //这里的pngName实际是AnimalData中的png字段，与Items表中的png字段不一致。
        if (this.sprite) {
            ResourceManager.instance.loadAsset(pngPath + '/spriteFrame', SpriteFrame).then((texture) => {
                if (texture) {
                    this.sprite.spriteFrame = texture as SpriteFrame;
                }
            });
        }
    }

    private isGrowEnd(): boolean 
    {
        return this.growthTime == 0;
    }

    public startGrowing(): void {
        this.growState = GrowState.GROWING;
        
        this.updateSprite(`${SharedDefines.ANIMALS_TEXTURES}${this.growthStages[this.currentGrowthStageIndex].png}`);
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

    private grow(): void {
        this.currentGrowthStageIndex++;
        this.setupData(this.growthStages[this.currentGrowthStageIndex]);
        this.updateSprite(`${SharedDefines.ANIMALS_TEXTURES}${this.growthStages[this.currentGrowthStageIndex].png}`);
        this.scheduleNextGrowth();
    }

    private onGrowthComplete(): void {
        console.log(`Animal ${this.name} has completed growing`);
        this.growState = GrowState.HARVESTING;
        this.eventTarget.emit(Animal.growthCompleteEvent, this);
        this.node.on(Node.EventType.TOUCH_END, this.harvest, this);
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

    public harvest(): void {
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
        // Emit harvest event
        this.eventTarget.emit(SharedDefines.EVENT_ANIMAL_HARVEST, this);

        // Remove event listener
        this.node.off(Node.EventType.TOUCH_END, this.harvest, this);

        // Destroy the animal
        this.node.destroy();
    }
}