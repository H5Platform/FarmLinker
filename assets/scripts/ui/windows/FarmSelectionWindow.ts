import { _decorator, Component, Node, ScrollView, instantiate, Prefab, Sprite, Button, UITransform, Vec3, SpriteFrame, Vec2 } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { PlayerController } from '../../controllers/PlayerController';
import { InventoryComponent, InventoryItem, ItemType } from '../../components/InventoryComponent';
import { PlotTile } from '../../entities/PlotTile';
import { CommandType, FarmSelectionType, SharedDefines } from '../../misc/SharedDefines';
import { ResourceManager } from '../../managers/ResourceManager';
import { Fence } from '../../entities/Fence';
import { AnimalDataManager } from '../../managers/AnimalDataManager';
import { WindowManager } from '../WindowManager';
import { NetworkManager } from '../../managers/NetworkManager';

//TODO move to touch location when shown

const { ccclass, property } = _decorator;

@ccclass('FarmSelectionWindow')
export class FarmSelectionWindow extends WindowBase {
    @property(ScrollView)
    private scrollView: ScrollView | null = null;
    @property(Node)
    private plotCommandNode: Node | null = null;
    @property(Node)
    private animalCommandNode: Node | null = null;
    @property(Button)
    private btnCropCare: Button | null = null;
    @property(Button)
    private btnCropTreat: Button | null = null;
    @property(Button)
    private btnCropCleanse: Button | null = null;
    @property(Button)
    private btnAnimalCare: Button | null = null;
    @property(Button)
    private btnAnimalTreat: Button | null = null;
    @property(Button)
    private btnAnimalCleanse: Button | null = null;

    @property(Prefab)
    private itemPrefab: Prefab | null = null;

    clickLocation: Vec2 = null;
    private currentSelectionType: FarmSelectionType = FarmSelectionType.NONE;
    private currentSelectionNode: Node | null = null;
    private fence : Fence | null = null;
    private playerController: PlayerController | null = null;
    private inventoryComponent: InventoryComponent | null = null;
    private callback: (string)=>void | null = null;
   // private currentPlotTile: PlotTile | null = null;

    public initialize(): void {
        super.initialize();
        this.playerController = this.gameController.getPlayerController();
        this.inventoryComponent = this.playerController.inventoryComponent;

        this.btnCropCare.node.on(Button.EventType.CLICK, this.onCare, this);
        this.btnCropTreat.node.on(Button.EventType.CLICK, this.onTreat, this);
        this.btnCropCleanse.node.on(Button.EventType.CLICK, this.onCleanse, this);
        this.btnAnimalCare.node.on(Button.EventType.CLICK, this.onCare, this);
        this.btnAnimalTreat.node.on(Button.EventType.CLICK, this.onTreat, this);
        this.btnAnimalCleanse.node.on(Button.EventType.CLICK, this.onCleanse, this);
    }

    public show(...args: any[]): void {
        super.show(...args);
        if(args.length === 0){
            console.log("FarmSelectionWindow: no arguments passed");
            return;
        }
        this.currentSelectionType = args[0] as FarmSelectionType;
        this.currentSelectionNode = args[1] as Node;
        this.clickLocation = args[2] as Vec2;
        this.callback = args[3] as (string)=>void;
        this.updateFarmSelectionViewVisibilityByType(this.currentSelectionType);
        if (this.currentSelectionType === FarmSelectionType.PLOT) {
            
            const animations = this.getItemsByType(ItemType.CROPSEED);
            console.log(`crop seed count: ${animations.length}`);
            this.updateScrollView(animations);
        }
        else if(this.currentSelectionType === FarmSelectionType.FENCE){
            this.fence = this.currentSelectionNode!.getComponent(Fence);
            const animations = this.getItemsByType(ItemType.ANIMALCUB);
            console.log(`animation count: ${animations.length}`);
            this.updateScrollView(animations);
        }
        
        
    }

    private updateFarmSelectionViewVisibilityByType(type:FarmSelectionType): void {
        console.log(`updateFarmSelectionViewVisibilityByType: ${type}`);
        if(type === FarmSelectionType.PLOT || type === FarmSelectionType.FENCE){
            this.scrollView.node.active = true;
            this.plotCommandNode.active = false;
            this.animalCommandNode.active = false;
            console.log("Show scroll view");
        }
        else if(type === FarmSelectionType.PLOT_COMMAND){
            this.scrollView.node.active = false;
            this.plotCommandNode.active = true;
            this.animalCommandNode.active = false;
            console.log("Show plot command");
        }
        else if(type === FarmSelectionType.ANIMAL_COMMAND){
            this.scrollView.node.active = false;
            this.plotCommandNode.active = false;
            this.animalCommandNode.active = true;
            console.log("Show animal command");
        }
    }

    //#region handle shop items

    private updateScrollView(items:any[]): void {
        if (!this.scrollView || !this.itemPrefab) return;

        this.scrollView.content.removeAllChildren();

        const itemCount = Math.min(items.length, 5);

        // 设置 ScrollView 的大小
        // const scrollViewHeight = itemCount * 110;
        // const uiTransform = this.scrollView.node.getComponent(UITransform);
        // if (uiTransform) {
        //     uiTransform.height = scrollViewHeight;
        // }

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

    //#endregion

//#region handle button click

    private async onCare(): Promise<void> {
        console.log("onCare");
        this.onItemSelected(CommandType.Care);

    }

    private onTreat(): void {
        console.log("onTreat");
        this.onItemSelected(CommandType.Treat);
    }

    private onCleanse(): void {
        console.log("onCleanse");
        this.onItemSelected(CommandType.Cleanse);
    }

//#endregion

    private onItemSelected(data:any = null): void {
        // if (this.currentPlotTile && !this.currentPlotTile.isOccupied) {
        //     // 在这里实现种植逻辑
        //     console.log(`Planting seed: ${seed.name} on plot: ${this.currentPlotTile.node.name}`);
        //     // TODO: Implement planting logic
        //     this.hide();
        // }
        
        this.callback(data);
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
        WindowManager.instance.hide(SharedDefines.WINDOW_SELECTION_NAME);
    }


}
