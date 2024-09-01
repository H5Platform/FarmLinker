import { _decorator, Button, Component, Node } from 'cc';
import { WindowBase } from '../base/WindowBase';
const { ccclass, property } = _decorator;

@ccclass('TipsWindow')
export class TipsWindow extends WindowBase {

    //button
    @property(Button)
    private btnCancel: Button = null;
    //btnConfirm
    @property(Button)
    private btnConfirm: Button = null;

    //override
    public initialize(): void {
        super.initialize();
    }

    //override
    public show(...args: any[]): void {
        super.show(...args);
    }
}


