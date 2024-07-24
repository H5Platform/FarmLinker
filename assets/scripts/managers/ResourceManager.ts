import { _decorator, resources, Prefab, Asset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResourceManager')
export class ResourceManager {
    private static _instance: ResourceManager | null = null;
    private cache: Map<string, Asset> = new Map();

    public static get instance(): ResourceManager {
        if (this._instance === null) {
            this._instance = new ResourceManager();
        }
        return this._instance;
    }

    public async loadPrefab(path: string): Promise<Prefab | null> {
        const cachedAsset = this.cache.get(path);
        if (cachedAsset instanceof Prefab) {
            return cachedAsset;
        }

        return new Promise((resolve) => {
            resources.load(path, Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab ${path}:`, err);
                    resolve(null);
                } else {
                    this.cache.set(path, prefab);
                    resolve(prefab);
                }
            });
        });
    }

    public async loadAsset<T extends Asset>(path: string, type: typeof Asset): Promise<T | null> {
        const cachedAsset = this.cache.get(path);
        if (cachedAsset instanceof type) {
            return cachedAsset as T;
        }

        return new Promise((resolve) => {
            resources.load(path, type, (err, asset) => {
                if (err) {
                    console.error(`Failed to load asset ${path}:`, err);
                    resolve(null);
                } else {
                    this.cache.set(path, asset);
                    resolve(asset as T);
                }
            });
        });
    }

    public releaseAsset(path: string): void {
        const asset = this.cache.get(path);
        if (asset) {
            resources.release(path);
            this.cache.delete(path);
        }
    }

    public clearCache(): void {
        this.cache.forEach((asset,path) => {
            resources.release(path);
        });
        this.cache.clear();
    }
}
