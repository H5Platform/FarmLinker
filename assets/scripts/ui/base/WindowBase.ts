import { _decorator, Component, director, Node } from 'cc';
import { GameController } from '../../controllers/GameController';
const { ccclass, property } = _decorator;

@ccclass('WindowBase')
export class WindowBase extends Component {

    protected gameController: GameController | null = null;

    public initialize(): void {
        const gameControllerNode = director.getScene()?.getChildByName('GameController');
        if (gameControllerNode) {
            this.gameController = gameControllerNode.getComponent(GameController);
        }
     }

    public show(...args: any[]): void {
        this.node.active = true;
    }

    public hide(): void {
        this.node.active = false;
    }
}
