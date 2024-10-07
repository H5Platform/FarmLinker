import { _decorator, Component, Node,ResolutionPolicy, screen, view, EventTarget } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';
const { ccclass, property } = _decorator;

export enum Orientation {
    Portrait,
    Landscape,
}

@ccclass('UIAdaptComponent')
export class UIAdaptComponent extends Component {

    private orientation: Orientation = Orientation.Portrait;

    public eventTarget: EventTarget = new EventTarget();

    start() {
        //监听窗口大小变化时的回调，每次窗口变化都要自动适配
        screen.on('window-resize', (width: number, height: number) => this.updateScreenSize(),this);
        this.updateScreenSize();
    }


    update(deltaTime: number) {
        
    }

    private updateOrientation(): void {
        const screenSize = screen.windowSize;
        const newIsLandscape = screenSize.width > screenSize.height;
    
        if (newIsLandscape && this.orientation !== Orientation.Landscape) {
            this.orientation = newIsLandscape ? Orientation.Landscape : Orientation.Portrait;
            this.eventTarget.emit(SharedDefines.EVENT_ORIENTATION_CHANGED, this.orientation);
        }
    }

    protected updateScreenSize(): void {
        console.log("updateScreenSize");
        // 当前屏幕分辨率比例
        let screenRatio = screen.windowSize.width / screen.windowSize.height;
        // 设计稿分辨率比例
        let designRatio = view.getDesignResolutionSize().width / view.getDesignResolutionSize().height;
        
        if (screenRatio <= 1) {
            console.log("竖屏");
            // 屏幕高度大于或等于宽度，即竖屏
            if (screenRatio <= designRatio) {
                this.updateFitWidth();
            } else {
                // 此时屏幕比例大于设计比例
                // 为了保证纵向的游戏内容不受影响，应该使用 fitHeight 模式
                this.updateFitHeight();
            }
        } else {
            console.log("横屏");
            // 屏幕宽度大于高度，即横屏
            this.updateFitHeight();
        }
    }

    private updateFitWidth(): void {
        view.setDesignResolutionSize(
            view.getDesignResolutionSize().width,
            view.getDesignResolutionSize().height,
            ResolutionPolicy.FIXED_WIDTH
        );
    }

    private updateFitHeight(): void {
        view.setDesignResolutionSize(
            view.getDesignResolutionSize().width,
            view.getDesignResolutionSize().height,
            ResolutionPolicy.FIXED_HEIGHT
        );
    }
}


