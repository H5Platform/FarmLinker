import { _decorator, JsonAsset, resources } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';

interface DiamondData {
    id: string;
    description: string;
    pay_money: string;
    get_money: string;
}

export class DiamondDataManager {
    private static _instance: DiamondDataManager | null = null;
    private diamondDataList: DiamondData[] = [];

    private constructor() {}

    public static get instance(): DiamondDataManager {
        if (this._instance === null) {
            this._instance = new DiamondDataManager();
        }
        return this._instance;
    }

    public async loadDiamondData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resources.load(SharedDefines.JSON_DIAMOND_DATA, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load DiamondData:', err);
                    reject(err);
                    return;
                }
                
                this.diamondDataList = jsonAsset.json.list;
                resolve();
            });
        });
    }

    public getDiamondById(id: string): DiamondData | undefined {
        return this.diamondDataList.find(diamond => diamond.id === id);
    }

    public getDiamondByPayMoney(payMoney: string): DiamondData | undefined {
        return this.diamondDataList.find(diamond => diamond.pay_money === payMoney);
    }

    public getDiamondsByPayMoneyRange(minPay: number, maxPay: number): DiamondData[] {
        return this.diamondDataList.filter(diamond => {
            const payMoney = parseInt(diamond.pay_money);
            return payMoney >= minPay && payMoney <= maxPay;
        });
    }

    public getDiamondsByGetMoneyRange(minGet: number, maxGet: number): DiamondData[] {
        return this.diamondDataList.filter(diamond => {
            const getMoney = parseInt(diamond.get_money);
            return getMoney >= minGet && getMoney <= maxGet;
        });
    }

    public getAllDiamonds(): DiamondData[] {
        return [...this.diamondDataList];
    }

    public getDiamondCount(): number {
        return this.diamondDataList.length;
    }

    public isDiamondDataLoaded(): boolean {
        return this.diamondDataList.length > 0;
    }
} 