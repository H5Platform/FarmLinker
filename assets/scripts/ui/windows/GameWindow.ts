import { _decorator, Component, Node, director, Button, instantiate,Vec3, UITransform, Prefab, Label, ProgressBar, Layout, ScrollView, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;
import { ResourceManager } from '../../managers/ResourceManager';
import { CropType, SharedDefines } from '../../misc/SharedDefines';
import { WindowBase } from '../base/WindowBase';
import { GameController } from '../../controllers/GameController';
import { PlotTile } from '../../entities/PlotTile';
import { Crop } from '../../entities/Crop';
import { PlayerController } from '../../controllers/PlayerController';
import { CropDataManager } from '../../managers/CropDataManager';
import { SpriteHelper } from '../../helpers/SpriteHelper';
import { EDITOR } from 'cc/env';
import { WindowManager } from '../WindowManager';
import { CoinDisplay } from '../components/CoinDisplay';
import { DiamondDisplay } from '../components/DiamondDisplay';
import { NetworkManager } from '../../managers/NetworkManager';

@ccclass('GameWindow')
export class GameWindow extends WindowBase {

    @property(Label)
    public lblLevel: Label | null = null;
    @property(ProgressBar)
    public progressExp : ProgressBar | null = null;
    @property(CoinDisplay)
    public coinDisplay: CoinDisplay | null = null;
    @property(DiamondDisplay)
    public diamondDisplay: DiamondDisplay | null = null;

    @property(ScrollView)
    public scrollViewCrops: ScrollView | null = null;
    @property(Node)
    public cropContainer: Node | null = null;
    @property(Node)
    public cropButtonTemplate: Node | null = null;

    @property(Button)
    public btnCraft: Button | null = null;
    //button shop
    @property(Button)
    public btnShop: Button | null = null;

    @property(Button)
    public btnFriend: Button | null = null;
    
    private cropButtons: Node[] = [];

    //private gameController: GameController | null = null;
    private playerController: PlayerController | null = null;
    private currentSelectedPlot: PlotTile | null = null;


    public initialize(): void 
    {
        super.initialize();
        
        if (this.gameController) {
            this.playerController = this.gameController?.getPlayerController();
            if (this.coinDisplay) {
                this.coinDisplay.initialize(this.playerController.playerState);
            }
            if (this.diamondDisplay) {
                this.diamondDisplay.initialize(this.playerController.playerState);
            }
        }
        this.gameController.eventTarget.on(SharedDefines.EVENT_PLOT_SELECTED, this.onPlotSelected, this);
        this.setupEventLisnters();
        this.initializeCropButtons();
    }

    public show(...args: any[]): void 
    {
        super.show(...args);
        //set crop container invisible
        this.scrollViewCrops.node.active = false;
        this.gameController?.startGame();

        if (this.coinDisplay) {
            this.coinDisplay.refreshDisplay();
        }
        if (this.diamondDisplay) {
            this.diamondDisplay.refreshDisplay();
        }
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
            playerState.eventTarget.off(SharedDefines.EVENT_PLAYER_LEVEL_UP, this.onPlayerLeveUp, this);
            playerState.eventTarget.off(SharedDefines.EVENT_PLAYER_EXP_CHANGE, this.refreshBasePlayerStateInfo, this);
        }
        //btnCraft click event
        if (this.btnCraft) {
            this.btnCraft.node.off(Button.EventType.CLICK, this.onBtnCraftClicked, this);
        }
    }

    private setupEventLisnters(): void 
    {
        if (this.playerController) {
            const playerState = this.playerController.playerState;
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_LEVEL_UP, this.onPlayerLeveUp, this);
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_EXP_CHANGE, this.refreshBasePlayerStateInfo, this);
        }
        //btnCraft click event
        if (this.btnCraft) {
            this.btnCraft.node.on(Button.EventType.CLICK, this.onBtnCraftClicked, this);
        }
        //btnShop click event
        if (this.btnShop) {
            this.btnShop.node.on(Button.EventType.CLICK, this.onBtnShopClicked, this);
        }
        //btnFriend click event
        if (this.btnFriend) {
            this.btnFriend.node.on(Button.EventType.CLICK, this.onBtnFriendClicked, this);
        }
    }

    private onPlayerLeveUp(): void 
    {
        
        this.refreshBasePlayerStateInfo();
    }

    private initializeCropButtons(): void 
    {
        if (!this.cropButtonTemplate || !this.scrollViewCrops) {
            console.error('Crop button template or scroll view content is not set');
            return;
        }
        //clear all cropButtons
        for (let i = 0; i < this.cropButtons.length; ++i) {
            this.cropButtons[i].destroy();
            this.cropButtons[i] = null;
        }
        this.cropButtons = [];
        
        const cropDataList = CropDataManager.instance.getAllCropData();
        const playerLevel = this.playerController?.playerState.level || 1;

        let lastCropType = -1;
        const content = this.scrollViewCrops.content;
        for (let i = 0; i < cropDataList.length; ++i) {
            
            const cropData = cropDataList[i];
            //check if croptype == -1 or croptype != cropdata.croptype
            const curCropType = parseInt(cropData.crop_type);
           // console.log('curCropType: ' + curCropType + ',' + ' lastCropType: ' + lastCropType);
            if (!(lastCropType === -1 || curCropType !== lastCropType)) {
                continue;
            }
            lastCropType = parseInt(cropData.crop_type);
            
            const buttonNode = instantiate(this.cropButtonTemplate);
            buttonNode.name = cropData.id;
            buttonNode.active = parseInt(cropData.level_need) <= playerLevel;
            content.addChild(buttonNode);
            //if editor
            
            if(cropData.icon !== ''){
                const buttonSprite = buttonNode.getComponent(Sprite);
                  ResourceManager.instance.loadAsset(`${SharedDefines.WINDOW_GAME_TEXTURES}` + cropData.icon + '/spriteFrame', SpriteFrame).then((texture) => {
                    if (texture) {
                        buttonSprite.spriteFrame = texture as SpriteFrame;
                    }
                  });
            }

            buttonNode.on(Button.EventType.CLICK, () => this.onCropButtonClicked(parseInt(cropData.crop_type) as CropType), this);
            this.cropButtons.push(buttonNode);
        }

        const layout = content.getComponent(Layout);
        if (layout) {
            layout.updateLayout();
        }
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
    }
    
    private getExpNeededForNextLevel(level: number): number {
        // This should match the logic in PlayerState
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    private async plantCrop(cropType :CropType): Promise<void> {
        if (!this.currentSelectedPlot || this.currentSelectedPlot.isOccupied) {
            console.log('No valid plot selected or plot is already occupied');
            return;
        }

        let prefab = await ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_CROP_CORN);
        if (!prefab) {
            console.error(`Failed to load crop prefab: ${SharedDefines.PREFAB_CROP_CORN}`);
            return;
        }
        
        const cropNode = instantiate(prefab);
        const crop = cropNode.getComponent(Crop);
        if (!crop) {
            console.error(`Failed to get Crop component from prefab: ${cropNode.name}`);
            return;
        }

        this.currentSelectedPlot.node.addChild(cropNode);
        cropNode.setPosition(Vec3.ZERO);
        this.currentSelectedPlot.occupy(crop);
        crop.initialize(cropType);
        crop.startGrowing();

        this.scrollViewCrops.node!.active = false;
        this.currentSelectedPlot = null;
    }

    private async onCropButtonClicked(cropType : CropType): Promise<void>  {
        console.log('onCropButtonClicked: ' + cropType);
        this.plantCrop(cropType);
    }

    //create onPlotSelected func , when plot is selected, show crop container
    private onPlotSelected(plot: PlotTile): void 
    {
        if (plot.isOccupied) 
            return;
        this.scrollViewCrops.node!.active = true;
        this.currentSelectedPlot = plot;
    }

    private onBtnCraftClicked(): void {
        WindowManager.instance.show(SharedDefines.WINDOW_CRAFT_NAME);
    }

    //btnshop clicked
    private onBtnShopClicked(): void {
        WindowManager.instance.show(SharedDefines.WINDOW_SHOP_NAME);
    }

    private async onBtnFriendClicked(): Promise<void> {
        console.log('onBtnFriendClicked');
        await NetworkManager.instance.requestSceneItemsByUserId("456");
    }
}


