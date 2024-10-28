import { _decorator, Button, Enum } from "cc";
import { WindowBase } from "../base/WindowBase";
import { WindowOrientation } from "../WindowManager";
import { PayItemType } from "../../managers/DashFunManager";
import { PaymentItem } from "../components/ScrollViewItems/PaymentItem";

const { ccclass, property } = _decorator;



//define the payment window class
@ccclass('PaymentWindow')
export class PaymentWindow extends WindowBase {
    //define the payment type
    @property({ type: Enum(PayItemType) })
    paymentType: PayItemType = PayItemType.Coin;

    @property(PaymentItem)
    private paymentItems: PaymentItem[] = [];
    
    public initialize(orientation?: WindowOrientation): void {
        super.initialize(orientation);

        this.paymentItems.forEach((item: PaymentItem) => {
            item.initialize(this.gameController.getPlayerController().playerState,this.paymentType);
        });
    }

    public show(...args: any[]): void {
        super.show(...args);
    }
}

