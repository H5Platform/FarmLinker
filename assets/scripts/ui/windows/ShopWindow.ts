import { _decorator, Node, ScrollView, instantiate, Prefab, Label, Sprite, Button, Vec3, Tween, Color, SpriteFrame } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { PlayerController } from '../../controllers/PlayerController';
import { InventoryComponent, InventoryItem } from '../../components/InventoryComponent';
import { ItemDataManager } from '../../managers/ItemDataManager';
import { ResourceManager } from '../../managers/ResourceManager';
import { SharedDefines } from '../../misc/SharedDefines';
import { CoinDisplay } from '../components/CoinDisplay';
import { DiamondDisplay } from '../components/DiamondDisplay';
import { WindowManager } from '../WindowManager';


const { ccclass, property } = _decorator;

enum ShopMode {
    BUY,
    SELL
}

@ccclass('ShopWindow')
export class ShopWindow extends WindowBase {

    @property(Node)
    private purchaseNode: Node | null = null;

    @property(Node)
    private sellNode: Node | null = null;

    @property(ScrollView)
    private purchaseScrollView: ScrollView | null = null;

    @property(ScrollView)
    private sellScrollView: ScrollView | null = null;

    @property(Prefab)
    private itemPrefab: Prefab | null = null;

    @property(CoinDisplay)
    public coinDisplay: CoinDisplay | null = null;
    @property(DiamondDisplay)
    public diamondDisplay: DiamondDisplay | null = null;

    @property(Button)
    private buyButton: Button | null = null;

    @property(Button)
    private sellButton: Button | null = null;

    @property(Button)
    private closeButton: Button | null = null;

    private playerController: PlayerController | null = null;
    private inventoryComponent: InventoryComponent | null = null;
    private currentMode: ShopMode = ShopMode.BUY;

    private purchaseItemPool: Node[] = [];
    private sellItemPool: Node[] = [];

    public initialize(): void {
        super.initialize();
        this.initializeComponents();
        this.setupEventListeners();
        this.showBuyItems();
    }

    public show(...args: any[]): void {
        super.show(...args);
        this.switchToMode(this.currentMode);
        if (this.coinDisplay) {
            this.coinDisplay.refreshDisplay();
        }
        if (this.diamondDisplay) {
            this.diamondDisplay.refreshDisplay();
        }
        if (this.currentMode === ShopMode.BUY) {
            this.showBuyItems();
        } else {
            this.showSellItems();
        }
    }

    public hide(): void {
        super.hide();
        // 可以在这里添加额外的隐藏逻辑，如清理物品列表等
    }

    private initializeComponents(): void {
        if (this.gameController) {
            this.playerController = this.gameController.getPlayerController();
            this.inventoryComponent = this.playerController?.getComponent(InventoryComponent);

            if (this.coinDisplay) {
                this.coinDisplay.initialize(this.playerController.playerState);
            }
            if (this.diamondDisplay) {
                this.diamondDisplay.initialize(this.playerController.playerState);
            }
        }
    }

    private setupEventListeners(): void {
        this.buyButton?.node.on(Button.EventType.CLICK, this.onBuyButtonClicked, this);
        this.sellButton?.node.on(Button.EventType.CLICK, this.onSellButtonClicked, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this.hide, this);
    }

    private onBuyButtonClicked(): void {
        this.animateButton(this.buyButton!.node);
        this.currentMode = ShopMode.BUY;
        this.switchToMode(ShopMode.BUY);
        this.showBuyItems();
    }

    private onSellButtonClicked(): void {
        this.animateButton(this.sellButton!.node);
        this.currentMode = ShopMode.SELL;
        this.switchToMode(ShopMode.SELL);
        this.showSellItems();
    }

    private onBtnCloseClicked(): void {
        WindowManager.instance.hide(SharedDefines.WINDOW_SHOP_NAME);
    }

    private switchToMode(mode: ShopMode): void {
        this.purchaseNode!.active = mode === ShopMode.BUY;
        this.sellNode!.active = mode === ShopMode.SELL;
    }

