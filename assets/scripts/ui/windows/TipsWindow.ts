import { _decorator, Node, Button, Label } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { WindowManager } from '../WindowManager';
import { SharedDefines } from '../../misc/SharedDefines';

const { ccclass, property } = _decorator;

enum TipsMode {
    OK,
    OK_CANCEL
}

@ccclass('TipsWindow')
export class TipsWindow extends WindowBase {
    @property(Label)
    private lblMessage: Label | null = null;

    private mode: TipsMode = TipsMode.OK;
    private okCallback: (() => void) | null = null;
    private cancelCallback: (() => void) | null = null;

    public initialize(): void {
        super.initialize();
    }

    public show(...args: any[]): void {
        super.show(...args);
        
        if (args.length >= 2) {
            const message = args[0] as string;
            this.okCallback = args[2] as (() => void) | null;
            this.cancelCallback = args[3] as (() => void) | null;

            this.updateUI(message);
            this.setupEventListeners();
        }
    }

    private setupEventListeners(): void {
        const currentNode = this.node;//this.mode === TipsMode.OK ? this.nodeOk : this.nodeOkCancel;
        const btnOk = currentNode?.getChildByName('btnConfirm')?.getComponent(Button);
        const btnCancel = currentNode?.getChildByName('btnCancel')?.getComponent(Button);

        if (btnOk) {
            btnOk.node.on(Button.EventType.CLICK, this.onOkButtonClicked, this);
        }
        if (btnCancel) {
            btnCancel.node.on(Button.EventType.CLICK, this.onCancelButtonClicked, this);
        }
    }

    private updateUI(message: string): void {
        
        if (this.lblMessage) {
            this.lblMessage.string = message;
        }
    }

    private onOkButtonClicked(): void {
        if (this.okCallback) {
            this.okCallback();
        }
        this.hide();
    }

    private onCancelButtonClicked(): void {
        if (this.cancelCallback) {
            this.cancelCallback();
        }
        this.hide();
    }

    public hide(): void {
        this.removeEventListeners();
        super.hide();
    }

    private removeEventListeners(): void {
        const currentNode = this.node;//this.mode === TipsMode.OK ? this.nodeOk : this.nodeOkCancel;
        const btnOk = currentNode?.getChildByName('btnConfirm')?.getComponent(Button);
        const btnCancel = currentNode?.getChildByName('btnCancel')?.getComponent(Button);

        if (btnOk) {
            btnOk.node.off(Button.EventType.CLICK, this.onOkButtonClicked, this);
        }
        if (btnCancel) {
            btnCancel.node.off(Button.EventType.CLICK, this.onCancelButtonClicked, this);
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        this.removeEventListeners();
    }
}