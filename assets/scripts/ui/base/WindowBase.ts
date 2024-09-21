import { _decorator, Component, ResolutionPolicy, screen, Vec3, view,Node, Tween, director } from 'cc';
import { GameController } from '../../controllers/GameController';
import { WindowManager } from '../WindowManager';
const { ccclass, property } = _decorator;

@ccclass('WindowBase')
export class WindowBase extends Component {

    @property(Node)
    private animationNode: Node | null = null;

    private playingTween: Tween<Node> | null = null;

    protected gameController: GameController | null = null;

    public initialize(): void {
        //监听窗口大小变化时的回调，每次窗口变化都要自动适配
        screen.on('window-resize', (width: number, height: number) => this.updateScreenSize(),this);
        const gameControllerNode = director.getScene()?.getChildByName('GameController');
        if (gameControllerNode) {
            this.gameController = gameControllerNode.getComponent(GameController);
        }
     }

    public show(...args: any[]): void {
        this.node.active = true;
        this.updateScreenSize();

        //this.playJellyAnimation();
        //schedule delay 0.1 second
        this.scheduleOnce(() => {
            this.playJellyAnimation();
        }, 0.03);
    }

    public hide(): void {
        if (this.playingTween) {
            this.playingTween.stop();
            this.playingTween = null;
            this.animationNode.setScale(1, 1, 1);
        }
        this.node.active = false;
        
    }

    

    protected updateScreenSize(): void {
        // 当前屏幕分辨率比例
        let screenRatio = screen.windowSize.width / screen.windowSize.height;
        // 设计稿分辨率比例
        let designRatio = view.getDesignResolutionSize().width / view.getDesignResolutionSize().height;
        
        if (screenRatio <= 1) {
            // 屏幕高度大于或等于宽度，即竖屏
            if (screenRatio <= designRatio) {
                this.updateFitWidth();
            } else {
                // 此时屏幕比例大于设计比例
                // 为了保证纵向的游戏内容不受影响，应该使用 fitHeight 模式
                this.updateFitHeight();
            }
        } else {
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

    protected playJellyAnimation(): void {
        //if animationNode is null, return
        if (!this.animationNode) {
            return;
        }
        const node = this.animationNode;
        const originalScale = Vec3.ONE;//node.scale.clone();
        
        // Reset scale
        node.setScale(0.7, 0.7, 1);
    
        // Create the animation
        this.playingTween = new Tween(node)
            //.to(0.1, { scale: new Vec3(0.7, 0.7, 1) })
            .to(0.07, { scale: new Vec3(1.03, 1.03, 1) }, { easing: 'bounceOut' })
            .to(0.05, { scale: new Vec3(0.92, 0.92, 1) })
            .to(0.1, { scale: originalScale })
            .start();
    }
}
