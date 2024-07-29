import { _decorator, Component, Node } from 'cc';
import { PlayerState } from '../entities/PlayerState';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    private playerState: PlayerState;

    protected onLoad(): void {
        this.playerState = new PlayerState();
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    public harvestCrop(cropValue: number): void {
        this.playerState.addGold(cropValue);
        this.playerState.addExperience(10); // Suppose 10 experience for each crop
    }
}


