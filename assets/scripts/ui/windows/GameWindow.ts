import { _decorator, Component, Node, director, Button, instantiate,Vec3, UITransform, Prefab, Label, ProgressBar, Layout, ScrollView, Sprite, SpriteFrame, Color, Widget } from 'cc';
const { ccclass, property } = _decorator;
import { ResourceManager } from '../../managers/ResourceManager';
import { CropType, NetworkRecommendFriendsResultData, SharedDefines } from '../../misc/SharedDefines';
import { WindowBase } from '../base/WindowBase';
import { PlotTile } from '../../entities/PlotTile';
import { PlayerController } from '../../controllers/PlayerController';
import { CropDataManager } from '../../managers/CropDataManager';
import { SpriteHelper } from '../../helpers/SpriteHelper';
import { WindowManager } from '../WindowManager';
import { CoinDisplay } from '../components/CoinDisplay';
import { DiamondDisplay } from '../components/DiamondDisplay';
import { NetworkManager } from '../../managers/NetworkManager';
import { GradeDataManager } from '../../managers/GradeDataManager';
import { UIHelper } from '../../helpers/UIHelper';
import { UIEffectHelper } from '../../helpers/UIEffectHelper';
import { CoinType } from '../../effects/CoinCollectionEffectComponent';
import { GrowthableEntity } from '../../entities/GrowthableEntity';
import { Crop } from '../../entities/Crop';
import { Animal } from '../../entities/Animal';

@ccclass('GameWindow')
export class GameWindow extends WindowBase {

    @property(Label)
    public lbUserName: Label | null = null;
    @property(Label)
    public lbProsperity: Label | null = null;
    @property(Label)
    public lblLevel: Label | null = null;
    @property(Label)
    public lbHome: Label | null = null;
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

    @property(ScrollView)
    public friendScrollView: ScrollView | null = null;

    @property(Node)
    public friendButtonTemplate: Node | null = null;

    @property(Button)
    public btnAddCoin:Button|null =null;

    @property(Button)
    public btnAddDiamond:Button|null =null;

    @property(Button)
    public btnCraft: Button | null = null;
    //button shop
    @property(Button)
    public btnShop: Button | null = null;

    @property(Button)
    public btnFriend: Button | null = null;

    @property(Button)
    public btnBack: Button | null = null;
    
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
        if (this.lbHome) {
            // TODO Need translate later
            this.lbHome.string = "我的家";
        }
        //set crop container invisible
        this.scrollViewCrops.node.active = false;
        //set friendScrollView invisible
        this.friendScrollView.node.active = false;
        this.gameController?.startGame();

