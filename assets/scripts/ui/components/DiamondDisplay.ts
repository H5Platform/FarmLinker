import { _decorator } from 'cc';
import { CurrencyDisplayBase } from './CurrencyDisplayBase';
import { SharedDefines } from '../../misc/SharedDefines';

const { ccclass } = _decorator;

@ccclass('DiamondDisplay')
export class DiamondDisplay extends CurrencyDisplayBase {
    protected eventName: string = SharedDefines.EVENT_PLAYER_DIAMOND_CHANGE;

    protected getCurrencyValue(): number {
        return this.playerState ? this.playerState.diamond : 0;
    }

    public addCurrency(amount: number): void {
        if (this.playerState) {
            this.playerState.addDiamond(amount);
        }
    }
}
