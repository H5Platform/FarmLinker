import { _decorator, Component, Node, director, Button, instantiate,Vec3, UITransform, Prefab, Label, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;
import { ResourceManager } from '../../managers/ResourceManager';
import { SharedDefines } from '../../misc/SharedDefines';
import { WindowBase } from '../base/WindowBase';
import { GameController } from '../../controllers/GameController';
import { PlotTile } from '../../entities/PlotTile';
import { Crop } from '../../entities/Crop';
import { DragDropComponent } from '../../components/DragDropComponent';
import { PlayerController } from '../../controllers/PlayerController';

@ccclass('GameWindow')
export class GameWindow extends WindowBase {

    @property(Label)
    public lblLevel: Label | null = null;
    @property(ProgressBar)
    public progressExp : ProgressBar | null = null;
    @property(Label)
    public lblCoin: Label | null = null;
    @property(Label)
    public lblDiamond: Label | null = null;

    @property(Node)
    public cropContainer: Node | null = null;
    @property(Button)
    public btnCrop1: Button | null = null;
    @property(Button)
    public btnCrop2: Button | null = null;
    @property(Button)
    public btnCrop3: Button | null = null;
    @property(Button)
    public btnCrop4: Button | null = null;
    
    private gameController: GameController | null = null;
    private playerController: PlayerController | null = null;
    private currentSelectedPlot: PlotTile | null = null;


    public initialize(): void 
    {
        super.initialize();
        
        const gameControllerNode = director.getScene()?.getChildByName('GameController');
        if (gameControllerNode) {
            this.gameController = gameControllerNode.getComponent(GameController);
            this.playerController = this.gameController?.getPlayerController();
        }
        this.gameController.eventTarget.on(SharedDefines.EVENT_PLOT_SELECTED, this.onPlotSelected, this);
        this.setupEventLisnters();
    }

    public show(): void 
    {
        super.show();
        //set crop container invisible
        this.cropContainer.active = false;
        this.gameController?.startGame();
        
        this.refreshBasePlayerStateInfo();
    }

    public hide(): void 
    {
        super.hide();
    }

    // update(deltaTime: number) {
        
    // }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.playerController) {
            const playerState = this.playerController.playerState;
            playerState.eventTarget.off(SharedDefines.EVENT_PLAYER_LEVEL_UP, this.refreshBasePlayerStateInfo, this);
            playerState.eventTarget.off(SharedDefines.EVENT_PLAYER_EXP_CHANGE, this.refreshBasePlayerStateInfo, this);
            playerState.eventTarget.off(SharedDefines.EVENT_PLAYER_GOLD_CHANGE, this.refreshBasePlayerStateInfo, this);
            playerState.eventTarget.off(SharedDefines.EVENT_PLAYER_DIAMOND_CHANGE, this.refreshBasePlayerStateInfo, this);
        }
        this.btnCrop1?.node.off(Button.EventType.CLICK, this.onBtnCrop1Clicked, this);
        this.btnCrop2?.node.off(Button.EventType.CLICK, this.onBtnCrop2Clicked, this);
        this.btnCrop3?.node.off(Button.EventType.CLICK, this.onBtnCrop3Clicked, this);
        this.btnCrop4?.node.off(Button.EventType.CLICK, this.onBtnCrop4Clicked, this);
    }

    private setupEventLisnters(): void 
    {
        if (this.playerController) {
            const playerState = this.playerController.playerState;
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_LEVEL_UP, this.refreshBasePlayerStateInfo, this);
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_EXP_CHANGE, this.refreshBasePlayerStateInfo, this);
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_GOLD_CHANGE, this.refreshBasePlayerStateInfo, this);
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_DIAMOND_CHANGE, this.refreshBasePlayerStateInfo, this);
        }
        this.btnCrop1?.node.on(Button.EventType.CLICK, this.onBtnCrop1Clicked, this);
        this.btnCrop2?.node.on(Button.EventType.CLICK, this.onBtnCrop2Clicked, this);
        this.btnCrop3?.node.on(Button.EventType.CLICK, this.onBtnCrop3Clicked, this);
        this.btnCrop4?.node.on(Button.EventType.CLICK, this.onBtnCrop4Clicked, this);
    }

    private refreshBasePlayerStateInfo(): void {
        if (!this.gameController || this.playerController === null){
            console.error('GameController or playerController is not set');
            return;
        }
        const playerState = this.playerController.playerState;
    
        if (this.lblLevel) {
            this.lblLevel.string = playerState.level.toString();
        }
    
        if (this.progressExp) {
            const currentExp = playerState.experience;
            console.log('currentExp: ' + currentExp);
            const expNeededForNextLevel = this.getExpNeededForNextLevel(playerState.level);
            this.progressExp.progress = currentExp / expNeededForNextLevel;
        }
    
        if (this.lblCoin) {
            this.lblCoin.string = playerState.gold.toString();
        }
    
        if (this.lblDiamond) {
            this.lblDiamond.string = playerState.diamond.toString();
        }
    }
    
    private getExpNeededForNextLevel(level: number): number {
        // This should match the logic in PlayerState
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    private async plantCrop(cropPath: string): Promise<void> {
        if (!this.currentSelectedPlot || this.currentSelectedPlot.isOccupied) {
            console.log('No valid plot selected or plot is already occupied');
            return;
        }

        let prefab = await ResourceManager.instance.loadPrefab(cropPath);
        if (!prefab) {
            console.error(`Failed to load crop prefab: ${cropPath}`);
            return;
        }
        
        const cropNode = instantiate(prefab);
        const crop = cropNode.getComponent(Crop);
        if (!crop) {
            console.error(`Failed to get Crop component from prefab: ${cropPath}`);
            return;
        }

        this.currentSelectedPlot.node.addChild(cropNode);
        cropNode.setPosition(Vec3.ZERO);
        this.currentSelectedPlot.occupy(crop);
        crop.initialize();
        crop.startGrowing();

        this.cropContainer!.active = false;
        this.currentSelectedPlot = null;
    }

    private async onBtnCrop1Clicked(): Promise<void> 
    {
        await this.plantCrop(SharedDefines.PREFAB_CROP_CORN);
    }

    private async onBtnCrop2Clicked(): Promise<void> 
    {
        await this.plantCrop(SharedDefines.PREFAB_CROP_CARROT);
    }

    private async onBtnCrop3Clicked(): Promise<void> 
    {
        await this.plantCrop(SharedDefines.PREFAB_CROP_GRAPE);
    }

    private async onBtnCrop4Clicked(): Promise<void> 
    {
        await this.plantCrop(SharedDefines.PREFAB_CROP_CABBAGE);
    }

    //create onPlotSelected func , when plot is selected, show crop container
    private onPlotSelected(plot: PlotTile): void 
    {
        if (plot.isOccupied) 
            return;
        this.cropContainer!.active = true;
        this.currentSelectedPlot = plot;
    }
}


