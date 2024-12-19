import { _decorator, Component, Node, Label, Button, EventTouch } from 'cc';
import { ScrollViewItem } from './ScrollViewItem';
import { DashFunManager, PayItemType } from '../../../managers/DashFunManager';
import { PlayerState } from '../../../entities/PlayerState';
import { NetworkManager } from '../../../managers/NetworkManager';
import { WindowManager } from '../../WindowManager';
import { SharedDefines } from '../../../misc/SharedDefines';
import { l10n } from '../../../../../extensions/localization-editor/static/assets/l10n';
import { UIHelper } from '../../../helpers/UIHelper';
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
        //remove old listener
        this.btnPayment.node.off(Button.EventType.CLICK, this.onPaymentButtonClick, this);
        this.btnPayment.node.on(Button.EventType.CLICK, this.onPaymentButtonClick, this);
        //remove old listener
        DashFunManager.instance.eventTarget.off(DashFunManager.EVENT_OPEN_INVOICE_RESULT, this.onOpenInvoiceResult, this);
        DashFunManager.instance.eventTarget.on(DashFunManager.EVENT_OPEN_INVOICE_RESULT, this.onOpenInvoiceResult, this);

    }

    public onEnable(): void {
        this.btnPayment.node.on(Button.EventType.CLICK, this.onPaymentButtonClick, this);
        DashFunManager.instance.eventTarget.on(DashFunManager.EVENT_OPEN_INVOICE_RESULT, this.onOpenInvoiceResult, this);
    }

    public onDisable(): void {
        this.btnPayment.node.off(Button.EventType.CLICK, this.onPaymentButtonClick, this);
        DashFunManager.instance.eventTarget.off(DashFunManager.EVENT_OPEN_INVOICE_RESULT, this.onOpenInvoiceResult, this);
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
            const toastText = UIHelper.formatLocalizedText("T2U3V4W5X6Y7Z8A9B0C1D2E");
            WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, toastText);
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
            const toastText = UIHelper.formatLocalizedText("6U1K90328P7ZQ5A4B9T1R6F");
            WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, toastText);
            return;
        }

        const result = await NetworkManager.instance.requestExchangeCoin(payIndex);
        console.log(`exchangeCoin result: ${JSON.stringify(result)}`);
        if(result && result.success){
            const toastText = UIHelper.formatLocalizedText("P8Q9R1S2T3U4V5W6X7Y8Z0A");
            WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, toastText);
            this.playerState.addGold(result.data.coinAmount);
            this.playerState.addDiamond(-result.data.costDiamond);
        } else {
            const toastText = UIHelper.formatLocalizedText("M4N5O6P7Q8R9S0T1U2V3W4X");
            WindowManager.instance.show(SharedDefines.WINDOW_TOAST_NAME, toastText);
        }
    }

}
