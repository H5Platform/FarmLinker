import { _decorator, JsonAsset, resources } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';

interface CropData {
    id: string;
    name: string;
    description: string;
    farm_type: string;
    crop_type: string;
    time_min: string;
    harvest_item_id: string;
    level_need: string;
    grid_capacity: string;
    icon: string;
    png: string;
}

export class CropDataManager {
    private static _instance: CropDataManager | null = null;
    private cropDataList: CropData[] = [];

    private constructor() {}

    public static get instance(): CropDataManager {
        if (this._instance === null) {
            this._instance = new CropDataManager();
        }
        return this._instance;
    }

    public async loadCropData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resources.load(SharedDefines.JSON_CROP_DATA, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load CropsData:', err);
                    reject(err);
                    return;
                }
                
                this.cropDataList = jsonAsset.json.list;
                resolve();
            });
        });
    }

    public findCropDataById(id: string): CropData | undefined {
        return this.cropDataList.find(crop => crop.id === id);
    }

    public findCropDataByName(name: string): CropData | undefined {
        return this.cropDataList.find(crop => crop.name === name);
    }

    public filterCropDataByCropType(cropType: string): CropData[] {
        return this.cropDataList.filter(crop => crop.crop_type === cropType);
    }

    public filterCropDataByFarmType(farmType: string): CropData[] {
        return this.cropDataList.filter(crop => crop.farm_type === farmType);
    }

    public filterCropDataByMaxLevel(maxLevel: number): CropData[] {
        return this.cropDataList.filter(crop => parseInt(crop.level_need) <= maxLevel);
    }

    public getAllCropData(): CropData[] {
        return [...this.cropDataList];
    }

    public getCropDataCount(): number {
        return this.cropDataList.length;
    }

    public isCropDataLoaded(): boolean {
        return this.cropDataList.length > 0;
    }
}