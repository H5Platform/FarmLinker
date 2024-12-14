import { _decorator, Component, Node, Sprite, Vec3, tween, instantiate, SpriteFrame, Prefab } from 'cc';
const { ccclass, property } = _decorator;

export enum CoinType {
    COIN,
    DIAMOND,
    EXP
}

@ccclass('CoinCollectionEffectComponent')
export class CoinCollectionEffectComponent extends Component {



    @property(Prefab)
    public coinPrefab: Prefab | null = null;

    @property(Prefab)
    public diamondPrefab: Prefab | null = null;

    @property(Prefab)
    public expPrefab: Prefab | null = null;


    @property
    public coinCount: number = 10;

    @property
    public spreadRadius: number = 50;

    @property
    public moveDuration: number = 1;

    @property
    public delayBetweenCoins: number = 0.05;

    private targetPosition: Vec3 = new Vec3();
    private isPlaying: boolean = false;
    private targetPrefab: Prefab | null = null;

    onLoad() {
    }

    public setTargetPosition(position: Vec3) {
        this.targetPosition = position;
    }

    public play(coinType: CoinType, startPosition: Vec3, endPosition: Vec3) {
        if (this.isPlaying ) return;
        if(coinType === CoinType.COIN){
            this.targetPrefab = this.coinPrefab;
        } else if(coinType === CoinType.DIAMOND){
            this.targetPrefab = this.diamondPrefab;
        } else if(coinType === CoinType.EXP){
            this.targetPrefab = this.expPrefab;
        }

        if(!this.targetPrefab) {
            console.error("No target prefab set");
            return;
        }
        this.isPlaying = true;
        
        this.targetPosition = endPosition;

        for (let i = 0; i < this.coinCount; i++) {
            this.scheduleOnce(() => this.spawnCoin(startPosition), i * this.delayBetweenCoins);
        }
    }

    public stop() {
        this.isPlaying = false;
        this.unscheduleAllCallbacks();
        this.node.removeAllChildren();
    }

    private spawnCoin(startPosition: Vec3) {
        const coin = instantiate(this.targetPrefab);
        coin.active = true;
        coin.parent = this.node;

        const randomOffset = new Vec3(
            (Math.random() - 0.5) * 2 * this.spreadRadius,
            (Math.random() - 0.5) * 2 * this.spreadRadius,
            0
        );

        coin.setWorldPosition(startPosition.add(randomOffset));

        tween(coin)
            .to(this.moveDuration, { worldPosition: this.targetPosition })
            .call(() => {
                coin.removeFromParent();
                if (this.node.children.length === 1) {  // Only the coinPrefab is left
                    this.isPlaying = false;
                    this.node.emit('effectComplete');
                    this.node.destroy();
                }
            })
            .start();
    }
}