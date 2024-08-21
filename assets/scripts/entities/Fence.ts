// Fence.ts

import { _decorator, Component, Node, Vec2, Rect, UITransform, Vec3, instantiate, Director,EventTarget } from 'cc';
import { Animal } from './Animal';
import { ResourceManager } from '../managers/ResourceManager';
import { FarmSelectionType, SceneItem, SceneItemType, SharedDefines } from '../misc/SharedDefines';
import { IDropZone, IDraggable, DragDropComponent } from '../components/DragDropComponent';
import { WindowManager } from '../ui/WindowManager';
import { InventoryItem } from '../components/InventoryComponent';
import { CooldownComponent } from '../components/CooldownComponent';
import { NetworkManager } from '../managers/NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('Fence')
export class Fence extends Component implements IDropZone{
    @property
    public capacity: number = 0;

    private occupiedSpace: number = 0;
    private animals: Animal[] = [];
    private dragDropComponent: DragDropComponent | null = null;
    private cooldownComponent: CooldownComponent | null = null;

    public eventTarget: EventTarget = new EventTarget();

    protected onLoad(): void {
        this.cooldownComponent = this.addComponent(CooldownComponent);
    }

    public getAvailableSpace(): number {
        return this.capacity - this.occupiedSpace;
    }

    public canAcceptAnimal(animal: Animal): boolean {
        const requiredSpace = 1;//parseInt(animal.gridCapacity);
        return this.getAvailableSpace() >= requiredSpace;
    }

    public async tryAddAnimal(animalId:string,worldPos:Vec3 = Vec3.ZERO): Promise<boolean> {
        const animalPrefab = await ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_ANIMAL);
        const animalNode = instantiate(animalPrefab);
        animalNode.name = animalId;
        const animal = animalNode.getComponent(Animal);
        animal.initialize(animalId);
        this.node.addChild(animal.node);
        animalNode.setWorldPosition(worldPos);
        return this.addAnimal(animal);
    }

    public addAnimal(animal: Animal): boolean {
        if (this.canAcceptAnimal(animal)) {
            this.node.addChild(animal.node);
            animal.eventTarget.once(SharedDefines.EVENT_ANIMAL_HARVEST, this.onAnimalHarvest, this);
            animal.startGrowing();
            this.animals.push(animal);
            this.occupiedSpace += 1;//parseInt(animal.gridCapacity);
            return true;
        }
        return false;
    }

    public removeAnimal(animal: Animal): void {
        const index = this.animals.indexOf(animal);
        if (index !== -1) {
            this.animals.splice(index, 1);
            this.occupiedSpace -= parseInt(animal.gridCapacity);
        }
    }

    public getAnimals(): Animal[] {
        return this.animals;
    }

    public isPointInside(point: Vec2): boolean {
        const uiTransform = this.getComponent(UITransform);
        if (!uiTransform) return false;

        const worldPos = this.node.getWorldPosition();
        const size = uiTransform.contentSize;
        const rect = new Rect(worldPos.x - size.width / 2, worldPos.y - size.height / 2, size.width, size.height);
        return rect.contains(point);
    }

    public select(dragComponent : DragDropComponent,touchPos:Vec2): void {
        if (this.cooldownComponent.isOnCooldown('select')) {
            return; // if cooldown is on, ignore this select
        }
        //this.showSelectionWindow(FarmSelectionType.FENCE,collider.node,event.getLocation());
        this.dragDropComponent = dragComponent;
        WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME,FarmSelectionType.FENCE,this.node,touchPos,this.onSelectionWindowItemClicked.bind(this));
    }

    private async onSelectionWindowItemClicked(inventoryItem:InventoryItem): Promise<void> {
        const animalPrefab = await ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_ANIMAL);
        const animalNode = instantiate(animalPrefab);
        animalNode.name = inventoryItem.detailId;
        const animal = animalNode.getComponent(Animal);
        animal.initializeWithInventoryItem(inventoryItem);
        const gameplayNode = Director.instance.getScene().getChildByPath(SharedDefines.PATH_GAMEPLAY);
        gameplayNode.addChild(animal.node);
        //animalNode.setWorldPosition(worldPos);
        this.dragDropComponent.startDragging(animal, animalNode);
    }

    //#region IDraggable implementation
    public getNode(): Node {
        return this.node;
    }

    public canAcceptDrop(draggable: IDraggable): boolean {
        if (draggable instanceof Animal) {
            return this.canAcceptAnimal(draggable);
        }
        return false;
    }

    public onDrop(draggable: IDraggable): void {

        if (draggable instanceof Animal) {
            const animal = draggable as Animal;
            const worldPos = animal.node.getWorldPosition();
            //this.node.addChild(animal.node);
            

            NetworkManager.instance.eventTarget.once(NetworkManager.EVENT_PLANT, (result) => {
                if(!result.success ){
            
                    console.log('animal plant failed , name = ' + animal.node.name);
                    return;
                }
                
                animal.initializeWithSceneItem(result.data as SceneItem);
                if(this.addAnimal(animal)){
                    animal.node.setWorldPosition(worldPos);
                    this.eventTarget.emit(SharedDefines.EVENT_FENCE_ANIMAL_ADDED,animal);
                }
            });

            NetworkManager.instance.plant(
                animal.id,
                SceneItemType.Animal,
                worldPos.x,
                worldPos.y,
                this.node.name,
            );

            this.cooldownComponent.startCooldown('select', SharedDefines.COOLDOWN_SELECTION_TIME, () => {});
        }
    }
    //#endregion

    private onAnimalHarvest(animal:Animal): void {
        console.log('onAnimalHarvest',animal);
        this.removeAnimal(animal);
    }
}