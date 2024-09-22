import { _decorator, Component, Node, Label, Sprite, Button, SpriteFrame } from 'cc';
import { ResourceManager } from '../../../managers/ResourceManager';
import { SharedDefines } from '../../../misc/SharedDefines';
import { ScrollViewItem } from './ScrollViewItem';

const { ccclass, property } = _decorator;

@ccclass('CraftScrollViewItem')
export class CraftScrollViewItem extends ScrollViewItem {
    @property(Label)
    private lbName: Label | null = null;

    @property(Label)
    private lbCoin: Label | null = null;

    @property(Node)
    private diamondNode: Node | null = null;

    @property(Label)
    private lbDiamond: Label | null = null;

    @property(Sprite)
    private sprite: Sprite | null = null;

    @property(Button)
    private button: Button | null = null;

    private buildData: any;

    public initialize(buildData: any, onClickCallback: (buildData: any) => void): void {
        this.buildData = buildData;

        if (this.lbName) {
            this.lbName.string = buildData.description;
        }
        if (this.lbCoin) {
            this.lbCoin.string = buildData.cost_coin.toString();
        }
        if (this.diamondNode) {
            this.diamondNode.active = buildData.cost_diamond > 0;
        }
        if (this.lbDiamond) {
            this.lbDiamond.string = buildData.cost_diamond.toString();
        }

        this.loadSpriteFrame(buildData.texture);

        if (this.button) {
            this.button.node.on(Button.EventType.CLICK, () => onClickCallback(buildData), this);
        }

        this.node.name = buildData.id;
    }

    private async loadSpriteFrame(iconName: string): Promise<void> {
        if (this.sprite) {
            const spriteFrame = await ResourceManager.instance.loadAsset<SpriteFrame>(`${SharedDefines.WINDOW_BUILDING_TEXTURES}${iconName}/spriteFrame`, SpriteFrame);
            if (spriteFrame) {
                this.sprite.spriteFrame = spriteFrame;
            }
        }
    }

    public setActive(active: boolean): void {
        this.node.active = active;
    }

    public updateVisibilityByLevel(playerLevel: number): void {
       // console.log(`playerLevel: ${playerLevel}, required_level: ${this.buildData.level_need}`);
        this.setActive(playerLevel >= this.buildData.level_need);
    }
}