        if (this.coinDisplay) {
            this.coinDisplay.refreshDisplay();
        }
        if (this.diamondDisplay) {
            this.diamondDisplay.refreshDisplay();
        }
        this.refreshBasePlayerStateInfo();
        this.updateButtonsVisibility();
        this.updateRecommendedFriends();
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
            this.playerController.eventTarget.off(SharedDefines.EVENT_VISIT_MODE_CHANGE, this.updateButtonsVisibility, this);
            const playerState = this.playerController.playerState;
            playerState.eventTarget.off(SharedDefines.EVENT_PLAYER_LEVEL_UP, this.onPlayerLeveUp, this);
            playerState.eventTarget.off(SharedDefines.EVENT_PLAYER_EXP_CHANGE, this.refreshBasePlayerStateInfo, this);
        }

        const content = this.friendScrollView?.content;
        if (content) {
            content.children.forEach(child => {
                const button = child.getComponent(Button);
                if (button) {
                    button.node.off(Button.EventType.CLICK);
                }
            });
        }
        
        //btnCraft click event
        if (this.btnCraft) {
            this.btnCraft.node.off(Button.EventType.CLICK, this.onBtnCraftClicked, this);
        }

 
    }

    private setupEventLisnters(): void 
    {
        if (this.playerController) {
            this.playerController.eventTarget.on(SharedDefines.EVENT_VISIT_MODE_CHANGE, this.updateButtonsVisibility, this);
            const playerState = this.playerController.playerState;
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_LEVEL_UP, this.onPlayerLeveUp, this);
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_EXP_CHANGE, this.refreshBasePlayerStateInfo, this);
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_GOLD_CHANGE, this.refreshBasePlayerStateInfo, this);
            playerState.eventTarget.on(SharedDefines.EVENT_PLAYER_DIAMOND_CHANGE, this.refreshBasePlayerStateInfo, this);
        }
        //btnAddCoin click event
        if (this.btnAddCoin) {
            this.btnAddCoin.node.on(Button.EventType.CLICK, this.onBtnAddCoinClicked, this);
        }
        //btnAddDiamond click event
        if (this.btnAddDiamond) {
            this.btnAddDiamond.node.on(Button.EventType.CLICK, this.onBtnAddDiamondClicked, this);
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

        if (this.btnBack) {
            this.btnBack.node.on(Button.EventType.CLICK, this.onBtnBackClicked, this);
        }
        this.node.on(SharedDefines.EVENT_PLAY_EXP_EFFECT, this.onPlayExpEffect, this);
    }

    private updateButtonsVisibility(): void {
        
        //check if is visit mode
        const visitMode = this.gameController?.getPlayerController().visitMode ?? false;
        console.log(`updateButtonsVisibility ${visitMode}`);
       // this.btnFriend.enabled = !visitMode;
        this.btnShop.enabled = !visitMode;
        this.btnCraft.enabled = !visitMode;
        this.btnBack.node.active = visitMode;

        if(visitMode){
            SpriteHelper.setSpriteColor(this.btnShop.getComponent(Sprite), Color.GRAY);
            SpriteHelper.setSpriteColor(this.btnCraft.getComponent(Sprite), Color.GRAY);
            //SpriteHelper.setSpriteColor(this.btnFriend.getComponent(Sprite), Color.GRAY);
        }else{
            SpriteHelper.setSpriteColor(this.btnShop.getComponent(Sprite), Color.WHITE);
            SpriteHelper.setSpriteColor(this.btnCraft.getComponent(Sprite), Color.WHITE);
            //SpriteHelper.setSpriteColor(this.btnFriend.getComponent(Sprite), Color.WHITE);
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
        console.log(`refreshBasePlayerStateInfo: level: ${playerState.level}`);
        if (this.lbUserName) {
            this.lbUserName.string = playerState.nickname;
        }
        if (this.lbProsperity) {
            console.log('playerState.prosperity: ' + playerState.prosperity);
            this.lbProsperity.string = playerState.prosperity.toString();
            
        }
        if (this.lblLevel) {
            this.lblLevel.string = playerState.level.toString();
        }
    
        if (this.progressExp) {
            const currentExp = playerState.experience;
            console.log('currentExp: ' + currentExp);
            const expNeededForNextLevel = this.getExpNeededForNextLevel(playerState.level);
            this.progressExp.progress = currentExp * 1.0 / expNeededForNextLevel;
            //log currentExp and expNeededForNextLevel and progress
            console.log('currentExp: ' + currentExp + ', expNeededForNextLevel: ' + expNeededForNextLevel + ', progress: ' + this.progressExp.progress);
        }

        if (this.coinDisplay) {
            this.coinDisplay.refreshDisplay();
        }
        if (this.diamondDisplay) {
            this.diamondDisplay.refreshDisplay();
        }
    }
    
    private getExpNeededForNextLevel(level: number): number {
        return GradeDataManager.instance.getExpNeededForLevel(level + 1);
    }

    private async onCropButtonClicked(cropType : CropType): Promise<void>  {
        console.log('onCropButtonClicked: ' + cropType);
        //this.plantCrop(cropType);
    }

    //create onPlotSelected func , when plot is selected, show crop container
    private onPlotSelected(plot: PlotTile): void 
    {
        if (plot.isOccupied) 
            return;
        this.scrollViewCrops.node!.active = true;
        this.currentSelectedPlot = plot;
    }

    private onBtnAddCoinClicked(): void {
        //DashFunManager.instance.requestPayment("金币*100","购买金币",PayItemType.Coin,1);
       // this.playerController?.playerState.addCoin(100);

        WindowManager.instance.show(SharedDefines.WINDOW_COIN_NAME);
    }

    private onBtnAddDiamondClicked(): void {
        //DashFunManager.instance.requestPayment("钻石*100","购买钻石",PayItemType.Diamond,1);
       // this.playerController?.playerState.addDiamond(100);
       WindowManager.instance.show(SharedDefines.WINDOW_PAYMENT_NAME);
    }

    private onBtnCraftClicked(): void {
        WindowManager.instance.show(SharedDefines.WINDOW_CRAFT_NAME);
    }

    //btnshop clicked
    private onBtnShopClicked(): void {
        WindowManager.instance.show(SharedDefines.WINDOW_SHOP_NAME);
    }

    private async onBtnFriendClicked(): Promise<void> {
        //toggle friendScrollView
        this.friendScrollView.node.active = !this.friendScrollView.node.active;
        console.log('onBtnFriendClicked');
       // this.gameController?.visitFriend("123");

       const widget = this.friendScrollView.content.getComponent(Widget);
       if(widget)
       {
            widget.updateAlignment();
       }
    }

    private onBtnBackClicked(): void {
        this.gameController?.backToHome();
    }

    private async updateRecommendedFriends(): Promise<void> {
        if (!this.friendScrollView || !this.friendButtonTemplate) {
            console.error('Friend ScrollView or button template is not set');
            return;
        }

        const userId = this.playerController?.playerState.id;
        if (!userId) {
            console.error('User ID is not available');
            return;
        }

        const result = await NetworkManager.instance.recommendFriends(userId, 5);
        if (result && result.success) {
            //log all data
            console.log(result.data);
            this.populateFriendScrollView(result.data);
        } else {
            console.error('Failed to get recommended friends');
        }
    }

    private populateFriendScrollView(friendsData: NetworkRecommendFriendsResultData[]): void {
        const content = this.friendScrollView.content;
        //remove all children except friendButtonTemplate
        content.children.forEach(child => {
            if (child !== this.friendButtonTemplate) {
                child.destroy();
            }
        });

        friendsData.forEach(friend => {
            const buttonNode = instantiate(this.friendButtonTemplate);
            buttonNode.active = true;
            content.addChild(buttonNode);

            buttonNode.name = friend.id;

            // Set friend name
            const nameLabel = buttonNode.getChildByName('txtName')?.getComponent(Label);
            if (nameLabel) {
                nameLabel.string = friend.nickname;
            }

            // Set friend avatar (assuming there's an avatar URL in the friend data)
            if (friend.avatarUrl) {
                const avatarSprite = buttonNode.getComponent(Sprite);
                if (avatarSprite && friend.avatarUrl) {
                    // Load and set avatar sprite frame
                    ResourceManager.instance.loadAsset<SpriteFrame>(friend.avatarUrl, SpriteFrame).then(spriteFrame => {
                        if (spriteFrame) {
                            avatarSprite.spriteFrame = spriteFrame;
                        }
                    });
                }
            }
            // Add click event to visit friend
            const button = buttonNode.getComponent(Button);
            if (button) {
                button.node.on(Button.EventType.CLICK, () => this.onFriendButtonClicked(friend.id), this);
            }
        });

        const layout = content.getComponent(Layout);
        if (layout) {
            layout.updateLayout();
        }
    }

    private async onFriendButtonClicked(friendUserId: string): Promise<void> {
        const friendData = await this.gameController?.visitFriend(friendUserId);
        //set scrollview invisible
        this.friendScrollView.node.active = false;
        if (this.lbHome && friendData) {
            // TODO Need translate later
            this.lbHome.string = friendData.nickName + "的家";
        }
    }

    
    private async onPlayExpEffect(event: any): Promise<void> {
        const { expValue, expNode } = event;
        await this.playExpEffect(expNode, expValue);
    }

    private async playExpEffect(sourceNode: Node, expValue: number): Promise<void> {
        console.log('playExpEffect: ' + expValue);

        // 获取当前 Canvas
        const gameCanvas = this.gameController?.GameplayCanvas; //this.node.parent;
        // 获取源节点所在的 Canvas
        const uiCanvas = this.gameController?.UICanvas;
        
        // 转换坐标
        const startWorldPos = sourceNode.getWorldPosition();
        const convertedStartPos = UIHelper.convertPositionBetweenCanvas(
            startWorldPos,
            gameCanvas.node,
            uiCanvas.node
        );

        // 获取目标金币图标的世界坐标
        const endPos = this.lblLevel.node.getWorldPosition();//this.coinDisplay.currencySpriteNode.getWorldPosition();
        
        const entity = sourceNode.getComponent(Crop);
        let spriteFrame = null;
        if(entity){
            spriteFrame = entity.sprite.spriteFrame;
        }
        else
        {
            const animal = sourceNode.getComponent(Animal);
            if(animal){
                spriteFrame = animal.sprite.spriteFrame;
            }
        }
        // 播放Exp收集特效
        //replace with playHarvestEffect effect
        const expEffect = await UIEffectHelper.playHarvestEffect(
            this.node,
            convertedStartPos,
            endPos,
            spriteFrame
        );

        // // 特效完成后更新金币数量
        // coinEffect.node.on("effectComplete", () => {
        //     // 通知 PlayerController 更新金币
        //     this.playerController?.harvestCrop(harvestValue);
        // }, coinEffect.node);
    }
}


