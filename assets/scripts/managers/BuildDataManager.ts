import { _decorator, JsonAsset, resources } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';

interface BuildData {
    id: string;
    name: string;
    description: string;
    level_need: string;
    texture: string;
    item_type:number;
    cost_coin:number;
    cost_diamond:number;
    prosperity:number;
}

export class BuildDataManager {
    private static _instance: BuildDataManager | null = null;
    private buildDataList: BuildData[] = [];

    private constructor() {}

    public static get instance(): BuildDataManager {
        if (this._instance === null) {
            this._instance = new BuildDataManager();
        }
        return this._instance;
    }

    public async loadBuildData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resources.load(SharedDefines.JSON_BUILD_DATA, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load BuildData:', err);
                    reject(err);
                    return;
                }
                
                this.buildDataList = jsonAsset.json.list;
                resolve();
            });
        });
    }

    public findBuildDataById(id: string): BuildData | undefined {
        return this.buildDataList.find(build => build.id === id);
    }

    public findBuildDataByName(name: string): BuildData | undefined {
        return this.buildDataList.find(build => build.name === name);
    }

    public filterBuildDataByLevelRequirement(level: number): BuildData[] {
        return this.buildDataList.filter(build => parseInt(build.level_need) <= level);
    }

    public getAllBuildData(): BuildData[] {
        return [...this.buildDataList];
    }

    public getBuildDataCount(): number {
        return this.buildDataList.length;
    }

    public isBuildDataLoaded(): boolean {
        return this.buildDataList.length > 0;
    }
}