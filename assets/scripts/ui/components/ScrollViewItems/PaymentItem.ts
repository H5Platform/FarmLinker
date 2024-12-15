import { _decorator, Component, Node, Label, Button, EventTouch } from 'cc';
import { ScrollViewItem } from './ScrollViewItem';
import { DashFunManager, PayItemType } from '../../../managers/DashFunManager';
import { PlayerState } from '../../../entities/PlayerState';
import { NetworkManager } from '../../../managers/NetworkManager';
import { WindowManager } from '../../WindowManager';
import { SharedDefines } from '../../../misc/SharedDefines';
import { l10n } from '../../../../../extensions/localization-editor/static/assets/l10n';
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

        let content = "";
        if(this.paymentType == PayItemType.Diamond){
            content = l10n.t("87chjY045IWbBFtnt0+c8t");
            content = content.replace("{0}", this.amount.toString());
            content = content.replace("{1}", this.amount.toString());
        }
        else if(this.paymentType == PayItemType.Coin){
            content = l10n.t("944AcGN0hNaKYlY0FlgMhb");
            content = content.replace("{0}", this.costDiamond.toString());
            content = content.replace("{1}", this.amount.toString());
        }
        

        WindowManager.instance.show(SharedDefines.WINDOW_TIPS_NAME, content, () => {
            if(this.paymentType == PayItemType.Diamond){
                DashFunManager.instance.requestPayment("Test","Payment test",this.paymentType,this.amount);

                // const result = await NetworkManager.instance.requestAddDiamondForTest(100);
                // if (result && result.success) {
                //     console.log(`Added ${result.data.added_amount} diamonds to user ${result.data.user_id}`);
                // }
            }
            else if(this.paymentType == PayItemType.Coin){
                this.exchangeCoin(this.payIndex,this.costDiamond);
            }
        }, null);


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
        console.log(`exchangeCoin payIndex: ${payIndex}, costDiamond: ${costDiamond}`);
        if(this.playerState.diamond < costDiamond){
            // this.playerState.addDiamond(-costDiamond);
            // this.playerState.addGold(this.amount);
            console.log("PaymentItem::buyCoin not enough diamond");
            return;
        }

        const result = await NetworkManager.instance.requestExchangeCoin(payIndex);
        console.log(`exchangeCoin result: ${JSON.stringify(result)}`);
        if(result && result.success){
            this.playerState.addDiamond(-result.data.costDiamond);
            this.playerState.addGold(result.data.coinAmount);
        }
    }

}
