import { _decorator, Button, Enum, instantiate } from "cc";
import { WindowBase } from "../base/WindowBase";
import { WindowOrientation } from "../WindowManager";
import { PayItemType } from "../../managers/DashFunManager";
import { PaymentItem } from "../components/ScrollViewItems/PaymentItem";
import { CoinDataManager } from "../../managers/CoinDataManager";
import { DiamondDataManager } from "../../managers/DiamondDataManager";

const { ccclass, property } = _decorator;



//define the payment window class
@ccclass('PaymentWindow')
export class PaymentWindow extends WindowBase {
    //define the payment type
    @property({ type: Enum(PayItemType) })
    paymentType: PayItemType = PayItemType.Coin;

    @property(PaymentItem)
    private payItemTemplate: PaymentItem | null = null;

    @property(PaymentItem)
    private paymentItems: PaymentItem[] = [];
    
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
    }

    public show(...args: any[]): void {
        super.show(...args);
    }

    private setupCoinPaymentItems(): void {
        const coinDatas = CoinDataManager.instance.getAllCoins();
        //foreach coin data and setup index
        for(let index = 0; index < coinDatas.length; index++){
            const coinData = coinDatas[index];
            const paymentItem = instantiate(this.payItemTemplate);
            paymentItem.node.setParent(this.payItemTemplate.node.parent);
            paymentItem.node.active = true;
            paymentItem.initialize(index,this.gameController.getPlayerController().playerState,this.paymentType);
            paymentItem.amount = parseFloat(coinData.get_money);
            paymentItem.costDiamond = parseFloat(coinData.pay_money);
        }
    }

    private setupDiamondPaymentItems(): void {
        const diamondDatas = DiamondDataManager.instance.getAllDiamonds();
        //foreach diamond data and setup index
        for(let index = 0; index < diamondDatas.length; index++){
            const diamondData = diamondDatas[index];
            const paymentItem = instantiate(this.payItemTemplate);
            paymentItem.node.setParent(this.payItemTemplate.node.parent);
            paymentItem.node.active = true;
            paymentItem.initialize(index,this.gameController.getPlayerController().playerState,this.paymentType);
            paymentItem.amount = parseFloat(diamondData.get_money);
            paymentItem.costDiamond = 0;
        }
    }
}

