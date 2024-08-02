import { _decorator, Component, Node, ScrollView, instantiate, Prefab, Label, Sprite, resources, SpriteFrame, Button } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { BuildDataManager } from '../../managers/BuildDataManager';
import { PlayerController } from '../../controllers/PlayerController';
import { ResourceManager } from '../../managers/ResourceManager';
import { SharedDefines } from '../../misc/SharedDefines';
import { WindowManager } from '../WindowManager';
import { CoinDisplay } from '../components/CoinDisplay';
import { DiamondDisplay } from '../components/DiamondDisplay';
const { ccclass, property } = _decorator;

@ccclass('CraftWindow')
export class CraftWindow extends WindowBase {
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
    private btnClose: Button | null = null;

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
        if (this.btnClose) {
            this.btnClose.node.on(Button.EventType.CLICK, this.onCloseButtonClicked, this);
        } else {
            console.warn('Close button not found in CraftWindow');
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
            const label = item.getComponentInChildren(Label);
            const sprite = item.getComponentInChildren(Sprite);

            if (label) {
                label.string = buildData.name;
            }

            if (sprite) {
                const spriteFrame = await this.loadSpriteFrame(buildData.icon);
                if (spriteFrame) {
                    sprite.spriteFrame = spriteFrame;
                }
            }

            item.name = buildData.id;
            this.content.addChild(item);
            this.buildItems.push(item);
        }

        this.updateItemsVisibility();
    }

    private async loadSpriteFrame(iconName: string): Promise<SpriteFrame | null> {
        return new Promise((resolve) => {
            resources.load(`${SharedDefines.WINDOW_CRAFT_TEXTURES}${iconName}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load sprite frame for ${iconName}:`, err);
                    resolve(null);
                } else {
                    resolve(spriteFrame);
                }
            });
        });
    }

    private updateItemsVisibility(): void {
        if (!this.playerController) return;

        const playerLevel = this.playerController.playerState.level;
        const buildDataList = BuildDataManager.instance.getAllBuildData();

        for (let i = 0; i < this.buildItems.length; i++) {
            const item = this.buildItems[i];
            const buildData = buildDataList[i];
            const requiredLevel = parseInt(buildData.level_need);

            item.active = playerLevel >= requiredLevel;
        }
    }

    public show(): void {
        super.show();
        this.updateItemsVisibility();
        if (this.coinDisplay) {
            this.coinDisplay.refreshDisplay();
        }
        if (this.diamondDisplay) {
            this.diamondDisplay.refreshDisplay();
        }
    }

    public refreshItems(): void {
        this.updateItemsVisibility();
    }
}