import { _decorator, JsonAsset, resources } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';

interface ItemData {
    id: string;
    name: string;
    description: string;
    item_type: string;
    exp_get: string;
    buy_price: string;
    sell_price: string;
    png: string;
}

export class ItemDataManager {
    private static _instance: ItemDataManager | null = null;
    private itemDataList: ItemData[] = [];

    private constructor() {}

    public static get instance(): ItemDataManager {
        if (this._instance === null) {
            this._instance = new ItemDataManager();
        }
        return this._instance;
    }

    public async loadItemData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resources.load(SharedDefines.JSON_ITEM_DATA, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load ItemData:', err);
                    reject(err);
                    return;
                }
                
                this.itemDataList = jsonAsset.json.list;
                resolve();
            });
        });
    }

    public getItemById(id: string): ItemData | undefined {
        return this.itemDataList.find(item => item.id === id);
    }

    public getItemByName(name: string): ItemData | undefined {
        return this.itemDataList.find(item => item.name === name);
    }

    public getItemsByType(itemType: string): ItemData[] {
        return this.itemDataList.filter(item => item.item_type === itemType);
    }

    public getItemsBySellPrice(minPrice: number, maxPrice: number): ItemData[] {
        return this.itemDataList.filter(item => {
            const sellPrice = parseInt(item.sell_price);
            return sellPrice >= minPrice && sellPrice <= maxPrice;
        });
    }

    public getItemsByExpGain(minExp: number, maxExp: number): ItemData[] {
        return this.itemDataList.filter(item => {
            const expGain = parseInt(item.exp_get);
            return expGain >= minExp && expGain <= maxExp;
        });
    }

    public getAllItems(): ItemData[] {
        return [...this.itemDataList];
    }

    public getItemCount(): number {
        return this.itemDataList.length;
    }

    public isItemDataLoaded(): boolean {
        return this.itemDataList.length > 0;
    }
}
