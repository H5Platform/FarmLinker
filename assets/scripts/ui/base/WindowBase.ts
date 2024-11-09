import { _decorator, Component, ResolutionPolicy, screen, Vec3, view,Node, Tween, director, UITransform, Widget } from 'cc';
import { GameController } from '../../controllers/GameController';
import { WindowManager, WindowOrientation } from '../WindowManager';
const { ccclass, property } = _decorator;

@ccclass('WindowBase')
export class WindowBase extends Component {
    

    @property(Node)
    protected animationNode: Node | null = null;

    private playingTween: Tween<Node> | null = null;

    protected gameController: GameController | null = null;

    private originalContentSize: Vec3 = new Vec3();

    //getter and setter 
    public get WindowOrientation(): WindowOrientation {
        return this.windowOrientation;
    }
    public set WindowOrientation(value: WindowOrientation) {
        this.windowOrientation = value;
        this.onOrientationChange(value);
    }
    private windowOrientation: WindowOrientation = WindowOrientation.LANDSCAPE;


    //getter 
    public get RealScale(): Vec3 {
        return this.realScale;
    }

    private realScale: Vec3 = new Vec3();


    protected onLoad(): void {
    }

    protected start(): void {
    }

    public initialize(orientation: WindowOrientation = WindowOrientation.LANDSCAPE): void {
        this.windowOrientation = orientation;
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

    protected onOrientationChange(windowOrientation: WindowOrientation): void {
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
            .call(() => {
                this.onJellyAnimationEnd();
            })
            .start();
    }

    protected onJellyAnimationEnd(): void {
        this.playingTween = null;
        this.animationNode.setScale(1, 1, 1);
    }
}
