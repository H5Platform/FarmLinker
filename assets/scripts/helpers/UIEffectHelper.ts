import { _decorator, Component, instantiate, Node, resources, SpriteFrame, Vec3 } from 'cc';
import { ResourceManager } from '../managers/ResourceManager';
import { CoinCollectionEffectComponent, CoinType } from '../effects/CoinCollectionEffectComponent';
import { SharedDefines } from '../misc/SharedDefines';
import { HarvestCollectionEffectComponent } from '../effects/HarvestCollectionEffectComponent';
const { ccclass, property } = _decorator;

@ccclass('UIEffectHelper')
export class UIEffectHelper {
    
    // 金币收集效果
    public static async playCoinCollectionEffect(type:CoinType,parent : Node,startPos : Vec3,targetPos : Vec3): Promise<CoinCollectionEffectComponent | null> {
        const effectPrefab = await ResourceManager.instance.loadPrefab(SharedDefines.PREFAB_COIN_COLLECTION_EFFECT);
        if (effectPrefab) {
            const effect = instantiate(effectPrefab);
            parent.addChild(effect);
            effect.setPosition(startPos);
            const coinCollectionEffect = effect.getComponent(CoinCollectionEffectComponent);
            coinCollectionEffect.play(type,startPos,targetPos);
            return coinCollectionEffect;
        }
        return null;
    }

    public static async playHarvestEffect(parent: Node,startPos: Vec3, endPos: Vec3, spriteFrame: SpriteFrame) {
        const effectPrefab = await ResourceManager.instance.loadPrefab('ui/effects/HarvestCollectionEffect');
        if (effectPrefab) {
            const effect = instantiate(effectPrefab);
            // 将效果添加到合适的父节点（通常是 Canvas 或 UI 层）
            parent.addChild(effect);
            
            const harvestEffect = effect.getComponent(HarvestCollectionEffectComponent);
            if (harvestEffect) {
                // 设置精灵帧
                harvestEffect.setSpriteFrame(spriteFrame);
                
                // 播放动效
                harvestEffect.play(
                    startPos,
                    endPos
                );
                
                // 监听动效完成
                effect.once('effectComplete', () => {
                    // 处理动效完成后的逻辑
                });
            }
        }
    }
    
}


