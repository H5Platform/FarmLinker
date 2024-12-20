import { _decorator, Component, Node, Sprite, Vec3, tween, instantiate, SpriteFrame, Prefab, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HarvestCollectionEffectComponent')
export class HarvestCollectionEffectComponent extends Component {
    @property(Sprite)
    private sprite: Sprite | null = null;

    @property
    public moveDuration: number = 1;

    @property
    public initialScale: number = 1.05;

    @property
    public finalScale: number = 0.3;

    @property
    public heightFactor: number = 200; // 控制曲线的高度

    private isPlaying: boolean = false;

    onLoad() {
        // 确保有Sprite组件
        if (!this.sprite) {
            this.sprite = this.getComponent(Sprite);
            if (!this.sprite) {
                this.sprite = this.addComponent(Sprite);
            }
        }
    }

    public setSpriteFrame(spriteFrame: SpriteFrame) {
        if (this.sprite) {
            this.sprite.spriteFrame = spriteFrame;
        }
    }

    public setSpriteFrameByName(name: string) {
        // 这里需要根据实际的资源加载系统来实现
        // 例如：
        // ResourceManager.instance.loadSpriteFrame(name).then(spriteFrame => {
        //     this.setSpriteFrame(spriteFrame);
        // });
    }

    private quadraticBezier(p0: Vec3, p1: Vec3, p2: Vec3, t: number): Vec3 {
        const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
        const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
        return new Vec3(x, y, 0);
    }

    public play(startPos: Vec3, endPos: Vec3) {
        if (this.isPlaying) return;
        this.isPlaying = true;

        // 设置初始位置和缩放
        this.node.setWorldPosition(startPos);
        this.node.scale = new Vec3(this.initialScale, this.initialScale, 1);

        // 创建直线移动动画
        tween(this.node)
            .parallel(
                // 位置动画
                tween().to(this.moveDuration, { worldPosition: endPos }),
                // 缩放动画
                tween().to(this.moveDuration, { scale: new Vec3(this.finalScale, this.finalScale, 1) })
            )
            .call(() => {
                // 动画完成后的清理
                this.isPlaying = false;
                this.node.emit('effectComplete');
                this.node.destroy();
            })
            .start();
    }

    public stop() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        this.node.destroy();
    }
} 