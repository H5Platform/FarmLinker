import { _decorator, Node, Button, EditBox } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { WindowManager } from '../WindowManager';
import { NetworkManager } from '../../managers/NetworkManager';
import { DashFunManager } from '../../managers/DashFunManager';

const { ccclass, property } = _decorator;

@ccclass('MainWindow')
export class MainWindow extends WindowBase {

    @property(EditBox)
    private ebUserId: EditBox | null = null;
    //password
    @property(EditBox)
    private ebPassword: EditBox | null = null;

    @property(Button)
    private btnStart: Button | null = null;

    public initialize(): void {
        super.initialize();
        this.setupEventListeners();
        globalThis.mainWindow = this;
        DashFunManager.instance.updateLoadingProgress(10);
        DashFunManager.instance.eventTarget.on("getUserProfileResult", this.onGetUserProfileResult, this);
        console.log('MainWindow initialized');
    }

    public show(...args: any[]): void {
        super.show(...args);
        console.log('MainWindow shown');
        DashFunManager.instance.updateLoadingProgress(100);
        DashFunManager.instance.getUserProfile();
    }

    public hide(): void {
        super.hide();
        console.log('MainWindow hidden');
    }

    private setupEventListeners(): void {
        if (this.btnStart) {
            this.btnStart.node.on(Button.EventType.CLICK, this.onStartButtonClicked, this);
        } else {
            console.warn('Start button not found in MainWindow');
        }
    }

    private onGetUserProfileResult(data:any){
        console.log("onGetUserProfileResult", data);
    }

    private async onStartButtonClicked(): Promise<void> {

        const result = await NetworkManager.instance.login(this.ebUserId!.string, this.ebPassword!.string);

        if(result.success){ 
            // Add your start game logic here
            WindowManager.instance.show("GameWindow");
            this.hide();
        }
        else{
            console.log(result.message);
            WindowManager.instance.show("ToastWindow",result.message);
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.btnStart) {
            this.btnStart.node.off(Button.EventType.CLICK, this.onStartButtonClicked, this);
        }
    }
}