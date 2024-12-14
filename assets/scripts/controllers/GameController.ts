import { _decorator, Component, instantiate, Node, Prefab,EventTarget, Vec3, Layers, screen, Vec2, view, Canvas, UITransform, macro, Camera } from 'cc';
import { PlotTile } from '../entities/PlotTile';
import { PlayerController } from './PlayerController';
import { CommandState, CommandType, NetworkCareResult, NetworkCareResultData, NetworkHarvestResult, NetworkHarvestResultData, NetworkInventoryItem, NetworkLoginResult, NetworkTreatResult, SceneItem, SceneItemState, SceneItemType, SharedDefines } from '../misc/SharedDefines';
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
import { PlayerState } from '../entities/PlayerState';
import { GrowthableEntity } from '../entities/GrowthableEntity';
import { SyntheDataManager } from '../managers/SyntheDataManager';
import { GradeDataManager } from '../managers/GradeDataManager';
import { CoinDataManager } from '../managers/CoinDataManager';
import { DiamondDataManager } from '../managers/DiamondDataManager';
import { WindowManager } from '../ui/WindowManager';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    //getter for gameplayCanvas
    public get GameplayCanvas(): Canvas {
        return this.gameplayCanvas;
    }
    @property(Canvas)
    private gameplayCanvas: Canvas| null = null;
    @property(Camera)
    private gameplayCamera: Camera| null = null;

    
    //getter for uiCanvas
    public get UICanvas(): Canvas {
        return this.uiCanvas;
    }
    @property(Canvas)
    private uiCanvas: Canvas| null = null;
    @property(Camera)
    private uiCamera: Camera| null = null;

    @property(Prefab)
    private playerControllerPrefab: Prefab| null = null;

    @property(Node)
    private gameplayContainer: Node| null = null;
    @property(Node)
    private friendGameplayContainer: Node| null = null;
    @property(Node)
    private buildingContainer: Node| null = null;
    @property(NetworkManager)
    private networkManager: NetworkManager| null = null;
    private playerFence: Fence| null = null;
    private friendFence: Fence| null = null;

    //getter for playerPlotTiles
    public get PlayerPlotTiles(): PlotTile[] {
        return this.playerPlotTiles;
    }
    private playerPlotTiles: PlotTile[] = [];
    //getter for friendPlotTiles
    public get FriendPlotTiles(): PlotTile[] {
        return this.friendPlotTiles;
    }
    private friendPlotTiles: PlotTile[] = [];
    private playerController: PlayerController| null = null;
    //getter for screenScale
    public get ScreenScale(): Vec2 {
        return this.screenScale;
    }

    private screenScale:Vec2 = new Vec2(1,1);
    //getter for gameplayToUICameraRatio
    public get GameplayToUICameraRatio(): number {
        return this.gameplayToUICameraRatio;
    }
    private gameplayToUICameraRatio:number = 1;

    public eventTarget: EventTarget = new EventTarget();

    onLoad(): void {
        
        this.setGameViewVisibility(false);
        this.setFriendGameViewVisibility(false);
        
        this.initializePlayerController();
        this.setupEventListeners();
    }

    async start() {
        console.log(`start start ...`);
        // Force portrait orientation
        view.setOrientation(macro.ORIENTATION_PORTRAIT);
        await this.preloadJsonDatas();
        //this.setupEventListeners();
       // this.login();

        //set gameplayCanvas uiTransform content size to 1920*1080
        const uiTransform = this.gameplayCanvas.node.getComponent(UITransform);
        if(uiTransform) {
            uiTransform.setContentSize(1920, 1080);
        }
        //calculate screen scale
        const screenSize = this.gameplayCanvas.node.getComponent(UITransform).contentSize;
        console.log(`screenSize:${screenSize}`);
        const designSize = view.getDesignResolutionSize();
        this.screenScale.x = screenSize.width / designSize.width;
        this.screenScale.y = screenSize.height / designSize.height;
        console.log(`screenScale:${this.screenScale}`);
        //calculate gameplayToUICameraRatio
        this.gameplayToUICameraRatio = this.uiCamera.orthoHeight / this.gameplayCamera.orthoHeight;
    }

    update(deltaTime: number) {
        
    }

    protected onDestroy(): void {
        this.eventTarget.removeAll(this);
        this.networkManager.eventTarget.removeAll(this);
    }

    public async preloadJsonDatas(): Promise<void> 
    {
        //load json data
        await CropDataManager.instance.loadCropData();
        await ItemDataManager.instance.loadItemData();
        await BuildDataManager.instance.loadBuildData();
        await AnimalDataManager.instance.loadAnimalData();
        await SyntheDataManager.instance.loadSyntheData();
        await GradeDataManager.instance.initialize();
        await CoinDataManager.instance.loadCoinData();
        await DiamondDataManager.instance.loadDiamondData();
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

    public AddToGameplayContainer(node:Node): void {
        //check if is visit mode
        if(this.playerController.visitMode){
            this.friendGameplayContainer.addChild(node);
        }
        else{
            this.gameplayContainer.addChild(node);
        }
    }

    //create setFriendGameViewVisibility(visible: boolean): void method
    public setFriendGameViewVisibility(visible: boolean): void {
        if (this.friendGameplayContainer) {
            this.friendGameplayContainer.active = visible;
        } else {
            console.warn('friendGameplayContainer is not set in GameController');
        }
    }

    public setGameViewVisibility(visible: boolean): void {
        if (this.gameplayContainer) {
            this.gameplayContainer.active = visible;
        } else {
            console.warn('gameplayContainer is not set in GameController');
        }
    }

    public getAvailableFence(): Fence | null {
        if(this.playerFence && !this.playerController.visitMode){
            return this.playerFence;
        }
        if(this.friendFence && this.playerController.visitMode){
            return this.friendFence;
        }
        return null;
    }

    public startGame(): void {
        this.setGameViewVisibility(true);
        this.setFriendGameViewVisibility(false);
        
        //instantiate playerControllerprefab
        

        
    }

    private setupEventListeners(): void {
        console.log(`setupEventListeners start ...`);

        this.networkManager.eventTarget.on(NetworkManager.EVENT_GET_USER_SCENE_ITEMS, this.onGetUserSceneItems.bind(this));
        this.networkManager.eventTarget.on(NetworkManager.EVENT_HARVEST, this.onHarvest.bind(this));
        
        // Add event listener for player level up
        this.playerController.playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_LEVEL_UP, this.onPlayerLevelUp.bind(this));
       
        console.log(`setupEventListeners end ...`);
    }

    private initializePlayerController(): void {
        console.log(`initializePlayerController start ...`);
        if (this.playerControllerPrefab) {
            const playerControllerNode = instantiate(this.playerControllerPrefab);
            this.node.addChild(playerControllerNode);
            this.playerController = playerControllerNode.getComponent(PlayerController);
        } else {
            console.error('playerControllerPrefab is not set in GameController');
            return;
        }
    }

    private initializePlotTiles(availablePlotTileNum : number,plotTiles:PlotTile[],isPlayerOwner:boolean): void {
        console.log(`initializePlotTiles:${availablePlotTileNum}`);
        if (plotTiles) {
            for (let i = 0; i < plotTiles.length; i++) {
                const plotTile = plotTiles[i];
                if (!plotTile) continue;
                plotTile.initialize(isPlayerOwner);
                
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
        if (this.friendPlotTiles) {
            for (let i = 0; i < this.friendPlotTiles.length; i++) {
                const plotTile = this.friendPlotTiles[i];
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
        //console.log(`onPlotOccupied crop , name = ${crop.node.name} , id = ${crop.SourceInventoryItem.id}`);
        //inventoryComponent.removeItem(crop.SourceInventoryItem.id,1);
        console.log(`onPlotOccupied crop 2, name = ${crop.node.name}`);
    }

    // private onFenceAnimalAdded(animal: Animal): void {
    //     const inventoryComponent = this.playerController?.inventoryComponent;
    //     if (!inventoryComponent) {
    //         console.error('inventoryComponent is not set in GameController');
    //         return;
    //     }
        
    //     //inventoryComponent.removeItem(animal.SourceInventoryItem.id,1);
    // }

    //implement findPlotTileBySceneId,take plotTiles as parameter and sceneId as parameter
    private findPlotTileBySceneId(plotTiles:PlotTile[],sceneId:string): PlotTile | null {
        for (let i = 0; i < plotTiles.length; i++) {
            const plotTile = plotTiles[i];
            if (plotTile.OcuippedCrop && plotTile.OcuippedCrop.SceneItem && plotTile.OcuippedCrop.SceneItem.id === sceneId) {
                return plotTile;
            }
        }
        return null;
    }

    //#region network relates
    
    public async login(userid:string,password:string): Promise<NetworkLoginResult> {
        if(NetworkManager.instance.SimulateNetwork){
            return;
        }

        console.log(`login start ...`);
        const result = await NetworkManager.instance.login(userid,password);
        if(result.success){
            this.onLoginSuccess(result.user,result.sessionToken);
            await NetworkManager.instance.requestSceneItemsByUserId(userid);
            return result;
        }
        return null;
    }

    private onLoginSuccess(userData:any,token:string): void {
        //log userData
        console.log(`onLoginSuccess: userData:`,userData);
        this.playerController.playerState.initialize(userData,token);
        const networkInventoryItems = userData.inventory_items as NetworkInventoryItem[];
        console.log(`onLoginSuccess: networkInventoryItems:`,networkInventoryItems);
        this.playerController.inventoryComponent.initialize(networkInventoryItems);
        console.log(`onLoginSuccess end ... `);
    }

    private async onGetUserSceneItems(data:any): Promise<void> {
        console.log('get user scene items',data);
        if(!data.success){
            console.error('get user scene items failed');
            return;
        }
        const sceneItems = data.data as SceneItem[];
        if(data.userid == this.playerController?.playerState.id){
            await this.initializeSceneItems(this.gameplayContainer,sceneItems,this.playerController.playerState.level,true);
        }
        else{
            //visit friends's scene
            await this.initializeSceneItems(this.friendGameplayContainer,sceneItems,1,false);
        }
    }

    public async initializeSceneItems(gameplayContainer:Node,sceneItems:SceneItem[],level:number,isPlayerOwner:boolean){
        if(!gameplayContainer){
            console.error(`initializeGameplayContainer`);
            return;
        }
        const buildingContainer = gameplayContainer.getChildByName("Buildings");
        if(buildingContainer){
            buildingContainer.removeAllChildren();
        }
        let fence = isPlayerOwner ? this.playerFence : this.friendFence;
        if(!fence){
            fence = gameplayContainer.getComponentInChildren(Fence);
            if(!fence){
                console.error(`fence is not set in GameController`);
                return;
            }
            if(isPlayerOwner){
                this.playerFence = fence;
            }
            else{
                this.friendFence = fence;
            }
        }
        if(fence && !isPlayerOwner){
            fence.node.removeAllChildren();
        }
        fence.initialize(isPlayerOwner);
        let plotTiles = isPlayerOwner ? this.playerPlotTiles : this.friendPlotTiles;
        if(plotTiles && !isPlayerOwner){
            plotTiles.forEach(plotTile => {
                plotTile.node.removeAllChildren();
            });
        }
        if(!plotTiles || plotTiles.length == 0){
            plotTiles = gameplayContainer.getComponentsInChildren(PlotTile);
            if(!plotTiles){
                console.error(`plotTiles is not set in GameController`);
                return;
            }
            if(isPlayerOwner){
                this.playerPlotTiles = plotTiles;
            }
            else{
                this.friendPlotTiles = plotTiles;
            }
        }
        //sort plotTiles by name
        plotTiles.sort((a, b) => a.node.name.localeCompare(b.node.name));

        const plotNum = SharedDefines.INIT_PLOT_NUM + level - 1;
        console.log(`plotNum:${plotNum}`);
        this.initializePlotTiles(plotNum,plotTiles,isPlayerOwner);

        for (const item of sceneItems) {
            let node: Node | null = null;
            let component: Component | null = null;
            console.log("item:id" + item.id);
            switch (item.type) {
                case SceneItemType.Crop:
                    const plotTile = plotTiles?.find(tile => tile.node.name === item.parent_node_name);
                    if(!plotTile) continue;
                    node = await this.createCropNode(plotTile,item,isPlayerOwner);
                    component = node?.getComponent(Crop);
                    break;
                case SceneItemType.Animal:
                   node = await this.createAnimalNode(fence,item,isPlayerOwner);
                   component = node?.getComponent(Animal);
                    break;
                case SceneItemType.Building:
                   node = await this.createBuildingNode(buildingContainer,item);
                   component = node?.getComponent(Building);
                    break;
            }

            if (node && component) {
                //this.setupSceneItem(node, component, item);
                //convert world pos to design pos
                const worldPos = new Vec2(item.x, item.y);//new Vec2(item.x * this.screenScale.x, item.y * this.screenScale.y);
                node.setWorldPosition(new Vec3(worldPos.x, worldPos.y, 0));
            }
        }
    }

    private async createCropNode(plotTile:PlotTile,item: SceneItem,isPlayerOwner:boolean): Promise<Node | null> {
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
            crop.initializeWithSceneItem(item,isPlayerOwner);
        }

        //find plot tile in plot tiles with item.parent_node_name
       // const plotTile = this.plotTiles?.find(tile => tile.node.name === item.parent_node_name);
        if(plotTile){
            console.log(`Planting crop for item ${item.id}`);
            plotTile.plant(crop,false);
        }
        else{
            console.error(`Plot tile ${item.parent_node_name} not found`);
        }

        console.log(`Finished creating crop node for item ${item.id}`);
        return node;
    }

    private async createAnimalNode(fence:Fence,item: SceneItem,isPlayerOwner:boolean): Promise<Node | null> {
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
            animal.initializeWithSceneItem(item,isPlayerOwner);
            fence.addAnimal(animal);
        }
        else{
            console.error(`Animal component not found for item ${item.id}`);
        }
        
        
        return node;
    }

    private async createBuildingNode(buildingContainer:Node,item: SceneItem): Promise<Node | null> {
        console.log(`createBuildingNode start ...`);
        const buildData = BuildDataManager.instance.findBuildDataById(item.item_id);
        if (!buildData){
            console.error(`Building data not found for item ${item.item_id}`);
            return null;
        }

        const prefab = await ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_PLACEMENT_BUILDING);
        if (!prefab) {
            console.error(`Prefab not found for item ${item.item_id}`);
            return null;
        }

        const node = instantiate(prefab);
        buildingContainer?.addChild(node);
        //set position
        node.setWorldPosition(new Vec3(item.x, item.y, 0));
        //set layer building
        node.layer = Layers.nameToLayer(SharedDefines.LAYER_BUILDING_NAME) + 1;
        const building = node.addComponent(Building);
        if (building) {
            building.initializeFromSceneItem(item);
            
        }
        return node;
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

    protected notifyPlayExpEffect(expValue: number): void {
        const gameWindow = WindowManager.instance.getWindow(SharedDefines.WINDOW_GAME_NAME);
        if (gameWindow) {
            gameWindow.node.emit(SharedDefines.EVENT_PLAY_EXP_EFFECT, {
                expValue: expValue,
                expNode: this.node
            });
        }
    }

    public async visitFriend(userId:string): Promise<void> {
        
        const result = await NetworkManager.instance.visit(userId);
        if(result && result.success){
            console.log('visit result', result);
            this.playerController.visitMode = true;
            const playerState = new PlayerState(result.data.userId,result.data.level,result.data.exp,0,0);
            this.playerController.friendState = playerState;
            //show friendGameplayContainer
            this.setFriendGameViewVisibility(true);
            this.setGameViewVisibility(false);
            //initialize friend's scene items
            this.initializeSceneItems(this.friendGameplayContainer,result.data.sceneItems,result.data.level,false);
        }else{
            console.error('visit friend failed');
            //hide friendGameplayContainer
            this.setFriendGameViewVisibility(false);
            this.setGameViewVisibility(true);
            this.playerController.visitMode = false;
            this.playerController.friendState = null;
        }
    }

    //implement backToHome() method
    public backToHome(): void {
        this.setFriendGameViewVisibility(false);
        this.setGameViewVisibility(true);
        this.playerController.visitMode = false;
        this.playerController.friendState = null;
    }

    //#endregion

    private onPlayerLevelUp(data: { oldLevel: number, newLevel: number }): void {
        console.log(`Player level up from ${data.oldLevel} to ${data.newLevel}`);
        this.refreshPlotTilesVisibility(data.newLevel);
    }

    private refreshPlotTilesVisibility(level: number): void {
        const availablePlotTileNum = SharedDefines.INIT_PLOT_NUM + level - 1;
        console.log(`Refreshing plot tiles visibility for level ${level}, available plots: ${availablePlotTileNum}`);
        
        // Update player plot tiles
        if (this.playerPlotTiles) {
            for (let i = 0; i < this.playerPlotTiles.length; i++) {
                const plotTile = this.playerPlotTiles[i];
                if (!plotTile) continue;
                plotTile.node.active = i < availablePlotTileNum;
            }
        }
    }

}


