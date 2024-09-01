import { _decorator, Button, Component, Node, ScrollView, instantiate, Label, Sprite, SpriteFrame } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { BuildingManager } from '../../managers/BuildingManager';
import { SyntheDataManager } from '../../managers/SyntheDataManager';
import { InventoryComponent } from '../../components/InventoryComponent';
import { ResourceManager } from '../../managers/ResourceManager';
import { SharedDefines } from '../../misc/SharedDefines';
import { WindowManager } from '../WindowManager';
import { ItemDataManager } from '../../managers/ItemDataManager';
const { ccclass, property } = _decorator;

@ccclass('FarmFactoryWindow')
export class FarmFactoryWindow extends WindowBase {

    //define a item node
    @property(Node)
    private itemTemplate: Node = null;

    //btnClose
    @property(Button)
    private btnClose: Button = null;
    //btnUpgrade
    @property(Button)
    private btnUpgrade: Button = null;

    @property(ScrollView)
    private scrollView: ScrollView = null;

    private syntheDatas: any[] = [];
    private inventoryComponent: InventoryComponent = null;

    //override
    public initialize(): void {
        super.initialize();
        this.btnClose.node.on(Button.EventType.CLICK, this.onBtnCloseClick, this);
        this.btnUpgrade.node.on(Button.EventType.CLICK, this.onBtnUpgradeClick, this);

        this.itemTemplate.active = false;
        this.inventoryComponent = this.gameController.getPlayerController().inventoryComponent;
    }

    //override
    public show(...args: any[]): void {
        super.show(...args);
        const buildingId = args[0];
        console.log(`FarmFactoryWindow show buildingId: ${buildingId}`);
        this.syntheDatas = SyntheDataManager.instance.filterSyntheDataByBuild(buildingId);
        this.updateScrollView();
    }

    private updateScrollView(): void {
        //
        const content = this.scrollView.content;
        if (content) {
            content.children.forEach(child => {
                if (child !== this.itemTemplate) {
                    child.destroy();
                }
            });
        }
        console.log(`syntheDatas: ${this.syntheDatas.length}`);
        this.syntheDatas.forEach(data => {
            const itemNode = instantiate(this.itemTemplate);
            itemNode.active = true;

            const sprTarget = itemNode.getChildByName('sprTarget').getComponent(Sprite);
            const txtTargetName = itemNode.getChildByName('txtTargetName').getComponent(Label);
            //txtRemainingTime
            const txtRemainingTime = itemNode.getChildByName('txtRemainingTime').getComponent(Label);
            const source1 = itemNode.getChildByName('source');
            const source2 = itemNode.getChildByName('source2');
            const source3 = itemNode.getChildByName('source3');
            const sprPlus = itemNode.getChildByName('sprPlus').getComponent(Sprite);
            const sprPlus2 = itemNode.getChildByName('sprPlus2').getComponent(Sprite);

            const btnStart = itemNode.getChildByName('btnStart').getComponent(Button);

            const targetItem = ItemDataManager.instance.getItemById(data.synthe_item_id);

            //inactive txtRemainingTime
            txtRemainingTime.node.active = false;
            // Set target sprite and name
            ResourceManager.instance.loadAsset<SpriteFrame>(`${SharedDefines.WINDOW_SHOP_TEXTURES}${targetItem.png}/spriteFrame`, SpriteFrame)
                .then(spriteFrame => {
                    if (spriteFrame) {
                        sprTarget.spriteFrame = spriteFrame;
                    }
                });
            txtTargetName.string = data.description;
            // Set source sprites and names
            const formulas = data.formula_1;
            console.log(`formulas: ${formulas}`);
            const qualities = data.quality;
            console.log(`qualities: ${qualities}`);
            this.setSourceData(source1, formulas[0], qualities[0]);
            if (formulas.length > 1) {
                this.setSourceData(source2, formulas[1], qualities[1]);
                //active sprPlus
                sprPlus.node.active = true;
            }
            else{
                sprPlus.node.active = false;
                source2.active = false;
            }
            if (formulas.length > 2) {
                this.setSourceData(source3, formulas[2], qualities[2]);
                //active sprPlus2
                sprPlus2.node.active = true;
            }
            else{
                sprPlus2.node.active = false;
                source3.active = false;
            }
            // Check inventory and set button state
            const canCraft = this.checkInventory(data);
            btnStart.node.active = canCraft;
            btnStart.node.on(Button.EventType.CLICK, this.onBtnStartClick.bind(this, btnStart, data));
            console.log(`itemNode: ${itemNode.name}`);
            this.scrollView.content.addChild(itemNode);
        });
    }

    private setSourceData(sourceNode: Node, sourceItemId: any, quality: any): void {
        const txtName = sourceNode.getChildByName('txtName').getComponent(Label);
        const sourceSprite = sourceNode.getComponent(Sprite);
        const item = ItemDataManager.instance.getItemById(sourceItemId);
        txtName.string = `${item.description}x${quality}`;
        ResourceManager.instance.loadAsset<SpriteFrame>(`${SharedDefines.WINDOW_SHOP_TEXTURES}${item.png}/spriteFrame`, SpriteFrame)
            .then(spriteFrame => {
                if (spriteFrame) {
                    sourceSprite.spriteFrame = spriteFrame;
                }
            });
    }

    private checkInventory(data: any): boolean {
        const inventoryItems = this.inventoryComponent.getAllItems();
        //log all inventory items
        console.log(`inventoryItems:`,inventoryItems);
        const formulas = data.formula_1;
        const qualities = data.quality;
        return formulas.every((source, index) => {
            
            const item = inventoryItems.find(item => item.id === source);
            return item && item.quantity >= parseInt(qualities[index]);
        });
    }

    private startSynthesisTimer(totalTime: number, txtRemainingTime: Label, btnStart: Button, onComplete: () => void): void {
        let remainingTime = totalTime;
        
        const updateTimer = () => {
            if (remainingTime > 0) {
                remainingTime -= 1;
                const minutes = Math.floor(remainingTime / 60);
                txtRemainingTime.string = `剩余${minutes}分钟`;
            } else {
                this.unschedule(updateTimer);
                onComplete();
                txtRemainingTime.node.active = false;
                btnStart.node.active = true;
            }
        };

        // Update immediately and then every minute
        updateTimer();
        this.schedule(updateTimer, 60);
    }

    private onBtnStartClick(event: Event, data: any, btnStart: Button ): void {
        // Handle button click event
        console.log(`Crafting ${data.name} with formula ${data.formula_1}`);
        const txtRemainingTime = btnStart.node.parent.getChildByName('txtRemainingTime').getComponent(Label);
        this.startSynthesisTimer(data.time_min * SharedDefines.TIME_MINUTE,txtRemainingTime,btnStart, () => {
            console.log(`Synthesis completed after ${data.time_min} minutes`);
        });
        btnStart.node.active = false;
        txtRemainingTime.node.active = true;
        txtRemainingTime.string = `剩余${data.time_min}分钟`;
    }

    private onBtnUpgradeClick(event: Event): void {
        console.log('Upgrade button clicked');
    }

    private onBtnCloseClick(event: Event): void {
        WindowManager.instance.hide(SharedDefines.WINDOW_FARM_FACTORY_NAME);
    }
}


