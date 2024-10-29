import { _decorator, JsonAsset, resources } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';

interface CoinData {
    id: string;
    description: string;
    pay_money: string;
    get_money: string;
}

export class CoinDataManager {
    private static _instance: CoinDataManager | null = null;
    private coinDataList: CoinData[] = [];

    private constructor() {}

    public static get instance(): CoinDataManager {
        if (this._instance === null) {
            this._instance = new CoinDataManager();
        }
        return this._instance;
    }

    public async loadCoinData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resources.load(SharedDefines.JSON_COIN_DATA, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load CoinData:', err);
                    reject(err);
                    return;
                }
                
                this.coinDataList = jsonAsset.json.list;
                resolve();
            });
        });
    }

    public getCoinById(id: string): CoinData | undefined {
        return this.coinDataList.find(coin => coin.id === id);
    }

    public getCoinByPayMoney(payMoney: string): CoinData | undefined {
        return this.coinDataList.find(coin => coin.pay_money === payMoney);
    }

    public getCoinsByPayMoneyRange(minPay: number, maxPay: number): CoinData[] {
        return this.coinDataList.filter(coin => {
            const payMoney = parseInt(coin.pay_money);
            return payMoney >= minPay && payMoney <= maxPay;
        });
    }

    public getCoinsByGetMoneyRange(minGet: number, maxGet: number): CoinData[] {
        return this.coinDataList.filter(coin => {
            const getMoney = parseInt(coin.get_money);
            return getMoney >= minGet && getMoney <= maxGet;
        });
    }

    public getAllCoins(): CoinData[] {
        return [...this.coinDataList];
    }

    public getCoinCount(): number {
        return this.coinDataList.length;
    }

    public isCoinDataLoaded(): boolean {
        return this.coinDataList.length > 0;
    }
} 