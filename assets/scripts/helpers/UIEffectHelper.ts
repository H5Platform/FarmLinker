import { _decorator, Component, instantiate, Node, resources, Vec3 } from 'cc';
import { ResourceManager } from '../managers/ResourceManager';
import { CoinCollectionEffectComponent, CoinType } from '../effects/CoinCollectionEffectComponent';
import { SharedDefines } from '../misc/SharedDefines';
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
    
}


