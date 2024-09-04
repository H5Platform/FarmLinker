import { _decorator, Component, Node, Sprite, SpriteFrame, EventTarget } from 'cc';
import { ResourceManager } from '../managers/ResourceManager';
import { SceneItem, SceneItemState, SceneItemType, SharedDefines } from '../misc/SharedDefines';
import { PlayerState } from '../entities/PlayerState';
import { BuildDataManager } from '../managers/BuildDataManager';
import { NetworkManager } from '../managers/NetworkManager';

const { ccclass, property } = _decorator;

export enum BuildingState {
    NONE,
    CONSTRUCTING,
    COMPLETED
}

@ccclass('Building')
export class Building extends Component {
    @property
    public id: string = '';


    @property
    public level: number = 1;

    private sprite: Sprite | null = null;

    private buildingData: any;
    private sceneItem: SceneItem | null = null;
    //getter
    public get SceneItem(): SceneItem | null {
        return this.sceneItem;
    }

    private state: BuildingState = BuildingState.NONE;
    private arrowContainer: Node | null = null;
    public eventTarget: EventTarget = new EventTarget();

    public static readonly EVENT_STATE_CHANGED = 'building-state-changed';
    public static readonly EVENT_LEVEL_UP = 'building-level-up';

    private spriteCache: Map<string, SpriteFrame> = new Map();

    public initialize(buildingData: any): void {
        this.arrowContainer = this.node.getChildByName("Arrows");
        this.arrowContainer.active = false;
        this.sprite = this.getComponent(Sprite);
        this.buildingData = buildingData;
        this.id = buildingData.id;
        this.updateSprite();
        this.setState(BuildingState.CONSTRUCTING);
    }

    public initializeFromSceneItem(sceneItem: SceneItem): void {
        console.log(`Building initializeFromSceneItem start`);
        this.id = sceneItem.item_id;
        this.sceneItem = sceneItem;
        this.buildingData = BuildDataManager.instance.findBuildDataById(this.id);
        if (!this.buildingData) {
            console.error(`Building data not found for id: ${this.id}`);
            return;
        }
        this.initialize(this.buildingData);
        console.log("sceneItem",sceneItem);
        //update state
        if(sceneItem.state === SceneItemState.Complete){
            this.setState(BuildingState.COMPLETED); 
        }
        else if(sceneItem.state === SceneItemState.InProgress){
            this.setState(BuildingState.CONSTRUCTING);
        }
    }

    private async updateSprite(): Promise<void> {
        if (this.sprite && this.buildingData.texture) {
            let spriteFrame = this.spriteCache.get(this.buildingData.texture);
            if (!spriteFrame) {
                spriteFrame = await ResourceManager.instance.loadAsset<SpriteFrame>(
                    `${SharedDefines.WINDOW_BUILDING_TEXTURES}${this.buildingData.texture}/spriteFrame`,
                    SpriteFrame
                );
                if (spriteFrame) {
                    this.spriteCache.set(this.buildingData.texture, spriteFrame);
                }
            }
            if (spriteFrame) {
                this.sprite.spriteFrame = spriteFrame;
            }
        }
    }

    public setSprite(sprite: Sprite): void {
        this.sprite = sprite;
    }

    public setState(newState: BuildingState): void {
        if (this.state !== newState) {
            console.log(`Building setState to ${newState}`);
            const oldState = this.state;
            this.state = newState;
            this.eventTarget.emit(Building.EVENT_STATE_CHANGED, { oldState, newState });
        }
    }

    public getState(): BuildingState {
        return this.state;
    }

    public async completeConstruction(): Promise<void> {

        this.setState(BuildingState.COMPLETED);
        
    }

    // 预留升级方法
    public upgrade(playerState: PlayerState): boolean {
        // 这里可以添加升级逻辑，比如检查资源是否足够，是否满足升级条件等
        // 目前简单地增加等级
        this.level++;
        this.eventTarget.emit(Building.EVENT_LEVEL_UP, this.level);
        return true;
    }

    // // 预留销毁方法
    // public destroy(): void {
    //     // 这里可以添加销毁前的逻辑，比如返还部分资源等
    //     super.destroy();
    // }

    // 预留选中方法
    public select(): void {
        // 这里可以添加选中建筑时的逻辑
        console.log(`Building ${this.name} selected`);
    }

    // 预留取消选中方法
    public deselect(): void {
        // 这里可以添加取消选中建筑时的逻辑
        console.log(`Building ${this.name} deselected`);
    }
}