import { _decorator, JsonAsset } from 'cc';
import { ResourceManager } from './ResourceManager';

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
        const jsonAsset = await ResourceManager.instance.loadAsset('data/GradeData', JsonAsset) as any;
        if (jsonAsset && jsonAsset.json) {
            const gradeDataList: GradeData[] = jsonAsset.json;
            gradeDataList.forEach(gradeData => {
                this.gradeDataMap.set(gradeData.level, gradeData);
            });
        }
    }

    public getGradeData(level: number): GradeData | undefined {
        return this.gradeDataMap.get(level);
    }

    public getExpNeededForLevel(level: number): number {
        const gradeData = this.getGradeData(level);
        return gradeData ? gradeData.exp_need : 0;
    }
}