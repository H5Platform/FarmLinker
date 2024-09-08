import { _decorator, Component, Node, ScrollView, instantiate, Prefab, Sprite, Button, UITransform, Vec3, SpriteFrame, Vec2, EventTouch } from 'cc';
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
import { UIHelper } from '../../helpers/UIHelper';

//TODO move to touch location when shown

const { ccclass, property } = _decorator;

enum OperationTargetType{
    None = 0,
    Crop = 1,
    Animal = 2
}

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
    @property(Sprite)
    private operationSprite: Sprite | null = null;

    private clickLocation: Vec2 = null;
    private currentSelectionType: FarmSelectionType = FarmSelectionType.NONE;
    private currentSelectionNode: Node | null = null;
    //#region drag and command
    private currentOperationTargetType: OperationTargetType = OperationTargetType.None;
    private currentOperation: CommandType = CommandType.None;
    private currentDragTarget: Node | null = null;
    private lastDragOperationNode: Node | null = null;
    //#endregion
    private fence : Fence | null = null;
    private playerController: PlayerController | null = null;
    private inventoryComponent: InventoryComponent | null = null;
    private callback: (string)=>void | null = null;
   // private currentPlotTile: PlotTile | null = null;

    public initialize(): void {
        super.initialize();
        this.playerController = this.gameController.getPlayerController();
        this.inventoryComponent = this.playerController.inventoryComponent;

        this.playerController.inputComponent.eventTarget.on(SharedDefines.EVENT_CLICK, this.onClick, this);
        this.playerController.inputComponent.eventTarget.on(SharedDefines.EVENT_TOUCH_MOVE, this.onTouchMove, this);
        this.playerController.inputComponent.eventTarget.on(SharedDefines.EVENT_TOUCH_END, this.onTouchEnd, this);
        //this.btnCropCare.node.on(Button.EventType.CLICK, this.onCare, this);
        
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
        
        this.lastDragOperationNode = null;
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

    //#region handle touch events

    private onClick(event:EventTouch): void {
        console.log("FarmSelectionWindow: onClick");
        //get world position of touch
        const worldPosition = event.getUILocation();
        if(UIHelper.isPointInUINode(worldPosition, this.btnCropCare.node) || UIHelper.isPointInUINode(worldPosition, this.btnAnimalCare.node)){
            this.onCare();
        }
        else if(UIHelper.isPointInUINode(worldPosition, this.btnCropTreat.node) || UIHelper.isPointInUINode(worldPosition, this.btnAnimalTreat.node)){
            this.onTreat();
        }
        else if(UIHelper.isPointInUINode(worldPosition, this.btnCropCleanse.node) || UIHelper.isPointInUINode(worldPosition, this.btnAnimalCleanse.node)){
            this.onCleanse();
        }
    }


    private onTouchMove(event:EventTouch): void {
        //console.log("FarmSelectionWindow: onTouchMove");
        //get world position of touch
        const worldPosition = event.getUILocation();
        if (!this.currentDragTarget && this.currentOperation === CommandType.None) {
            if (UIHelper.isPointInUINode(worldPosition, this.btnCropCare.node)) {
                this.currentOperationTargetType = OperationTargetType.Crop;
                this.currentOperation = CommandType.Care;
                this.currentDragTarget = this.btnCropCare.node;
            }
            else if (UIHelper.isPointInUINode(worldPosition, this.btnAnimalCare.node)) {
                this.currentOperationTargetType = OperationTargetType.Animal;
                this.currentOperation = CommandType.Care;
                this.currentDragTarget = this.btnAnimalCare.node;
            }
            else if (UIHelper.isPointInUINode(worldPosition, this.btnCropTreat.node)) {
                this.currentOperationTargetType = OperationTargetType.Crop;
                this.currentOperation = CommandType.Treat;
                this.currentDragTarget = this.btnCropTreat.node;
            }
            else if (UIHelper.isPointInUINode(worldPosition, this.btnAnimalTreat.node)) {
                this.currentOperationTargetType = OperationTargetType.Animal;
                this.currentOperation = CommandType.Treat;
                this.currentDragTarget = this.btnAnimalTreat.node;
            }
            else if (UIHelper.isPointInUINode(worldPosition, this.btnCropCleanse.node)) {
                this.currentOperationTargetType = OperationTargetType.Crop;
                this.currentOperation = CommandType.Cleanse;
                this.currentDragTarget = this.btnCropCleanse.node;
            }
            else if (UIHelper.isPointInUINode(worldPosition, this.btnAnimalCleanse.node)) {
                this.currentOperationTargetType = OperationTargetType.Animal;
                this.currentOperation = CommandType.Cleanse;
                this.currentDragTarget = this.btnAnimalCleanse.node;
            }
            this.lastDragOperationNode = null;
        }
        else if(this.currentDragTarget && this.currentOperation !== CommandType.None){
            //update current drag target position
            this.currentDragTarget.setPosition(new Vec3(worldPosition.x, worldPosition.y, 0));
            if(this.currentOperationTargetType === OperationTargetType.Crop){
                this.handleCropDragOperation();
            }
            else if(this.currentOperationTargetType === OperationTargetType.Animal){
               // this.handleAnimalDragOperation();
            }
        }
    }

    private onTouchEnd(event:EventTouch): void {
        console.log("FarmSelectionWindow: onTouchEnd");
        this.currentDragTarget = null;
        this.currentOperation = CommandType.None;
        this.currentOperationTargetType = OperationTargetType.None;
        this.lastDragOperationNode = null;
    }

    //#endregion

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

    private handleCropDragOperation(): void {
        console.log("FarmSelectionWindow: handleCropDragOperation");
        const pilots = this.gameController.PlayerPlotTiles;
        for(let i = 0; i < pilots.length; i++){
            const pilot = pilots[i];
            //check if currentDragTarget is in the pilot
            if(this.lastDragOperationNode !== pilot.node && UIHelper.isPointInUINodeWorldPosition(this.currentDragTarget!.worldPosition, pilot.node)){
                if(this.currentOperation === CommandType.Care){
                    this.onCare();
                }
                else if(this.currentOperation === CommandType.Treat){
                    this.onTreat();
                }
                else if(this.currentOperation === CommandType.Cleanse){
                    this.onCleanse();
                }
                this.lastDragOperationNode = pilot.node;
                break;
            }
            
        }

    }

    private onItemSelected(data:any = null): void {

        // if(this.operationSprite){
        //     this.operationSprite.spriteFrame = this.btnCropCare.node.getComponent(Sprite).spriteFrame;
        //     this.operationSprite.node.active = true;
        //     const currentPosition = this.operationSprite.node.worldPosition;
        //    // this.gameController.
        // }


       // this.callback(data);

        this.gameController.getPlayerController().currentOperation = data;
        WindowManager.instance.hide(SharedDefines.WINDOW_SELECTION_NAME);
    }


}
