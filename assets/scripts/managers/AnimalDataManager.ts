// AnimalDataManager.ts

import { _decorator, JsonAsset, resources } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';

interface AnimalData {
    id: string;
    name: string;
    description: string;
    farm_type: string;
    time_min: string;
    level_need: string;
    grid_capacity: string;
    png: string;
}

export class AnimalDataManager {
    private static _instance: AnimalDataManager | null = null;
    private animalDataList: AnimalData[] = [];

    private constructor() {}

    public static get instance(): AnimalDataManager {
        if (this._instance === null) {
            this._instance = new AnimalDataManager();
        }
        return this._instance;
    }

    public async loadAnimalData(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resources.load(SharedDefines.JSON_ANIMAL_DATA, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error('Failed to load AnimalData:', err);
                    reject(err);
                    return;
                }
                
                this.animalDataList = jsonAsset.json.list;
                resolve();
            });
        });
    }

    public findAnimalDataById(id: string): AnimalData | undefined {
        return this.animalDataList.find(animal => animal.id === id);
    }

    public findAnimalDataByName(name: string): AnimalData | undefined {
        return this.animalDataList.find(animal => animal.name === name);
    }

    public filterAnimalDataByFarmType(farmType: string): AnimalData[] {
        return this.animalDataList.filter(animal => animal.farm_type === farmType);
    }

    public filterAnimalDataByMaxLevel(maxLevel: number): AnimalData[] {
        return this.animalDataList.filter(animal => parseInt(animal.level_need) <= maxLevel);
    }

    public getAllAnimalData(): AnimalData[] {
        return [...this.animalDataList];
    }

    public getAnimalDataCount(): number {
        return this.animalDataList.length;
    }

    public isAnimalDataLoaded(): boolean {
        return this.animalDataList.length > 0;
    }
}