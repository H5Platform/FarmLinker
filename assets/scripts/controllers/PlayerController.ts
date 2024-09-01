import { _decorator, Component, Director, instantiate, Node, Prefab,EventTarget, EventTouch, Vec3, Camera, director, PhysicsSystem2D, Vec2, Collider2D, Layers, CCString, CCInteger } from 'cc';
import { PlayerState } from '../entities/PlayerState';
import { InventoryComponent, InventoryItem } from '../components/InventoryComponent';
import { InputComponent } from '../components/InputComonent';
import { BuildingManager } from '../managers/BuildingManager';
import { BuildingPlacementComponent } from '../components/BuildingPlacementComponent';
import { FarmSelectionType, SharedDefines } from '../misc/SharedDefines';
import { DragDropComponent } from '../components/DragDropComponent';
import { Fence } from '../entities/Fence';
import { PlotTile } from '../entities/PlotTile';
import { ItemDataManager } from '../managers/ItemDataManager';
import { NetworkManager } from '../managers/NetworkManager';
import { WindowManager } from '../ui/WindowManager';
import { Building } from '../entities/Building';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {


    @property(CCInteger)
    public initialMoney: number = 20;
    @property(CCInteger)
    public initialLevel: number = 1;

    @property(CCString)
    public initialItemIds: string[] = [];

    @property(Prefab)
    public placementBuildingPrefab: Prefab = null;

    //getter inputcomponent
    public get inputComponent(): InputComponent | null {
        return this._inputComponent;
    }
    
    //getter visitmode
    public get visitMode(): boolean {
        return this._visitMode;
    }

    //setter visitmode
    public set visitMode(value: boolean) {
        this._visitMode = value;
    }
    private _visitMode: boolean = false;
    
    
    private _inputComponent: InputComponent | null = null;
    private _inventoryComponent: InventoryComponent;
    private _camera : Camera;
    private currentBuildingPlacement: BuildingPlacementComponent | null = null;
    private dragDropComponent: DragDropComponent | null = null;
    

    //getter playerstate
    public get playerState(): PlayerState {
        return this._playerState;
    }
    private _playerState: PlayerState;

    //getter friendstate
    public get friendState(): PlayerState {
        return this._friendState;
    }
    //setter friendstate
    public set friendState(value: PlayerState) {
        this._friendState = value;
    }
    private _friendState: PlayerState;

    //getter inventorycomponent
    public get inventoryComponent(): InventoryComponent {
        return this._inventoryComponent;
    }

    public eventTarget: EventTarget = new EventTarget();

    protected onLoad(): void {
        this._playerState = new PlayerState(`0`,1,0,this.initialMoney,0);
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
        this.dragDropComponent = inputNode.addComponent(DragDropComponent);
        const fence = Director.instance.getScene().getComponentInChildren(Fence);
        this.dragDropComponent.registerDropZone(fence);
        
    }

    start() {
        if(NetworkManager.instance.SimulateNetwork){
            //for initial money
            this._playerState.addGold(this.initialMoney);
            this._playerState.level = this.initialLevel;
            //for initial items
            for (const itemId of this.initialItemIds) {
                const item = ItemDataManager.instance.getItemById(itemId);
                if (item) {
                    const inventoryItem = new InventoryItem(item);
                    this._inventoryComponent.addItem(inventoryItem);
                }
            }
        }
    }

    update(deltaTime: number) {
        
    }

    private handleClick(event: EventTouch): void {
        //if dragging, return
        if (this.dragDropComponent && this.dragDropComponent.IsDragging) {
            return; 
        }
        const colliders = this.getCollidersByClickPosition(event.getLocation());
        if (colliders) {
            const fenceLayer = 1 << Layers.nameToLayer(SharedDefines.LAYER_FENCE_NAME);
            //plot layer
            const plotLayer = 1 << Layers.nameToLayer(SharedDefines.LAYER_PLOTTILE_NAME);
            const buildingLayer = 1 << Layers.nameToLayer(SharedDefines.LAYER_BUILDING_NAME);
            for (const collider of colliders) {

                //get layer of collider
                
                if (collider.node.layer & fenceLayer) {
                    const fenceComponent = collider.node.getComponent(Fence);
                    if (fenceComponent) {
                        if((!this.visitMode && fenceComponent.IsPlayerOwner) || (this.visitMode && !fenceComponent.IsPlayerOwner)){
                            const worldPos = this._camera.screenToWorld(new Vec3(event.getLocation().x, event.getLocation().y, 0));
                            fenceComponent.select(this.dragDropComponent, new Vec2(worldPos.x, worldPos.y));
                        }
                    }
                    else{
                        console.error('Fence node does not have Fence component');
                        return;
                    }
                    //this.showSelectionWindow(FarmSelectionType.FENCE,collider.node,event.getLocation());
                }
                else if(collider.node.layer & plotLayer){
                    const plotTile = collider.node.getComponent(PlotTile);
                    if (plotTile) {
                        if((!this.visitMode && plotTile.IsPlayerOwner) || (this.visitMode && !plotTile.IsPlayerOwner)){
                            this.dragDropComponent.registerDropZone(plotTile);
                            plotTile.select(this.dragDropComponent);
                        }
                    }else{
                        console.error('PlotTile node does not have PlotTile component');
                        return;
                    }
                }
                else if(collider.node.layer & buildingLayer){
                    const building = collider.node.getComponent(Building);
                    if(building){
                        WindowManager.instance.show(SharedDefines.WINDOW_FARM_FACTORY_NAME,building.id);
                    }
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
    //#endregion

    //#region building placement

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

    //#endregion

    public harvestCrop(cropValue: number): void {
        this._playerState.addGold(cropValue);
        this._playerState.addExperience(10); // Suppose 10 experience for each crop
    }
}


