import { _decorator, Component, Node, Label, Button, EventTouch } from 'cc';
import { ScrollViewItem } from './ScrollViewItem';
import { DashFunManager, PayItemType } from '../../../managers/DashFunManager';
import { PlayerState } from '../../../entities/PlayerState';
import { NetworkManager } from '../../../managers/NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('PaymentItem')
export class PaymentItem extends ScrollViewItem {

    @property(Label)
    private lblCost: Label | null = null;

    @property(Label)
    private lblAmount: Label | null = null;

    @property(Button)
    private btnPayment: Button | null = null;

    //getter and setter
    public get costDiamond(): number { return this._costDiamond; }
    public set costDiamond(value: number) { this._costDiamond = value; }
    @property(Number)
    private _costDiamond: number = 0;
    //define amount num
    public get amount(): number { return this._amount; }
    public set amount(value: number) { this._amount = value; }
    @property(Number)
    private _amount: number = 0;
    
    private payIndex: number = 0;
    private paymentType: PayItemType;
    private playerState: PlayerState;

    public initialize(payIndex: number,playerState: PlayerState,paymentType: PayItemType): void {
        this.payIndex = payIndex;
        this.playerState = playerState;
        this.paymentType = paymentType;
        this.btnPayment.node.on(Button.EventType.CLICK, this.onPaymentButtonClick, this);
        DashFunManager.instance.eventTarget.on(DashFunManager.EVENT_OPEN_INVOICE_RESULT, this.onOpenInvoiceResult, this);

    }

    public refresh(): void {
        this.lblCost.string = this.costDiamond.toString();
        this.lblAmount.string = this.amount.toString();
    }

    private onPaymentButtonClick(): void {
        console.log("onPaymentButtonClick", this.paymentType);
        if(this.paymentType == PayItemType.Diamond){
            DashFunManager.instance.requestPayment("Test","Payment test",this.paymentType,this.amount);
        }
        else if(this.paymentType == PayItemType.Coin){
            this.exchangeCoin(this.payIndex,this.costDiamond);
        }
    }

    private onOpenInvoiceResult(success: boolean, index: number, amount: number): void {
        if(this.payIndex != index){
            return;
        }
        console.log("onOpenInvoiceResult", success, index, amount);
        if(success){
            //log current diamond
            console.log(`onOpenInvoiceResult current diamond: ${this.playerState.diamond}`);
            this.playerState.addDiamond(amount);
            console.log(`onOpenInvoiceResult after add diamond: ${this.playerState.diamond}`);
        }
    }

    private async exchangeCoin(payIndex: number,costDiamond: number): Promise<void> {
        if(this.playerState.diamond < costDiamond){
            // this.playerState.addDiamond(-costDiamond);
            // this.playerState.addGold(this.amount);
            console.log("PaymentItem::buyCoin not enough diamond");
            return;
        }

        const result = await NetworkManager.instance.requestExchangeCoin(this.payIndex);
        if(result && result.success){
            this.playerState.addDiamond(-result.data.costDiamond);
            this.playerState.addGold(result.data.coinAmount);
        }
    }

}
