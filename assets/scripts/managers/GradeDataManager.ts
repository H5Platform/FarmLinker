import { _decorator, JsonAsset } from 'cc';
import { ResourceManager } from './ResourceManager';
import { SharedDefines } from '../misc/SharedDefines';

interface GradeData {
    id: string;
    level: number;
    exp_need: number;
    prosperity_need: number;
}

export class GradeDataManager {
    private static _instance: GradeDataManager;
    private gradeDataMap: Map<number, GradeData> = new Map();

    public static get instance(): GradeDataManager {
        if (!this._instance) {
            this._instance = new GradeDataManager();
        }
        return this._instance;
    }

    private constructor() {}

    public async initialize(): Promise<void> {
        const jsonAsset = await ResourceManager.instance.loadAsset(SharedDefines.JSON_GRADE_DATA, JsonAsset) as any;
        if (jsonAsset && jsonAsset.json) {
            const gradeDataList: GradeData[] = jsonAsset.json.list;
            for(let i = 0; i < gradeDataList.length; i++){
                const gradeData = gradeDataList[i];
                this.gradeDataMap.set(i+1, gradeData);
            }
        }
    }

    public getGradeData(level: number): GradeData | undefined {
        //if level is not in the map, return the last grade data
        if (!this.gradeDataMap.has(level)) {
            return this.gradeDataMap.get(this.gradeDataMap.size);
        }
        return this.gradeDataMap.get(level);
    }

    public getMaxLevel(): number {
        return this.gradeDataMap.size;
    }

    public getExpNeededForLevel(level: number): number {
        const gradeData = this.getGradeData(level);
        console.log('gradeData', gradeData);
        return gradeData ? gradeData.exp_need : 0;
    }
}