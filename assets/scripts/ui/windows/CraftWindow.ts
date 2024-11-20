import { _decorator, Component, Node, ScrollView, instantiate, Prefab, Label, Sprite, resources, SpriteFrame, Button, Vec2, UITransform, Vec3 } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { BuildDataManager } from '../../managers/BuildDataManager';
import { PlayerController } from '../../controllers/PlayerController';
import { SharedDefines } from '../../misc/SharedDefines';
import { WindowManager } from '../WindowManager';
import { CoinDisplay } from '../components/CoinDisplay';
import { DiamondDisplay } from '../components/DiamondDisplay';
import { BuildingManager } from '../../managers/BuildingManager';
import { CraftScrollViewItem } from '../components/ScrollViewItems/CraftScrollViewItem';

const { ccclass, property } = _decorator;

enum ViewType{
    BUILDING,
    PLACEMENT
}

@ccclass('CraftWindow')
export class CraftWindow extends WindowBase {
    @property(Node)
    private buildingView: Node | null = null;
    @property(Node)
    private placementView: Node | null = null;
    @property(Node)
    private placementContainer: Node | null = null;
    @property(ScrollView)
    private scrollView: ScrollView | null = null;

    @property(Node)
    private itemTemplate: Node | null = null;

    @property(Node)
    private content: Node | null = null;

    @property(CoinDisplay)
    private coinDisplay: CoinDisplay | null = null;
    @property(DiamondDisplay)
    private diamondDisplay: DiamondDisplay | null = null;
    @property(Button)
    private btnPlacement: Button | null = null;
    @property(Button)
    private btnCancel: Button | null = null;
    @property(Button)
    private btnClose: Button | null = null;

    private viewType: ViewType = ViewType.BUILDING;
    private playerController: PlayerController | null = null;
    private buildItems: Node[] = [];

    public initialize(): void {
        super.initialize();
       
        if(this.gameController)
        {
            this.playerController = this.gameController.getPlayerController();
            if (!this.playerController) {
                console.error('PlayerController not found on CraftWindow node');
                return;
            }
            if (this.coinDisplay) {
                this.coinDisplay.initialize(this.playerController.playerState);
            }
            if (this.diamondDisplay) {
                this.diamondDisplay.initialize(this.playerController.playerState);
            }
        }
        this.loadBuildItems();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if(this.playerController){
            this.playerController.eventTarget.on(SharedDefines.EVENT_PLAYER_PLACEMENT_BUILDING, this.onPlacementBuilding, this);
        }
        if (this.btnClose) {
            this.btnClose.node.on(Button.EventType.CLICK, this.onCloseButtonClicked, this);
        } else {
            console.warn('Close button not found in CraftWindow');
        }
        if (this.btnPlacement) {
            this.btnPlacement.node.on(Button.EventType.CLICK, this.onBtnPlacementClicked, this);
        }
        if (this.btnCancel) {
            this.btnCancel.node.on(Button.EventType.CLICK, this.onBtnCancelClicked, this);
        }
    }

    private onCloseButtonClicked(): void {
        WindowManager.instance.hide(SharedDefines.WINDOW_CRAFT_NAME);
    }

    private async loadBuildItems(): Promise<void> {
        if (!this.content || !this.itemTemplate) {
            console.error('Content node or item prefab is missing');
            return;
        }

        const buildDataList = BuildDataManager.instance.getAllBuildData();
        for (const buildData of buildDataList) {
            const item = instantiate(this.itemTemplate);
            const craftScrollViewItem = item.getComponent(CraftScrollViewItem);
            if (craftScrollViewItem) {
                craftScrollViewItem.initialize(buildData, this.onBuildItemClicked.bind(this));
                this.content.addChild(item);
                this.buildItems.push(item);
            } else {
                console.error('CraftScrollViewItem component not found on item prefab');
            }
        }

        this.updateItemsVisibility();
        //set itemTemplate to inactive
        this.itemTemplate.active = false;
    }

    private updateItemsVisibility(): void {
        if (!this.playerController) return;

        const playerLevel = this.playerController.playerState.level;

        for (let i = 0; i < this.buildItems.length; i++) {
            const item = this.buildItems[i].getComponent(CraftScrollViewItem);

            if (item) {
                item.updateVisibilityByLevel(playerLevel);
            }
        }
    }

    public show(...args: any[]): void {
        super.show(...args);
        this.switchView(ViewType.BUILDING);
    }

    public refreshItems(): void {
        this.updateItemsVisibility();
    }

    private switchView(viewType: ViewType): void {
        this.viewType = viewType;
        if(this.viewType === ViewType.BUILDING) {
            this.buildingView.active = true;
            this.placementView.active = false;
            this.updateItemsVisibility();
            if (this.coinDisplay) {
                this.coinDisplay.refreshDisplay();
            }
            if (this.diamondDisplay) {
                this.diamondDisplay.refreshDisplay();
            }
        }
        else{
            this.buildingView.active = false;
            this.placementView.active = true;
            
        }
    }

    private onBuildItemClicked(buildData: any): void {
        console.log(`Build item clicked: ${buildData.name}`);

        const buildingManager = BuildingManager.instance;
        // if (buildingManager.hasBuildingOfType(buildData.id)) {
        //     // 跳转到已有建筑
        //     buildingManager.focusOnBuilding(buildData.id);
        // } else {
            //check if player has enough coins
            if(this.playerController.playerState.gold >= buildData.cost_coin){
                // 开始新建筑放置
                this.switchView(ViewType.PLACEMENT);
                this.startBuildingPlacement(buildData);
            }
            else{
                //TODO 弹出对话框提示玩家没有足够的硬币
                console.log("Not enough coins");
            }
        // }

    }

    private startBuildingPlacement(buildData: any): void {
        if (this.playerController) {
            this.playerController.startBuildingPlacement(buildData,this.placementContainer);
        }
    }

    private onBtnPlacementClicked(): void {
        if (this.playerController) {
            this.playerController.tryPlacementBuilding();
        }
    }

    private onBtnCancelClicked(): void {
        if (this.playerController) {
            this.playerController.cancelBuildingPlacement();
        }
    }

    
    private onPlacementBuilding(success : boolean):void {
        if (!success) {
            this.switchView(ViewType.BUILDING);
        }
        else{
            WindowManager.instance.hide(SharedDefines.WINDOW_CRAFT_NAME);
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.btnClose) {
            this.btnClose.node.off(Button.EventType.CLICK, this.onCloseButtonClicked, this);
        }
        if (this.btnPlacement) {
            this.btnPlacement.node.off(Button.EventType.CLICK, this.onBtnPlacementClicked, this);
        }
        if (this.btnCancel) {
            this.btnCancel.node.off(Button.EventType.CLICK, this.onBtnCancelClicked, this);
        }
        
        for (const item of this.buildItems) {
            const button = item.getComponent(Button);
            if (button) {
                button.node.off(Button.EventType.CLICK);
            }
        }
    }
}