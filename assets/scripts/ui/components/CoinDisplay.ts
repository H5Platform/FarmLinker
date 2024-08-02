import { _decorator } from 'cc';
import { CurrencyDisplayBase } from './CurrencyDisplayBase';
import { SharedDefines } from '../../misc/SharedDefines';

const { ccclass } = _decorator;

@ccclass('CoinDisplay')
export class CoinDisplay extends CurrencyDisplayBase {
    protected eventName: string = SharedDefines.EVENT_PLAYER_GOLD_CHANGE;

    protected getCurrencyValue(): number {
        return this.playerState ? this.playerState.gold : 0;
    }

    public addCurrency(amount: number): void {
        if (this.playerState) {
            this.playerState.addGold(amount);
        }
    }
}
