import { _decorator, JsonAsset, resources } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';

interface SyntheData {
    id: string;
    name: string;
    description: string;
    build: string;
    time_min: string;
    formula_1: string[];
    quality: string[];
    synthe_item_id: string;
}

export class SyntheDataManager {
    private static _instance: SyntheDataManager | null = null;
    private syntheDataList: SyntheData[] = [];

    private constructor() {}

    public static get instance(): SyntheDataManager {
        if (this._instance === null) {
            this._instance = new SyntheDataManager();
        }
        return this._instance;
    }

    public async loadSyntheData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resources.load(SharedDefines.JSON_SYNTHE_DATA, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load SyntheData:', err);
                    reject(err);
                    return;
                }
                
                this.syntheDataList = jsonAsset.json.list;
                resolve();
            });
        });
    }

    public findSyntheDataById(id: string): SyntheData | undefined {
        return this.syntheDataList.find(synthe => synthe.id === id);
    }

    public findSyntheDataByName(name: string): SyntheData | undefined {
        return this.syntheDataList.find(synthe => synthe.name === name);
    }

    public filterSyntheDataByBuild(build: string): SyntheData[] {
        return this.syntheDataList.filter(synthe => synthe.build === build);
    }

    public getAllSyntheData(): SyntheData[] {
        return [...this.syntheDataList];
    }

    public getSyntheDataCount(): number {
        return this.syntheDataList.length;
    }

    public isSyntheDataLoaded(): boolean {
        return this.syntheDataList.length > 0;
    }
}