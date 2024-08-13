import { _decorator, Component, instantiate, Node, Prefab,EventTarget } from 'cc';
import { PlotTile } from '../entities/PlotTile';
import { PlayerController } from './PlayerController';
import { SharedDefines } from '../misc/SharedDefines';
import { CropDataManager } from '../managers/CropDataManager';
import { ItemDataManager } from '../managers/ItemDataManager';
import { BuildDataManager } from '../managers/BuildDataManager';
import { AnimalDataManager } from '../managers/AnimalDataManager';
import { Fence } from '../entities/Fence';
import { Animal } from '../entities/Animal';
import { NetworkManager } from '../managers/NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    @property(Prefab)
    private playerControllerPrefab: Prefab| null = null;

    @property(Node)
    private gameplayContainer: Node| null = null;

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

    private async login(): Promise<void> {
        //TODO replace userid with real user id
        const userid = "123";
        await NetworkManager.instance.login(userid);
    }

    private onLoginSuccess(userData:any,token:string): void {
        console.log('login success');
        this.playerController.playerState.initialize(userData,token);
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
        
        inventoryComponent.removeItem(animal.SourceInventoryItem.id,1);
    }
}


