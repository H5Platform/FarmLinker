import { _decorator, Component, Node, ScrollView, instantiate, Prefab, Sprite, Button, UITransform, Vec3, SpriteFrame } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { PlayerController } from '../../controllers/PlayerController';
import { InventoryComponent, InventoryItem } from '../../components/InventoryComponent';
import { PlotTile } from '../../entities/PlotTile';
import { SharedDefines } from '../../misc/SharedDefines';
import { ResourceManager } from '../../managers/ResourceManager';

//TODO move to touch location when shown

const { ccclass, property } = _decorator;

@ccclass('FarmSelectionWindow')
export class FarmSelectionWindow extends WindowBase {
    @property(ScrollView)
    private scrollView: ScrollView | null = null;

    @property(Prefab)
    private itemPrefab: Prefab | null = null;

    private playerController: PlayerController | null = null;
    private inventoryComponent: InventoryComponent | null = null;
   // private currentPlotTile: PlotTile | null = null;

    public initialize(): void {
        super.initialize();
        this.playerController = this.gameController.getPlayerController();
        this.inventoryComponent = this.playerController.inventoryComponent;
    }

    public show(): void {
        super.show();
        this.updateScrollView();
    }

    private updateScrollView(): void {
        if (!this.scrollView || !this.itemPrefab) return;

        this.scrollView.content.removeAllChildren();

        const seeds = this.getSeedItems();
        const itemCount = Math.min(seeds.length, 5);

        // 设置 ScrollView 的大小
        const scrollViewHeight = itemCount * 110;
        const uiTransform = this.scrollView.node.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.height = scrollViewHeight;
        }

        // 禁用或启用滚动
        this.scrollView.vertical = seeds.length > 1;

        seeds.forEach(seed => this.createSeedItem(seed));
    }

    private getSeedItems(): InventoryItem[] {
        return this.inventoryComponent?.getAllItems().filter(item => item.itemType === '2') || [];
    }

    private createSeedItem(seed: InventoryItem): void {
        const itemNode = instantiate(this.itemPrefab!);
        const sprite = itemNode.getComponentInChildren(Sprite);
        const button = itemNode.getComponentInChildren(Button);

        if (sprite) {
            ResourceManager.instance.loadAsset<SpriteFrame>(`${SharedDefines.WINDOW_GAME_TEXTURES}${seed.iconName}/spriteFrame`, SpriteFrame)
                .then(spriteFrame => {
                    if (spriteFrame) {
                        sprite.spriteFrame = spriteFrame;
                    }
                });
        }

        if (button) {
            button.node.on(Button.EventType.CLICK, () => this.onSeedSelected(seed), this);
        }

        this.scrollView!.content.addChild(itemNode);
    }

    private onSeedSelected(seed: InventoryItem): void {
        // if (this.currentPlotTile && !this.currentPlotTile.isOccupied) {
        //     // 在这里实现种植逻辑
        //     console.log(`Planting seed: ${seed.name} on plot: ${this.currentPlotTile.node.name}`);
        //     // TODO: Implement planting logic
        //     this.hide();
        // }
    }
}
