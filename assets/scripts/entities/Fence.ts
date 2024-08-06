// Fence.ts

import { _decorator, Component, Node, Vec2, Rect, UITransform, Vec3, instantiate } from 'cc';
import { Animal } from './Animal';
import { ResourceManager } from '../managers/ResourceManager';
import { SharedDefines } from '../misc/SharedDefines';
const { ccclass, property } = _decorator;

@ccclass('Fence')
export class Fence extends Component {
    @property
    public capacity: number = 0;

    private occupiedSpace: number = 0;
    private animals: Animal[] = [];

    public getAvailableSpace(): number {
        return this.capacity - this.occupiedSpace;
    }

    public canAcceptAnimal(animal: Animal): boolean {
        const requiredSpace = parseInt(animal.gridCapacity);
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
            this.animals.push(animal);
            this.occupiedSpace += parseInt(animal.gridCapacity);
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
}