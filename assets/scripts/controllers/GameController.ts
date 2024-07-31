import { _decorator, Component, instantiate, Node, Prefab,EventTarget } from 'cc';
import { PlotTile } from '../entities/PlotTile';
import { PlayerController } from './PlayerController';
import { SharedDefines } from '../misc/SharedDefines';
import { CropDataManager } from '../managers/CropDataManager';
import { ItemDataManager } from '../managers/ItemDataManager';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    @property(Prefab)
    private playerControllerPrefab: Prefab| null = null;

    @property(Node)
    private gameplayContainer: Node| null = null;

    @property(PlotTile)
    private plotTiles: PlotTile[] = [];
    private playerController: PlayerController| null = null;

    public eventTarget: EventTarget = new EventTarget();

    onLoad(): void {


        this.setGameViewVisibility(false);
    }

    start() {
        this.preloadJsonDatas();
        this.initializePlayerController();
    }

    update(deltaTime: number) {
        
    }

    public preloadJsonDatas(): void 
    {
        //load json data
        CropDataManager.instance.loadCropData();
        ItemDataManager.instance.loadItemData();
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
                plotTile.eventTarget.on(SharedDefines.EVENT_PLOT_SELECTED, (plotTile:PlotTile)=>{
                    this.eventTarget.emit(SharedDefines.EVENT_PLOT_SELECTED, plotTile);
                }, this)
            }
        } else {
            console.error('plotTiles is not set in GameController');
            return;
        }
    }


}


