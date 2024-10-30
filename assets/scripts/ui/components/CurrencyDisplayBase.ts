import { _decorator, Component, Label, Node } from 'cc';
import { PlayerState } from '../../entities/PlayerState';

const { ccclass, property } = _decorator;

@ccclass('CurrencyDisplayBase')
export abstract class CurrencyDisplayBase extends Component {
    @property(Node)
    public currencySpriteNode: Node | null = null;
    @property(Label)
    protected lblCurrency: Label | null = null;

    protected playerState: PlayerState | null = null;
    protected abstract eventName: string;

    public initialize(playerState: PlayerState): void {
        this.playerState = playerState;
        this.setupEventListeners();
        this.refreshDisplay();
    }

    protected setupEventListeners(): void {
        if (this.playerState) {
            this.playerState.eventTarget.on(this.eventName, this.refreshDisplay, this);
        }
    }

    protected abstract getCurrencyValue(): number;

    public refreshDisplay(): void {
        if (this.playerState && this.lblCurrency) {
            this.lblCurrency.string = this.getCurrencyValue().toString();
        }
    }

    protected onDestroy(): void {
        if (this.playerState) {
            this.playerState.eventTarget.off(this.eventName, this.refreshDisplay, this);
        }
    }
}
