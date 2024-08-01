import { _decorator, SpriteAtlas, SpriteFrame, resources, Sprite, Color, assetManager, Asset,  Texture2D } from 'cc';
import { EDITOR } from 'cc/env';

export class SpriteHelper {
    /**
     * 从给定的Atlas中获取SpriteFrame
     * @param atlas 已加载的SpriteAtlas
     * @param name SpriteFrame的名称
     * @returns SpriteFrame | null
     */
    public static getSpriteFrameFromAtlas(atlas: SpriteAtlas, name: string): SpriteFrame | null {
        if (!atlas) {
            console.error('SpriteHelper: Atlas is null or undefined');
            return null;
        }
        const spriteFrame = atlas.getSpriteFrame(name);
        if (!spriteFrame) {
            console.warn(`SpriteHelper: SpriteFrame '${name}' not found in atlas`);
        }
        return spriteFrame;
    }

    /**
     * 异步从资源中加载Atlas并获取SpriteFrame
     * @param atlasPath Atlas资源路径
     * @param name SpriteFrame的名称
     * @returns Promise<SpriteFrame | null>
     */
    public static async getSpriteFrameFromPath(atlasPath: string, name: string): Promise<SpriteFrame | null> {
        return new Promise((resolve) => {
            resources.load(atlasPath, SpriteAtlas, (err, atlas) => {
                if (err) {
                    console.error(`SpriteHelper: Failed to load atlas at path '${atlasPath}'`, err);
                    resolve(null);
                    return;
                }
                const spriteFrame = this.getSpriteFrameFromAtlas(atlas, name);
                resolve(spriteFrame);
            });
        });
    }

    

    /**
     * 调整Sprite的透明度
     * @param sprite 要调整的Sprite组件
     * @param opacity 0-255之间的透明度值
     */
    public static setSpriteeOpacity(sprite: Sprite, opacity: number): void {
        if (!sprite) {
            console.error('SpriteHelper: Sprite is null or undefined');
            return;
        }
        opacity = Math.max(0, Math.min(255, opacity));
        const color = sprite.color;
        sprite.color = new Color(color.r, color.g, color.b, opacity);
    }

    /**
     * 从给定的Atlas中设置Sprite的SpriteFrame
     * @param sprite 要设置的Sprite组件
     * @param atlas 已加载的SpriteAtlas
     * @param name SpriteFrame的名称
     * @returns boolean 是否设置成功
     */
    public static setSpriteFrameFromAtlas(sprite: Sprite, atlas: SpriteAtlas, name: string): boolean {
        if (!sprite) {
            console.error('SpriteHelper: Sprite is null or undefined');
            return false;
        }
        if (!atlas) {
            console.error('SpriteHelper: Atlas is null or undefined');
            return false;
        }
        const spriteFrame = this.getSpriteFrameFromAtlas(atlas, name);
        if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
            return true;
        }
        else {
            console.log(`SpriteHelper: SpriteFrame '${name}' not found in atlas`);
        }
        return false;
    }

    /**
     * 异步设置Sprite的SpriteFrame
     * @param sprite 要设置的Sprite组件
     * @param atlasPath Atlas资源路径
     * @param name SpriteFrame的名称
     * @returns Promise<boolean> 是否设置成功
     */
    public static async setSpriteFrameFromPath(sprite: Sprite, atlasPath: string, name: string): Promise<boolean> {
        if (!sprite) {
            console.error('SpriteHelper: Sprite is null or undefined');
            return false;
        }
        const spriteFrame = await this.getSpriteFrameFromPath(atlasPath, name);
        if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
            return true;
        }
        return false;
    }

    
}