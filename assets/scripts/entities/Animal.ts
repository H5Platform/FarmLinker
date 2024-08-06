// Animal.ts

import { _decorator, Component, Node, Sprite, SpriteFrame, EventTarget } from 'cc';
import { CooldownComponent } from '../components/CooldownComponent';
import { SharedDefines } from '../misc/SharedDefines';
import { AnimalDataManager } from '../managers/AnimalDataManager';
import { ResourceManager } from '../managers/ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('Animal')
export class Animal extends Component {
    @property
    public id: string = '';

    @property
    public description: string = '';

    @property
    public farmType: string = '';

    @property
    public timeMin: number = 0;

    @property
    public levelNeed: number = 0;

    @property
    public gridCapacity: string = '';

    @property(Sprite)
    public sprite: Sprite | null = null;

    private cooldownComponent: CooldownComponent | null = null;
    private isAdult: boolean = false;

    public static readonly growthCompleteEvent = 'growthComplete';
    public eventTarget: EventTarget = new EventTarget();

    protected onLoad(): void {
        this.cooldownComponent = this.getComponent(CooldownComponent);
        if (!this.cooldownComponent) {
            this.cooldownComponent = this.addComponent(CooldownComponent);
        }
    }

    public initialize(animalId: string): void {
        const animalData = AnimalDataManager.instance.findAnimalDataById(animalId);
        if (!animalData) {
            console.error(`No animal data found for id: ${animalId}`);
            return;
        }

        this.id = animalData.id;
        this.name = animalData.name;
        this.description = animalData.description;
        this.farmType = animalData.farm_type;
        this.timeMin = parseInt(animalData.time_min);
        this.levelNeed = parseInt(animalData.level_need);
        this.gridCapacity = animalData.grid_capacity;

        this.updateSprite(animalData.png);
        this.startGrowing();
    }

    private updateSprite(pngName: string): void {
        //TODO 目前字段定义有问题，需要修改，暂时先不管。
        //这里的pngName实际是AnimalData中的png字段，与Items表中的png字段不一致。
        if (this.sprite) {
            ResourceManager.instance.loadAsset(`${SharedDefines.WINDOW_SHOP_TEXTURES}` + pngName + '/spriteFrame', SpriteFrame).then((texture) => {
                if (texture) {
                    this.sprite.spriteFrame = texture as SpriteFrame;
                }
            });
        }
    }

    public startGrowing(): void {
        if (this.timeMin > 0) {
            this.cooldownComponent?.startCooldown(
                'growth',
                this.timeMin * SharedDefines.TIME_MINUTE,
                () => this.onGrowthComplete()
            );
        } else {
            this.onGrowthComplete();
        }
    }

    private onGrowthComplete(): void {
        this.isAdult = true;
        console.log(`Animal ${this.name} has completed growing`);
        this.eventTarget.emit(Animal.growthCompleteEvent, this);
        this.node.on(Node.EventType.TOUCH_END, this.harvest, this);
    }

    public harvest(): void {
        if (!this.isAdult) {
            console.error(`Animal ${this.name} is not ready to harvest`);
            return;
        }

        // Emit harvest event
        this.eventTarget.emit(SharedDefines.EVENT_ANIMAL_HARVEST, this);

        // Remove event listener
        this.node.off(Node.EventType.TOUCH_END, this.harvest, this);

        // Destroy the animal
        this.node.destroy();
    }
}