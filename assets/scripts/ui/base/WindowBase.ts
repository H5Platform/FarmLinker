import { _decorator, Component, ResolutionPolicy, screen, Vec3, view,Node, Tween, director, UITransform, Widget } from 'cc';
import { GameController } from '../../controllers/GameController';
import { WindowManager } from '../WindowManager';
const { ccclass, property } = _decorator;

@ccclass('WindowBase')
export class WindowBase extends Component {
    

    @property(Node)
    private animationNode: Node | null = null;

    private playingTween: Tween<Node> | null = null;

    protected gameController: GameController | null = null;

    private originalContentSize: Vec3 = new Vec3();


    //getter 
    public get RealScale(): Vec3 {
        return this.realScale;
    }

    private realScale: Vec3 = new Vec3();

    protected onScrollViewSizeChanged(): void {
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            this.originalContentSize.set(uiTransform.width, uiTransform.height, 0);
        }
        this.updateRealScale();
    }

    protected onLoad(): void {
        const widget = this.node.getComponent(Widget);
        widget.node.on(Node.EventType.SIZE_CHANGED, () => {
            this.onScrollViewSizeChanged();
        });
    }

    protected start(): void {

        // const uiTransform = this.node.getComponent(UITransform);
        // if (uiTransform) {
        //     this.originalContentSize.set(uiTransform.width, uiTransform.height, 0);
        // }

        // this.updateRealScale();
    }

    public initialize(): void {

        const gameControllerNode = director.getScene()?.getChildByName('GameController');
        if (gameControllerNode) {
            this.gameController = gameControllerNode.getComponent(GameController);
        }
     }

    public show(...args: any[]): void {
        this.node.active = true;
       // this.updateRealScale();

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
            .to(0.03, { scale: new Vec3(1.03, 1.03, 1) }, { easing: 'bounceOut' })
            .to(0.06, { scale: new Vec3(0.97, 0.97, 1) })
            .to(0.9, { scale: originalScale })
            .start();
    }

    protected updateRealScale(): void {

        console.log(`updateRealScale start .. originalContentSize: ${this.originalContentSize}`);
        const screenSize = this.originalContentSize;//view.getVisibleSize();
        const designSize = view.getDesignResolutionSize();
        const scaleX = screenSize.x / designSize.x;
        const scaleY = screenSize.y / designSize.y;
        this.realScale.set(scaleX, scaleY, 1);
    }
}
