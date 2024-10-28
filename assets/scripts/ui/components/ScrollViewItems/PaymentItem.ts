import { _decorator, Component, Node, Label, Button, EventTouch } from 'cc';
import { ScrollViewItem } from './ScrollViewItem';
import { DashFunManager, PayItemType } from '../../../managers/DashFunManager';
import { PlayerState } from '../../../entities/PlayerState';
const { ccclass, property } = _decorator;

@ccclass('PaymentItem')
export class PaymentItem extends ScrollViewItem {

    @property(Button)
    private btnPayment: Button | null = null;


    @property(Number)
    private costDiamond: number = 0;
    //define amount num
    @property(Number)
    private amount: number = 0;
    
    private paymentType: PayItemType;
    private playerState: PlayerState;

    public initialize(playerState: PlayerState,paymentType: PayItemType): void {
        this.playerState = playerState;
        this.paymentType = paymentType;
        this.btnPayment.node.on(Button.EventType.CLICK, this.onPaymentButtonClick, this);
        DashFunManager.instance.eventTarget.on(DashFunManager.EVENT_OPEN_INVOICE_RESULT, this.onOpenInvoiceResult, this);

        this.refresh();
    }

    public refresh(): void {
        if(this.paymentType == PayItemType.Coin){
            this.refreshGoldContent();
        }
        else if(this.paymentType == PayItemType.Diamond){
            this.refreshDiamondContent();
        }
    }

    private refreshGoldContent(): void {

    }

    private refreshDiamondContent(): void {

    }

    private onPaymentButtonClick(): void {
        console.log("onPaymentButtonClick", this.paymentType);
        DashFunManager.instance.requestPayment("Test","Payment test",this.paymentType,this.amount);
    }

    private onOpenInvoiceResult(success: boolean, type: PayItemType, amount: number): void {
        console.log("onOpenInvoiceResult", success, type, amount);
        if(success){
            if(type == PayItemType.Coin){
                this.playerState.addGold(amount);
            }
            else if(type == PayItemType.Diamond){
                this.playerState.addDiamond(amount);
            }
        }
    }

}
