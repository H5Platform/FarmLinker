import { _decorator, Component, Director, instantiate, Node, Prefab,EventTarget } from 'cc';
import { PlayerState } from '../entities/PlayerState';
import { InventoryComponent } from '../components/InventoryComponent';
import { InputComponent } from '../components/InputComonent';
import { BuildingManager } from '../managers/BuildingManager';
import { BuildingPlacementComponent } from '../components/BuildingPlacementComponent';
import { SharedDefines } from '../misc/SharedDefines';
import { ResourceManager } from '../managers/ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property(Prefab)
    public placementBuildingPrefab: Prefab = null;

    //getter inputcomponent
    public get inputComponent(): InputComponent | null {
        return this._inputComponent;
    }
    
    private _playerState: PlayerState;
    private _inputComponent: InputComponent | null = null;
    private _inventoryComponent: InventoryComponent;
    private currentBuildingPlacement: BuildingPlacementComponent | null = null;
    

    //getter playerstate
    public get playerState(): PlayerState {
        return this._playerState;
    }

    //getter inventorycomponent
    public get inventoryComponent(): InventoryComponent {
        return this._inventoryComponent;
    }

    public eventTarget: EventTarget = new EventTarget();

    protected onLoad(): void {
        this._playerState = new PlayerState();
        this._inventoryComponent = this.node.getComponent(InventoryComponent);
        
        const inputNode = Director.instance.getScene().getChildByPath(SharedDefines.PATH_INPUT_NODE);
        if (inputNode) {
            this._inputComponent = inputNode.getComponent(InputComponent);
        }
        else{
            console.error('No InputNode found');
            return;
        }
    }

    start() {
        
    }

    update(deltaTime: number) {
        
    }

    public startBuildingPlacement(buildData: any,placementContainer:Node): void {
        const buildingNode = instantiate(this.placementBuildingPrefab);
        if (!placementContainer) {
            const canvas = Director.instance.getScene().getChildByName("Canvas");
            canvas.addChild(buildingNode);
        }
        else{
            placementContainer.addChild(buildingNode);
        }
        this.currentBuildingPlacement = buildingNode.addComponent(BuildingPlacementComponent);
        this.currentBuildingPlacement.initialize(buildData, BuildingManager.instance);
        

        // 设置触摸事件处理
        if (this._inputComponent) {
            this._inputComponent.onTouchStart = this.currentBuildingPlacement.onTouchStart.bind(this.currentBuildingPlacement);
            this._inputComponent.onTouchMove = this.currentBuildingPlacement.onTouchMove.bind(this.currentBuildingPlacement);
            // this._inputComponent.onTouchEnd = this.currentBuildingPlacement.onTouchEnd.bind(this.currentBuildingPlacement);
            // this._inputComponent.onTouchCancel = this.currentBuildingPlacement.onTouchCancel.bind(this.currentBuildingPlacement);
        }
    }

    public tryPlacementBuilding(): boolean {
        if (!this.currentBuildingPlacement ) {
            return false;
        }
        if (this.currentBuildingPlacement.canPlaceBuilding()) {
            this.currentBuildingPlacement.placeBuilding();
            this.eventTarget.emit(SharedDefines.EVENT_PLAYER_PLACEMENT_BUILDING, true);
            this.endBuildingPlacement();
            return true;
        }
        return false;
    }

    public cancelBuildingPlacement(): void {
        if (this.currentBuildingPlacement) {
            this.currentBuildingPlacement.cancelPlacement();
            this.eventTarget.emit(SharedDefines.EVENT_PLAYER_PLACEMENT_BUILDING, false);
            this.endBuildingPlacement();
        }
    }

    public endBuildingPlacement(): void {
        if (this.currentBuildingPlacement) {
            //this.currentBuildingPlacement.finalizePlacement();
            this.currentBuildingPlacement = null;
        }

        // 清除触摸事件处理
        if (this._inputComponent) {
            this._inputComponent.onTouchStart = null;
            this._inputComponent.onTouchMove = null;
            this._inputComponent.onTouchEnd = null;
            this._inputComponent.onTouchCancel = null;
        }
    }

    public harvestCrop(cropValue: number): void {
        this._playerState.addGold(cropValue);
        this._playerState.addExperience(10); // Suppose 10 experience for each crop
    }
}


