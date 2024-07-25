import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;
import { WindowBase } from '../base/WindowBase';
import { GameController } from '../../controllers/GameController';

@ccclass('GameWindow')
export class GameWindow extends WindowBase {

    private gameController: GameController | null = null;

    public initialize(): void 
    {
        super.initialize();
        const gameControllerNode = director.getScene()?.getChildByName('GameController');
        if (gameControllerNode) {
            this.gameController = gameControllerNode.getComponent(GameController);
        }
    }

    public show(): void 
    {
        super.show();
        this.gameController?.setGameViewVisibility(true);
    }

    public hide(): void 
    {
        super.hide();
    }

    // update(deltaTime: number) {
        
    // }
}