    private animateButton(buttonNode: Node): void {
        Tween.stopAllByTarget(buttonNode);
        buttonNode.scale = Vec3.ONE;

        const scaleTween = new Tween(buttonNode)
            .to(0.1, { scale: new Vec3(1.25, 1.25, 1.25) })
            .to(0.1, { scale: Vec3.ONE });

        const colorTween = new Tween(buttonNode.getComponent(Sprite)!)
            .to(0.1, { color: new Color(180, 180, 180, 255) })
            .to(0.1, { color: Color.WHITE });

        scaleTween.start();
        colorTween.start();
    }

    private showBuyItems(): void {
        this.clearItems(this.purchaseItemPool, this.purchaseScrollView!);
        const items = ItemDataManager.instance.getAllItems();
        items.forEach(item => {
            if (parseInt(item.buy_price) > 0) {
                this.createItemNode(item, true, this.purchaseScrollView!, this.purchaseItemPool);
            }
        });
    }

    private showSellItems(): void {
        this.clearItems(this.sellItemPool, this.sellScrollView!);
        const inventoryItems = this.inventoryComponent?.getAllItems() || [];
        inventoryItems.forEach(item => {
            if (item.sellPrice > 0) {
                this.createItemNode(item, false, this.sellScrollView!, this.sellItemPool);
            }
        });
    }

    private clearItems(itemPool: Node[], scrollView: ScrollView): void {
        itemPool.forEach(item => {
            item.removeFromParent();
            item.active = false;
        });
        scrollView.content!.removeAllChildren();
    }

    private createItemNode(item: any, isBuyMode: boolean, scrollView: ScrollView, itemPool: Node[]): void {
        let itemNode: Node;
        if (itemPool.length > 0) {
            itemNode = itemPool.pop()!;
            itemNode.active = true;
        } else {
            itemNode = instantiate(this.itemPrefab!);
        }

        const sprite = itemNode.getComponentInChildren(Sprite)!;
        const label = itemNode.getComponentInChildren(Label)!;
        const button = itemNode.getComponentInChildren(Button)!;
        const price = button.node.getComponentInChildren(Label)!;

        // Load and set sprite
        ResourceManager.instance.loadAsset<SpriteFrame>(`${SharedDefines.WINDOW_SHOP_TEXTURES}${item.png}/spriteFrame`, SpriteFrame).then(spriteFrame => {
            if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
            }
        });

        // Set label text
        label.string = item.description;//isBuyMode ? `${item.buy_price}` : `${item.sell_price}`;
        price.string = isBuyMode ? `${item.buy_price}` : `${item.sell_price}`;

        // Setup button click event
        button.node.off(Button.EventType.CLICK);
        button.node.on(Button.EventType.CLICK, () => {
            if (isBuyMode) {
                this.buyItem(item);
            } else {
                this.sellItem(item);
            }
        }, this);

        scrollView.content?.addChild(itemNode);
    }

    private buyItem(item: any): void {
        const price = parseInt(item.buy_price);
        if (this.playerController?.playerState.gold >= price) {
            this.playerController.playerState.gold -= price;
            const inventoryItem = new InventoryItem(item);
            this.inventoryComponent?.addItem(inventoryItem);
            console.log(`Bought item: ${item.name}`);
            this.showBuyItems(); // Refresh the buy list
        } else {
            console.log("Not enough gold to buy this item!");
        }
    }

    private sellItem(item: InventoryItem): void {
        const price = item.sellPrice;
        if (this.inventoryComponent?.removeItem(item.id)) {
            this.playerController!.playerState.gold += price;
            console.log(`Sold item: ${item.name} for ${price} gold`);
            this.showSellItems(); // Refresh the sell list
        } else {
            console.log("Failed to sell item!");
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        this.buyButton?.node.off(Button.EventType.CLICK, this.onBuyButtonClicked, this);
        this.sellButton?.node.off(Button.EventType.CLICK, this.onSellButtonClicked, this);
    }
}