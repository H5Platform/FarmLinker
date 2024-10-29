import { _decorator, Button, Enum, instantiate,Node } from "cc";
import { WindowBase } from "../base/WindowBase";
import { WindowOrientation } from "../WindowManager";
import { PayItemType } from "../../managers/DashFunManager";
import { CoinDataManager } from "../../managers/CoinDataManager";
import { DiamondDataManager } from "../../managers/DiamondDataManager";
import { PaymentItem } from "../components/ScrollViewItems/PaymentItem";

const { ccclass, property } = _decorator;



//define the payment window class
@ccclass('PaymentWindow')
export class PaymentWindow extends WindowBase {
    //define the payment type
    @property({ type: Enum(PayItemType) })
    paymentType: PayItemType = PayItemType.Coin;

    @property(Node)
    private payItemTemplate: Node | null = null;

    //define close button
    @property(Button)
    private closeButton: Button | null = null;
    
    public initialize(orientation?: WindowOrientation): void {
        super.initialize(orientation);

        // this.paymentItems.forEach((item: PaymentItem) => {
        //     item.initialize(this.gameController.getPlayerController().playerState,this.paymentType);
        // });
        if(this.paymentType == PayItemType.Coin){
            this.setupCoinPaymentItems();
        }
        else{
            this.setupDiamondPaymentItems();
        }
        this.closeButton.node.on(Button.EventType.CLICK, this.onCloseButtonClick, this);
    }

    public show(...args: any[]): void {
        super.show(...args);
    }

    private onCloseButtonClick(): void {
        this.hide();
    }

    private setupCoinPaymentItems(): void {
        this.payItemTemplate.active = false;
        const coinDatas = CoinDataManager.instance.getAllCoins();
        //foreach coin data and setup index
        for(let index = 0; index < coinDatas.length; index++){
            const coinData = coinDatas[index];
            const paymentItemNode = instantiate(this.payItemTemplate);
            paymentItemNode.setParent(this.payItemTemplate.parent);
            paymentItemNode.active = true;

            const paymentItem = paymentItemNode.getComponent(PaymentItem);
            paymentItem.initialize(index,this.gameController.getPlayerController().playerState,this.paymentType);
            paymentItem.amount = parseFloat(coinData.get_money);
            paymentItem.costDiamond = parseFloat(coinData.pay_money);
            paymentItem.refresh();
        }
    }

    private setupDiamondPaymentItems(): void {
        this.payItemTemplate.active = false;
        const diamondDatas = DiamondDataManager.instance.getAllDiamonds();
        //foreach diamond data and setup index
        for(let index = 0; index < diamondDatas.length; index++){
            const diamondData = diamondDatas[index];
            const paymentItemNode = instantiate(this.payItemTemplate);
            paymentItemNode.setParent(this.payItemTemplate.parent);
            paymentItemNode.active = true;

            const paymentItem = paymentItemNode.getComponent(PaymentItem);
            paymentItem.initialize(index,this.gameController.getPlayerController().playerState,this.paymentType);
            paymentItem.amount = parseFloat(diamondData.get_money);
            paymentItem.costDiamond = parseFloat(diamondData.pay_money);
            paymentItem.refresh();
        }
    }
}

