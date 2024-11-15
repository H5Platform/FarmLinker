import { _decorator, Node, Button, EditBox } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { WindowManager } from '../WindowManager';
import { NetworkManager } from '../../managers/NetworkManager';
import { DashFunManager, PayItemType, UserProfile } from '../../managers/DashFunManager';

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
        DashFunManager.instance.eventTarget.on(DashFunManager.EVENT_GET_USER_PROFILE_RESULT, this.onGetUserProfileResult, this);
        console.log('MainWindow initialized');
    }

    public show(...args: any[]): void {
        super.show(...args);
        console.log('MainWindow shown');
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

    private async onGetUserProfileResult(data:any){
        console.log("onGetUserProfileResult", data);
        if(data == null){
            console.log("onGetUserProfileResult data is null,retry get user profile 1 second later");
            //relay 1 second to retry using scheduleonce
            this.scheduleOnce(() => {
                console.log("retry get user profile");
                DashFunManager.instance.getUserProfile();
            }, 1);
            return;
        }
        DashFunManager.instance.updateLoadingProgress(100);
        const userProfile = data as UserProfile;
        const result = await this.gameController.login(userProfile.id, "");
        if(result && result.success){ 
            this.gameController.getPlayerController().playerState.nickname = userProfile.displayName;
            if(userProfile.avatarUrl && this.gameController.getPlayerController().playerState.headUrl != userProfile.avatarUrl){
                console.log(`update avatar url: ${userProfile.avatarUrl}`);
                await NetworkManager.instance.requestUpdateAvatarUrl(userProfile.avatarUrl);
            }
            // Add your start game logic here
            await WindowManager.instance.show("GameWindow");
            this.hide();
        }
        else{
            console.log(result.message);
            WindowManager.instance.show("ToastWindow",result.message);
        }
    }

    private async onStartButtonClicked(): Promise<void> {
        console.log("onStartButtonClicked start...");
        const result = await this.gameController.login(this.ebUserId!.string, this.ebPassword!.string);

        if(result && result.success){ 
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