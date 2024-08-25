import { _decorator, Component, instantiate, Node, Prefab,EventTarget, Vec3 } from 'cc';
import { PlotTile } from '../entities/PlotTile';
import { PlayerController } from './PlayerController';
import { CommandState, CommandType, NetworkHarvestResult, NetworkHarvestResultData, NetworkInventoryItem, SceneItem, SceneItemState, SceneItemType, SharedDefines } from '../misc/SharedDefines';
import { CropDataManager } from '../managers/CropDataManager';
import { ItemDataManager } from '../managers/ItemDataManager';
import { BuildDataManager } from '../managers/BuildDataManager';
import { AnimalDataManager } from '../managers/AnimalDataManager';
import { Fence } from '../entities/Fence';
import { Animal } from '../entities/Animal';
import { NetworkManager } from '../managers/NetworkManager';
import { ResourceManager } from '../managers/ResourceManager';
import { Crop } from '../entities/Crop';
import { Building } from '../entities/Building';
import { DateHelper } from '../helpers/DateHelper';
import { InventoryItem } from '../components/InventoryComponent';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    @property(Prefab)
    private playerControllerPrefab: Prefab| null = null;

    @property(Node)
    private gameplayContainer: Node| null = null;

    @property(Node)
    private buildingContainer: Node| null = null;

    @property(Fence)
    private fence: Fence| null = null;

    @property(PlotTile)
    private plotTiles: PlotTile[] = [];
    private playerController: PlayerController| null = null;

    public eventTarget: EventTarget = new EventTarget();

    onLoad(): void {


        this.setGameViewVisibility(false);
    }

    async start() {
        await this.preloadJsonDatas();
        this.initializePlayerController();
        this.setupEventListeners();
        this.login();
    }

    update(deltaTime: number) {
        
    }

    protected onDestroy(): void {
        this.resetPlotTiles();
        this.eventTarget.removeAll(this);
        NetworkManager.instance.eventTarget.removeAll(this);
    }

    public async preloadJsonDatas(): Promise<void> 
    {
        //load json data
        await CropDataManager.instance.loadCropData();
        await ItemDataManager.instance.loadItemData();
        await BuildDataManager.instance.loadBuildData();
        await AnimalDataManager.instance.loadAnimalData();
    }

    //create getplayerController() method
    public getPlayerController(): PlayerController {
        if (this.playerController) {
            return this.playerController;
        } else {
            console.warn('playerController is not set in GameController');
            return null;
        }
    }

    public setGameViewVisibility(visible: boolean): void {
        if (this.gameplayContainer) {
            this.gameplayContainer.active = visible;
        } else {
            console.warn('gameplayContainer is not set in GameController');
        }
    }

    public startGame(): void {
        this.setGameViewVisibility(true);
        
        //instantiate playerControllerprefab
        
        const plotNum = SharedDefines.INIT_PLOT_NUM + this.playerController.playerState.level - 1;
        this.initializePlotTiles(plotNum);
    }

    private setupEventListeners(): void {
        this.fence.eventTarget.on(SharedDefines.EVENT_FENCE_ANIMAL_ADDED, this.onFenceAnimalAdded.bind(this));

        const networkManager = NetworkManager.instance;
        networkManager.eventTarget.on(NetworkManager.EVENT_LOGIN_SUCCESS, this.onLoginSuccess.bind(this));
        networkManager.eventTarget.on(NetworkManager.EVENT_GET_USER_SCENE_ITEMS, this.onGetUserSceneItems.bind(this));
        networkManager.eventTarget.on(NetworkManager.EVENT_HARVEST, this.onHarvest.bind(this));
    }

    private initializePlayerController(): void {
        if (this.playerControllerPrefab) {
            const playerControllerNode = instantiate(this.playerControllerPrefab);
            this.node.addChild(playerControllerNode);
            this.playerController = playerControllerNode.getComponent(PlayerController);
        } else {
            console.error('playerControllerPrefab is not set in GameController');
            return;
        }
    }

    private initializePlotTiles(availablePlotTileNum : number): void {
        if (this.plotTiles) {
            for (let i = 0; i < this.plotTiles.length; i++) {
                const plotTile = this.plotTiles[i];
                if (!plotTile) continue;
                //if i < availablePlotTileNum set plottile visible
                //else set plottile invisible
                plotTile.node.active = i < availablePlotTileNum;
                plotTile.eventTarget.on(SharedDefines.EVENT_PLOT_OCCUPIED,this.onPlotOccupied.bind(this));
                plotTile.eventTarget.on(SharedDefines.EVENT_PLOT_SELECTED, (plotTile:PlotTile)=>{
                    this.eventTarget.emit(SharedDefines.EVENT_PLOT_SELECTED, plotTile);
                }, this)
            }
        } else {
            console.error('plotTiles is not set in GameController');
            return;
        }
    }

    private resetPlotTiles(): void {
        if (this.plotTiles) {
            for (let i = 0; i < this.plotTiles.length; i++) {
                const plotTile = this.plotTiles[i];
                if (!plotTile) continue;
                plotTile.clear();
                plotTile.eventTarget.off(SharedDefines.EVENT_PLOT_OCCUPIED,this.onPlotOccupied);
            }
        }
    }

    private onPlotOccupied(plotTile: PlotTile): void {
        const inventoryComponent = this.playerController?.inventoryComponent;
        if (!inventoryComponent) {
            console.error('inventoryComponent is not set in GameController');
            return;
        }
        const crop = plotTile.OcuippedCrop;
        if (!crop) {
            console.error('crop is not set in GameController');
            return;
        }
        inventoryComponent.removeItem(crop.SourceInventoryItem.id,1);
    }

    private onFenceAnimalAdded(animal: Animal): void {
        const inventoryComponent = this.playerController?.inventoryComponent;
        if (!inventoryComponent) {
            console.error('inventoryComponent is not set in GameController');
            return;
        }
        
        //inventoryComponent.removeItem(animal.SourceInventoryItem.id,1);
    }

    //#region network relates
    
    private async login(): Promise<void> {
        if(NetworkManager.instance.SimulateNetwork){
            return;
        }
        //TODO replace userid with real user id
        const userid = "123";
        await NetworkManager.instance.login(userid);

        await NetworkManager.instance.requestSceneItemsByUserId(userid,this.playerController?.playerState.token);
    }

    private onLoginSuccess(userData:any,token:string): void {
        console.log('login success');
        this.playerController.playerState.initialize(userData,token);
        const networkInventoryItems = userData.inventory_items as NetworkInventoryItem[];
        this.playerController.inventoryComponent.initialize(networkInventoryItems);
    }

    private async onGetUserSceneItems(data:any): Promise<void> {
        console.log('get user scene items',data);
        if(!data.success){
            console.error('get user scene items failed');
            return;
        }
        const sceneItems = data.data as SceneItem[];
        for (const item of sceneItems) {
            let node: Node | null = null;
            let component: Component | null = null;
            console.log("item:id" + item.id);
            switch (item.type) {
                case SceneItemType.Crop:
                    node = await this.createCropNode(item);
                    component = node?.getComponent(Crop);
                    break;
                case SceneItemType.Animal:
                   node = await this.createAnimalNode(item);
                   component = node?.getComponent(Animal);
                    break;
                case SceneItemType.Building:
                   node = await this.createBuildingNode(item);
                   component = node?.getComponent(Building);
                    break;
            }

            if (node && component) {
                this.setupSceneItem(node, component, item);
            }
        }
    }

    private async createCropNode(item: SceneItem): Promise<Node | null> {
        console.log(`Creating crop node for item ${item.id}`);
        const cropData = CropDataManager.instance.findCropDataById(item.item_id);
        if (!cropData) {
            console.log(`Crop data not found for item ${item.id}`);
            return null;
        }

        console.log(`Loading prefab for item ${item.id}`);
        const prefab = await ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_CROP_CORN);
        if (!prefab) {
            console.log(`Prefab not found for item ${item.id}`);
            return null;
        }

        const node = instantiate(prefab);
        const crop = node.getComponent(Crop);
        if (crop) {
            console.log(`Initializing crop for item ${item.id}`);
            crop.initializeWithSceneItem(item);
        }

        //find plot tile in plot tiles with item.parent_node_name
        const plotTile = this.plotTiles?.find(tile => tile.node.name === item.parent_node_name);
        if(plotTile){
            console.log(`Planting crop for item ${item.id}`);
            plotTile.plant(crop);
        }
        else{
            console.error(`Plot tile ${item.parent_node_name} not found`);
        }

        console.log(`Finished creating crop node for item ${item.id}`);
        return node;
    }

    private async createAnimalNode(item: SceneItem): Promise<Node | null> {
        console.log(`Creating animal node for item ${item.id}`);
        const animalData = AnimalDataManager.instance.findAnimalDataById(item.item_id);
        if (!animalData) return null;
        console.log(`Loading prefab for item ${item.id}`);
        const prefab = await ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_ANIMAL);
        if (!prefab) return null;
        console.log(`Instantiating prefab for item ${item.id}`);
        const node = instantiate(prefab);
        const animal = node.getComponent(Animal);
        if (animal) {
            console.log(`Initializing animal for item ${item.id}`);
            animal.initializeWithSceneItem(item);
            this.fence.addAnimal(animal);
        }
        else{
            console.error(`Animal component not found for item ${item.id}`);
        }
        
        
        return node;
    }

    private async createBuildingNode(item: SceneItem): Promise<Node | null> {
        const buildData = BuildDataManager.instance.findBuildDataById(item.item_id);
        if (!buildData) return null;

        const prefab = await ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_PLACEMENT_BUILDING);
        if (!prefab) return null;

        const node = instantiate(prefab);
        this.buildingContainer?.addChild(node);
        //set position
        node.setWorldPosition(new Vec3(item.x, item.y, 0));
        const building = node.addComponent(Building);
        if (building) {
            building.initializeFromSceneItem(item);
            
        }
        return node;
    }

    private setupSceneItem(node: Node, component: Component, item: SceneItem): void {
        // 设置位置
        node.setWorldPosition(new Vec3(item.x, item.y, 0));

        // // 设置父节点
        // const parentNode = this.node.getChildByName(item.parent_node_name);
        // if (parentNode) {
        //     node.parent = parentNode;
        // } else {
        //     console.warn(`Parent node ${item.parent_node_name} not found for item ${item.id}`);
        //     this.gameplayContainer?.addChild(node);
        // }

        // 设置状态
        // if (component instanceof Crop || component instanceof Animal || component instanceof Building) {
        //     switch (item.state) {
        //         case SceneItemState.InProgress:
        //             component.startGrowing();
        //             break;
        //         case SceneItemState.Complete:
        //             component.completeGrowth();
        //             break;
        //     }
        // }

        // 处理命令
        // if (item.command) {
        //     this.handleCommand(component, item.command);
        // }
    }

    private handleCommand(component: Component, command: SceneItem['command']): void {
        if (!command) return;

        const currentTime = Date.now();
        const startTime = DateHelper.stringToDate(command.start_time);
        const elapsedTime = currentTime - startTime.getTime();

        switch (command.type) {
            case CommandType.Craft:
                // 处理制作命令
                break;
            case CommandType.Upgrade:
                // if (component instanceof Building) {
                //     // 处理升级命令
                //     if (command.state === CommandState.InProgress) {
                //         component.continueUpgrade(elapsedTime);
                //     } else if (command.state === CommandState.Complete) {
                //         component.completeUpgrade();
                //     }
                // }
                break;
        }
    }

    private onHarvest(result: any): void {
        console.log('harvest result', result);
        const networkHarvestResult = result as NetworkHarvestResult;
        if(networkHarvestResult.success){
            const networkHarvestResultData = networkHarvestResult.data as NetworkHarvestResultData;
            console.log('networkHarvestResultData',networkHarvestResultData);
            this.playerController.playerState.addExperience(networkHarvestResultData.exp_gained);
            this.playerController.playerState.level = networkHarvestResultData.new_level;
            const itemData = ItemDataManager.instance.getItemById(networkHarvestResultData.item_id);
            if(itemData){
                const inventoryItem = new InventoryItem(itemData,1);
                this.playerController.inventoryComponent.addItem(inventoryItem);
            }
        }
    }

    //#endregion

}


