import { _decorator, Component, Node } from 'cc';
import { PlayerState } from '../entities/PlayerState';
import { InventoryComponent } from '../components/InventoryComponent';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    private _playerState: PlayerState;
    private _inventoryComponent: InventoryComponent;

    //getter playerstate
    public get playerState(): PlayerState {
        return this._playerState;
    }

    //getter inventorycomponent
    public get inventoryComponent(): InventoryComponent {
        return this._inventoryComponent;
    }

    protected onLoad(): void {
        this._playerState = new PlayerState();
        this._inventoryComponent = this.node.getComponent(InventoryComponent);
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


