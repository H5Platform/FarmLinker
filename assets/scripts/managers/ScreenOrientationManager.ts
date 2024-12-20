import { _decorator, Component, Node, view, Canvas, UITransform, ResolutionPolicy, screen, Camera, Vec2 } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';
import { WindowManager } from '../ui/WindowManager';
const { ccclass, property } = _decorator;

@ccclass('ScreenOrientationManager')
export class ScreenOrientationManager extends Component {
    @property(Canvas)
    canvas: Canvas | null = null;
    @property(Camera)
    camera: Camera | null = null;
    @property(Canvas)
    gameplayCanvas: Canvas | null = null;
    @property(Camera)
    gameplayCamera: Camera | null = null;

    private isLandscape: boolean = false;


    start() {
        // 设置设计分辨率
        const designSize = view.getDesignResolutionSize();
        //view.setDesignResolutionSize(1920, 1080, ResolutionPolicy.FIXED_WIDTH);

        // 初始化屏幕方向
       // this.updateOrientation();
       this.updateScreenSize();

        // 监听屏幕大小变化事件
        //view.on('canvas-resize', this.onScreenResize, this);

        this.canvas!.node.on(Node.EventType.SIZE_CHANGED, () => {
            //get uicontent size    
            const uiTransform = this.canvas!.getComponent(UITransform);
            if (uiTransform) {
                console.log(`canvas size changed y pos = ${uiTransform.contentSize.y}`);
                //update camera ortho height
                this.camera!.orthoHeight = uiTransform.contentSize.y / 2;
            }

            //update gameplay canvas size
            const gameplayUiTransform = this.gameplayCanvas!.getComponent(UITransform);
            if (gameplayUiTransform) {
                console.log(`gameplay canvas size changed y pos = ${gameplayUiTransform.contentSize.y}`);
                //update gameplay camera ortho height
                this.gameplayCamera!.orthoHeight = gameplayUiTransform.contentSize.y / 2;
            }
        }, this);
        screen.on('window-resize', (width: number, height: number) => this.updateScreenSize(),this);
    }

    onDestroy() {
        // 移除监听器
        //view.off('canvas-resize', this.onScreenResize, this);
        screen.off('window-resize', this.updateScreenSize, this);
    }

    onScreenResize() {
        //this.updateOrientation();
        this.updateScreenSize();
    }

    protected updateScreenSize(): void {
        console.log("updateScreenSize");
        // 当前屏幕分辨率比例
        let screenRatio = screen.windowSize.width / screen.windowSize.height;
        // 设计稿分辨率比例
        let designRatio = SharedDefines.DESIGN_RESOLUTION_WIDTH / SharedDefines.DESIGN_RESOLUTION_HEIGHT;
        
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

    //竖屏
    private updateFitWidth(): void {
        view.setDesignResolutionSize(
            SharedDefines.DESIGN_RESOLUTION_HEIGHT,
            SharedDefines.DESIGN_RESOLUTION_WIDTH,
            
            ResolutionPolicy.FIXED_WIDTH
        );
        //view.setResolutionPolicy(ResolutionPolicy.FIXED_WIDTH);
        this.isLandscape = false;
        this.switchCanvas();
    }

    //横屏
    private updateFitHeight(): void {
        view.setDesignResolutionSize(
            SharedDefines.DESIGN_RESOLUTION_WIDTH,
            SharedDefines.DESIGN_RESOLUTION_HEIGHT,
            ResolutionPolicy.FIXED_HEIGHT
        );
        //view.setResolutionPolicy(ResolutionPolicy.FIXED_HEIGHT);
        this.isLandscape = true;
        this.switchCanvas();
    }

    updateOrientation() {
        const winSize = view.getVisibleSize();
        const newIsLandscape = winSize.width > winSize.height;

        if (this.isLandscape !== newIsLandscape) {
            this.isLandscape = newIsLandscape;
            this.switchCanvas();
        }
    }

    switchCanvas() {
        // if (this.isLandscape) {
        //     this.adjustCanvasSize(this.canvas!, SharedDefines.DESIGN_RESOLUTION_WIDTH, SharedDefines.DESIGN_RESOLUTION_HEIGHT);
        //     this.camera.orthoHeight = SharedDefines.DESIGN_RESOLUTION_HEIGHT / 2;
        // } else {
        //     this.adjustCanvasSize(this.canvas!, SharedDefines.DESIGN_RESOLUTION_HEIGHT, SharedDefines.DESIGN_RESOLUTION_WIDTH);
        //     this.camera.orthoHeight = SharedDefines.DESIGN_RESOLUTION_WIDTH / 2;
        // }

        WindowManager.instance.changeWindowOrientation(this.isLandscape);
    }

    adjustCanvasSize(canvas: Canvas, width: number, height: number) {
        const uiTransform = canvas.getComponent(UITransform);
        if (uiTransform) {
            console.log("adjustCanvasSize", width, height);
            //uiTransform.setContentSize(width, height);
        }
    }
}