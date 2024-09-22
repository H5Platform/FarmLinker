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

        const gameControllerNode = director.getScene()?.getChildByName('GameController');
        if (gameControllerNode) {
            this.gameController = gameControllerNode.getComponent(GameController);
        }
     }

    public show(...args: any[]): void {
        this.node.active = true;

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
}
