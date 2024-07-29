import { _decorator, Component, Node } from 'cc';
import { PlotTile } from '../entities/PlotTile';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    @property(Node)
    private gameplayContainer: Node| null = null;

    @property(PlotTile)
    private plotTiles: PlotTile[] = [];

    private playerController: PlayerController| null = null;

    onLoad(): void {


        this.setGameViewVisibility(false);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    //create getplayerController() method
    public getPlayerController(): PlayerController {
        if (this.playerController) {
            return this.playerController;
        } else {
            console.warn('playerController is not set in GameController');
            return null;
        }
    }

    public setGameViewVisibility(visible: boolean): void {
        if (this.gameplayContainer) {
            this.gameplayContainer.active = visible;
        } else {
            console.warn('gameplayContainer is not set in GameController');
        }
    }

    public startGame(): void {
        this.setGameViewVisibility(true);

        //new node and add playercontroller
        const playerControllerNode = new Node('PlayerController');
        this.node.addChild(playerControllerNode);
        this.playerController = playerControllerNode.addComponent(PlayerController);

    }
}


