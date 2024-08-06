import { _decorator, Component, Director, instantiate, Node, Prefab,EventTarget, EventTouch, Vec3, Camera, director, PhysicsSystem2D, Vec2, Collider2D, Layers, CCString } from 'cc';
import { PlayerState } from '../entities/PlayerState';
import { InventoryComponent, InventoryItem } from '../components/InventoryComponent';
import { InputComponent } from '../components/InputComonent';
import { BuildingManager } from '../managers/BuildingManager';
import { BuildingPlacementComponent } from '../components/BuildingPlacementComponent';
import { FarmSelectionType, SharedDefines } from '../misc/SharedDefines';
import { ResourceManager } from '../managers/ResourceManager';
import { WindowManager } from '../ui/WindowManager';
import { ItemDataManager } from '../managers/ItemDataManager';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property(CCString)
    public initialItemIds: string[] = [];

    @property(Prefab)
    public placementBuildingPrefab: Prefab = null;

    //getter inputcomponent
    public get inputComponent(): InputComponent | null {
        return this._inputComponent;
    }
    
    private _playerState: PlayerState;
    private _inputComponent: InputComponent | null = null;
    private _inventoryComponent: InventoryComponent;
    private _camera : Camera;
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

        if (!this._camera) {
            this._camera = director.getScene().getComponentInChildren(Camera);
        }
        
        const inputNode = Director.instance.getScene().getChildByPath(SharedDefines.PATH_INPUT_NODE);
        if (inputNode) {
            this._inputComponent = inputNode.getComponent(InputComponent);
            this._inputComponent.onClick = this.handleClick.bind(this);
        }
        else{
            console.error('No InputNode found');
            return;
        }
    }

    start() {
        //for initial items
        for (const itemId of this.initialItemIds) {
            const item = ItemDataManager.instance.getItemById(itemId);
            if (item) {
                const inventoryItem = new InventoryItem(item);
                this._inventoryComponent.addItem(inventoryItem);
            }
        }
    }

    update(deltaTime: number) {
        
    }

    private handleClick(event: EventTouch): void {
        const colliders = this.getCollidersByClickPosition(event.getLocation());
        if (colliders) {
            for (const collider of colliders) {
                const fenceLayer = 1 << Layers.nameToLayer(SharedDefines.LAYER_FENCE_NAME);
                //get layer of collider
                
                if (collider.node.layer & fenceLayer) {
                    this.showSelectionWindow(FarmSelectionType.FENCE,collider.node,event.getLocation());
                }
            }
        }
    }

    private getCollidersByClickPosition(position: Vec2):readonly Collider2D[] | null {
        if (!this._camera) {
            console.error('Camera not set. Cannot perform touch detection.');
            return;
        }
        const touchLocation = position;
        const worldPosition = this._camera.screenToWorld(new Vec3(touchLocation.x, touchLocation.y, 0));

        

        const result = PhysicsSystem2D.instance.testPoint(new Vec2(worldPosition.x, worldPosition.y));

        if (result.length > 0) {
            //const hitCollider = result[0].node.;
            console.log('Hit object:', result[0].node.name);
            // 在这里处理击中对象的逻辑
            // 可以根据对象的标签或其他属性来判断是否为篱笆
            // if (hitCollider.node.layer === PlayerController.FENCE_MASK) {
            //     console.log('Hit a fence');
            //     // 处理击中篱笆的逻辑
            // }
            
        } else {
            console.log('Did not hit any object');
        }
        return result;
    }

    private showSelectionWindow(farmSelectionType:FarmSelectionType,selectedNode: Node,clickLocation:Vec2): void {
        WindowManager.instance.show(SharedDefines.WINDOW_SELECTION_NAME,farmSelectionType,selectedNode,clickLocation);
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


