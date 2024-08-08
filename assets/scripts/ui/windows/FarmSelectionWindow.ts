import { _decorator, Component, Node, ScrollView, instantiate, Prefab, Sprite, Button, UITransform, Vec3, SpriteFrame, Vec2 } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { PlayerController } from '../../controllers/PlayerController';
import { InventoryComponent, InventoryItem, ItemType } from '../../components/InventoryComponent';
import { PlotTile } from '../../entities/PlotTile';
import { FarmSelectionType, SharedDefines } from '../../misc/SharedDefines';
import { ResourceManager } from '../../managers/ResourceManager';
import { Fence } from '../../entities/Fence';
import { AnimalDataManager } from '../../managers/AnimalDataManager';
import { WindowManager } from '../WindowManager';

//TODO move to touch location when shown

const { ccclass, property } = _decorator;

@ccclass('FarmSelectionWindow')
export class FarmSelectionWindow extends WindowBase {
    @property(ScrollView)
    private scrollView: ScrollView | null = null;

    @property(Prefab)
    private itemPrefab: Prefab | null = null;

    clickLocation: Vec2 = null;
    private currentSelectionType: FarmSelectionType = FarmSelectionType.NONE;
    private currentSelectionNode: Node | null = null;
    private fence : Fence | null = null;
    private playerController: PlayerController | null = null;
    private inventoryComponent: InventoryComponent | null = null;
    private callback: (FarmSelectionType,string)=>void | null = null;
   // private currentPlotTile: PlotTile | null = null;

    public initialize(): void {
        super.initialize();
        this.playerController = this.gameController.getPlayerController();
        this.inventoryComponent = this.playerController.inventoryComponent;
    }

    public show(...args: any[]): void {
        super.show(...args);
        if(args.length === 0){
            console.log("FarmSelectionWindow: no arguments passed");
            return;
        }
        this.currentSelectionType = args[0] as FarmSelectionType;
        this.currentSelectionNode = args[1] as Node;
        this.callback = args[3] as ()=>void;
        if (this.currentSelectionType === FarmSelectionType.PLOT) {
            const plotTileItem = this.currentSelectionNode!.getComponent(PlotTile);
            if (plotTileItem) {
                if(plotTileItem.isOccupied){
                    console.log("FarmSelectionWindow: plotTile is occupied");
                }
                else{

                }
            }
            else{
                console.error("FarmSelectionWindow: plotTileItem is null");
                return;
            }
        }
        else if(this.currentSelectionType === FarmSelectionType.FENCE){
            this.clickLocation = args[2] as Vec2;
            this.fence = this.currentSelectionNode!.getComponent(Fence);
            const animations = this.getItemsByType(ItemType.ANIMALCUB);
            this.updateScrollView(animations);
        }
        
    }

    private updateScrollView(items:any[]): void {
        if (!this.scrollView || !this.itemPrefab) return;

        this.scrollView.content.removeAllChildren();

        const itemCount = Math.min(items.length, 5);

        // 设置 ScrollView 的大小
        const scrollViewHeight = itemCount * 110;
        const uiTransform = this.scrollView.node.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.height = scrollViewHeight;
        }

        // 禁用或启用滚动
        this.scrollView.vertical = items.length > 1;

        items.forEach(seed => this.createItem(seed.iconName,seed));
    }

    private getItemsByType(itemType:ItemType): InventoryItem[] {
        const itemTypeNumber = itemType as number;
        return this.inventoryComponent?.getAllItems().filter(item => item.itemType === itemTypeNumber.toString()) || [];
    }

    private createItem(textureName:string,data:any|null = null): void {
        const itemNode = instantiate(this.itemPrefab!);
        const sprite = itemNode.getComponent(Sprite);
        const button = itemNode.getComponent(Button);

        if (sprite) {
            ResourceManager.instance.loadAsset<SpriteFrame>(`${SharedDefines.WINDOW_SHOP_TEXTURES}${textureName}/spriteFrame`, SpriteFrame)
                .then(spriteFrame => {
                    if (spriteFrame) {
                        sprite.spriteFrame = spriteFrame;
                    }
                });
        }

        if (button) {
            button.node.on(Button.EventType.CLICK, () => this.onItemSelected(data), this);
        }

        this.scrollView!.content.addChild(itemNode);
    }

    private onItemSelected(data:any = null): void {
        // if (this.currentPlotTile && !this.currentPlotTile.isOccupied) {
        //     // 在这里实现种植逻辑
        //     console.log(`Planting seed: ${seed.name} on plot: ${this.currentPlotTile.node.name}`);
        //     // TODO: Implement planting logic
        //     this.hide();
        // }
        this.callback(this.currentSelectionType,data.detailId);
        // if(this.currentSelectionType === FarmSelectionType.FENCE){
        //     const worldPos = WindowManager.instance.uiCamera.screenToWorld(new Vec3( this.clickLocation.x,this.clickLocation.y,0));
        //     if(this.fence.tryAddAnimal(data.detailId,worldPos)){
        //         this.inventoryComponent?.removeItem(data.id,1);
        //     }
        //     else{
        //         console.log("Add animal failed,Fence is full");
        //         return;
        //     }
            
        // }

    }


}
