import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    @property(Node)
    private gameplayContainer: Node| null = null;

    onLoad(): void {
        this.setGameViewVisibility(false);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    public setGameViewVisibility(visible: boolean): void {
        if (this.gameplayContainer) {
            this.gameplayContainer.active = visible;
        } else {
            console.warn('gameplayContainer is not set in GameController');
        }
    }
}


