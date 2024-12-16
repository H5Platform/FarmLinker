import { _decorator, Node, ScrollView, instantiate, Prefab, Label, Sprite, Button, Vec3, Tween, Color, SpriteFrame } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { PlayerController } from '../../controllers/PlayerController';
import { InventoryComponent, InventoryItem } from '../../components/InventoryComponent';
import { ItemDataManager } from '../../managers/ItemDataManager';
import { ResourceManager } from '../../managers/ResourceManager';
import { NetworkBuyItemResult, NetworkSellItemResult, SharedDefines } from '../../misc/SharedDefines';
import { CoinDisplay } from '../components/CoinDisplay';
import { DiamondDisplay } from '../components/DiamondDisplay';
import { WindowManager } from '../WindowManager';
import { NetworkManager } from '../../managers/NetworkManager';
import { CoinType } from '../../effects/CoinCollectionEffectComponent';
import { UIEffectHelper } from '../../helpers/UIEffectHelper';
import { l10n } from 'db://localization-editor/l10n';


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
    private btnAddCoin: Button | null = null;
    @property(Button)
    private btnAddDiamond: Button | null = null;

    @property(Button)
    private buyButton: Button | null = null;

    @property(Button)
    private sellButton: Button | null = null;

    @property(Button)
    private closeButton: Button | null = null;

    private btnClickEnable: boolean = true;
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
        this.setupNetworkEventListeners();
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
        NetworkManager.instance.eventTarget.off(NetworkManager.EVENT_BUY_ITEM, this.onBuyItemResult, this);
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
        this.btnAddCoin?.node.on(Button.EventType.CLICK, this.onBtnAddCoinClicked, this);
        this.btnAddDiamond?.node.on(Button.EventType.CLICK, this.onBtnAddDiamondClicked, this);
    }

    private setupNetworkEventListeners(): void {
        NetworkManager.instance.eventTarget.on(NetworkManager.EVENT_BUY_ITEM, this.onBuyItemResult, this);
    }

    private onBuyItemResult(buyItemResult: NetworkBuyItemResult): void {
        console.log(`onBuyItemResult success = ${buyItemResult.success} , data = ${buyItemResult.data}`);
        if (buyItemResult.success) {
            // TODO Need translate
            WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, "购买成功");   
            const item = ItemDataManager.instance.getItemById(buyItemResult.data.item_id);
            if (item) {
                this.playerController!.playerState.gold = buyItemResult.data.current_coin;
                const inventoryItem = new InventoryItem(item);
                this.inventoryComponent?.addItem(inventoryItem);
                console.log(`Bought item: ${item.name}`);
                this.showBuyItems(); 
            }
        }
        else{
            // TODO Need translate
            WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, "购买失败");
        }
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

    private onBtnAddCoinClicked(): void {
        WindowManager.instance.show(SharedDefines.WINDOW_COIN_NAME);
    }

    private onBtnAddDiamondClicked(): void {
        WindowManager.instance.show(SharedDefines.WINDOW_PAYMENT_NAME);
    }

    private onBtnCloseClicked(): void {
        WindowManager.instance.hide(SharedDefines.WINDOW_SHOP_NAME);
    }

    private switchToMode(mode: ShopMode): void {
        this.purchaseNode!.active = mode === ShopMode.BUY;
        this.sellNode!.active = mode === ShopMode.SELL;

        const lbBuy = this.buyButton!.node.getComponentInChildren(Label);
        const lbSell = this.sellButton!.node.getComponentInChildren(Label);
        if (mode === ShopMode.BUY) {
            lbBuy.color = Color.fromHEX(new Color(), "#88563F");
            lbSell.color = Color.fromHEX(new Color(), "#C4A47E");
        } else {
            lbSell.color = Color.fromHEX(new Color(), "#88563F");
            lbBuy.color = Color.fromHEX(new Color(), "#C4A47E");
        }
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
                this.createItemNode(item,item.png, true, this.purchaseScrollView!, this.purchaseItemPool);
            }
        });
    }

    private showSellItems(): void {
        this.clearItems(this.sellItemPool, this.sellScrollView!);
        const inventoryItems = this.inventoryComponent?.getAllItems() || [];
        console.log(`Showing sell items: ${inventoryItems.length}`);
        inventoryItems.forEach(item => {
            if (item.sellPrice > 0) {
                this.createItemNode(item,item.iconName, false, this.sellScrollView!, this.sellItemPool);
            }
            else{
                console.log(`Item ${item.name} has no sell price , sell price = ${item.sellPrice}`);
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

    private createItemNode(item: any,spriteName:string, isBuyMode: boolean, scrollView: ScrollView, itemPool: Node[]): void {
        let itemNode: Node;
        if (itemPool.length > 0) {
            itemNode = itemPool.pop()!;
            itemNode.active = true;
        } else {
            itemNode = instantiate(this.itemPrefab!);
        }

        const sprite = itemNode.getComponentInChildren(Sprite)!;
        const labelNum = sprite.getComponentInChildren(Label)!;
        const label = itemNode.getComponentInChildren(Label)!;
        const button = itemNode.getComponentInChildren(Button)!;
        const price = button.node.getComponentInChildren(Label)!;
        

        // Load and set sprite
        ResourceManager.instance.loadAsset<SpriteFrame>(`${SharedDefines.WINDOW_SHOP_TEXTURES}${spriteName}/spriteFrame`, SpriteFrame).then(spriteFrame => {
            if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
            }
        });

        
        // Set label text
        label.string = l10n.t(item.description);//isBuyMode ? `${item.buy_price}` : `${item.sell_price}`;
        price.string = isBuyMode ? `${item.buy_price}` : `${item.sellPrice}`;
        const inventoryItem = this.inventoryComponent?.getItem(item.id) || null;
        if (!isBuyMode && inventoryItem && inventoryItem.quantity > 1) {
            labelNum.node.active = true;
            labelNum.string = `x${inventoryItem.quantity}`;
        }
        else {
            labelNum.node.active = false;
        }

        // Setup button click event
        button.node.off(Button.EventType.CLICK);
        button.node.on(Button.EventType.CLICK, async () => {
            if(!this.btnClickEnable){
                return;
            }
            this.btnClickEnable = false;
            if (isBuyMode) {
                await this.buyItem(item);
            } else {
                await this.sellItem(button,item);
            }
            this.btnClickEnable = true;
        }, this);

        scrollView.content?.addChild(itemNode);
    }

    private async buyItem(item: any): Promise<void> {
        const price = parseInt(item.buy_price);
        if (this.playerController?.playerState.gold >= price) {
            await NetworkManager.instance.buyItem(item.id,1);

        } else {
            console.log("Not enough gold to buy this item!");
            // TODO Need translate
            WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, "金币不足");
        }
    }

    private async sellItem(button: Button,inventoryItem: InventoryItem): Promise<void> {
        const sellItemResult = await NetworkManager.instance.sellItem(inventoryItem.id, 1);
        console.log(`sellItemResult success = ${sellItemResult.success} , data = ${sellItemResult.data}`);
        if(!sellItemResult.success){
            console.log(`sellItem failed , message = ${sellItemResult.message}`);
            // TODO Need translate
            WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, "出售失败");
            return;
        }

        const item = ItemDataManager.instance.getItemById(sellItemResult.data.item_id);
        if (item) {
            const price = parseInt(item.sell_price);
            if (this.inventoryComponent?.removeItem(item.id)) {
                console.log("sellItem success");
                const coinEffect = await UIEffectHelper.playCoinCollectionEffect(CoinType.COIN, this.node, button.node.getWorldPosition(), this.coinDisplay!.node.getWorldPosition());
                coinEffect.node.on('effectComplete', () => {
                    this.playerController!.playerState.gold = sellItemResult.data.current_coin;
                    console.log(`Sold item: ${item.name} for ${price} gold`);
                    //this.showSellItems(); 
                });
               // this.playerController!.playerState.gold += price;
                console.log(`Sold item: ${item.name} for ${price} gold`);
                // TODO Need translate
                WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, "出售成功");
                this.showSellItems();
            } else {
                console.log("Failed to sell item!");
                // TODO Need translate
                WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, "出售失败");
            }
        }
        else {
            console.log("The item is not found!");
            // TODO Need translate
            WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, "出售失败");
        }

        
    }

    protected onDestroy(): void {
        super.onDestroy();
        this.buyButton?.node.off(Button.EventType.CLICK, this.onBuyButtonClicked, this);
        this.sellButton?.node.off(Button.EventType.CLICK, this.onSellButtonClicked, this);
    }
}