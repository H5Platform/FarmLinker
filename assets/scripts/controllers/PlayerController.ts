import { _decorator, Component, Node } from 'cc';
import { PlayerState } from '../entities/PlayerState';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    private _playerState: PlayerState;

    //getter playerstate
    public get playerState(): PlayerState {
        return this._playerState;
    }

    protected onLoad(): void {
        this._playerState = new PlayerState();
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    public harvestCrop(cropValue: number): void {
        this._playerState.addGold(cropValue);
        this._playerState.addExperience(10); // Suppose 10 experience for each crop
    }
}


