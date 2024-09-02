import { _decorator, Button, Component, Node, ScrollView, instantiate, Label, Sprite, SpriteFrame } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { BuildingManager } from '../../managers/BuildingManager';
import { SyntheDataManager } from '../../managers/SyntheDataManager';
import { InventoryComponent } from '../../components/InventoryComponent';
import { ResourceManager } from '../../managers/ResourceManager';
import { NetworkSyntheResultData, SharedDefines } from '../../misc/SharedDefines';
import { WindowManager } from '../WindowManager';
import { ItemDataManager } from '../../managers/ItemDataManager';
import { NetworkManager } from '../../managers/NetworkManager';
import { Building } from '../../entities/Building';
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

    private currentBuilding: Building = null;
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
        this.currentBuilding = args[0] as Building;
        console.log(`FarmFactoryWindow show buildingId: ${this.currentBuilding.id}`);
        
        this.getSceneSyntheDataListFromServer(this.currentBuilding.SceneItem.id, this.currentBuilding.id);
    }

    private async getSceneSyntheDataListFromServer(sceneId:string,buildingId:string): Promise<void>{
        const result = await NetworkManager.instance.querySceneSyntheList(sceneId);
        if(result && result.success){
            const sceneSyntheDataList = result.data;
            const syntheDatas = SyntheDataManager.instance.filterSyntheDataByBuild(buildingId);
            this.updateScrollView(sceneSyntheDataList,syntheDatas);
        }
    }

    private updateScrollView(sceneSyntheDataList: NetworkSyntheResultData[],syntheDatas: any[]): void {
        this.clearScrollViewContent();
        this.populateInProgressItems(sceneSyntheDataList);
        this.populateAvailableItems(syntheDatas,sceneSyntheDataList);
    }

    private clearScrollViewContent(): void {
        const content = this.scrollView.content;
        if (content) {
            content.children.forEach(child => {
                if (child !== this.itemTemplate) {
                    child.destroy();
                }
            });
        }
    }

    private populateInProgressItems(sceneSyntheDataList: NetworkSyntheResultData[]): void {
        sceneSyntheDataList.forEach(item => {
            const itemNode = this.createInProgressItemNode(item);
            this.scrollView.content.addChild(itemNode);
        });
    }

    private createInProgressItemNode(item: NetworkSyntheResultData): Node {
        const itemNode = instantiate(this.itemTemplate);
        itemNode.active = true;

        const syntheData = SyntheDataManager.instance.findSyntheDataById(item.synthe_id);
        if (!syntheData) {
            console.error(`Synthe data not found for id: ${item.synthe_id}`);
            return itemNode;
        }

        this.setupTargetItem(itemNode, syntheData);
        this.setupInProgressStatus(itemNode, item);

        return itemNode;
    }

    private setupInProgressStatus(itemNode: Node, item: NetworkSyntheResultData): void {
        const txtRemainingTime = itemNode.getChildByName('txtRemainingTime').getComponent(Label);
        const btnStart = itemNode.getChildByName('btnStart').getComponent(Button);

        txtRemainingTime.node.active = true;
        btnStart.node.active = false;

        const endTime = new Date(item.end_time);
        const remainingTime = Math.max(0, (endTime.getTime() - Date.now()) / 1000);
        this.updateRemainingTime(txtRemainingTime, remainingTime);
    }

    private populateAvailableItems(syntheDatas: any[],sceneSyntheDataList: NetworkSyntheResultData[]): void {
        const availableSyntheDatas = this.filterAvailableSyntheDatas(syntheDatas,sceneSyntheDataList);
        availableSyntheDatas.forEach(data => {
            const itemNode = this.createAvailableItemNode(data);
            this.scrollView.content.addChild(itemNode);
        });
    }

    private filterAvailableSyntheDatas(syntheDatas: any[],sceneSyntheDataList: NetworkSyntheResultData[]): any[] {
        const inProgressIds = new Set(sceneSyntheDataList.map(item => item.synthe_id));
        return syntheDatas.filter(data => !inProgressIds.has(data.id));
    }

    private createAvailableItemNode(data: any): Node {
        const itemNode = instantiate(this.itemTemplate);
        itemNode.active = true;

        this.setupTargetItem(itemNode, data);
        this.setupSourceItems(itemNode, data);
        this.setupStartButton(itemNode, data);

        return itemNode;
    }

    private setupTargetItem(itemNode: Node, data: any): void {
        const sprTarget = itemNode.getChildByName('sprTarget').getComponent(Sprite);
        const txtTargetName = itemNode.getChildByName('txtTargetName').getComponent(Label);
        const txtRemainingTime = itemNode.getChildByName('txtRemainingTime').getComponent(Label);

        const targetItem = ItemDataManager.instance.getItemById(data.synthe_item_id);

        txtRemainingTime.node.active = false;
        this.loadTargetSprite(sprTarget, targetItem);
        txtTargetName.string = data.description;
    }

    private loadTargetSprite(sprTarget: Sprite, targetItem: any): void {
        ResourceManager.instance.loadAsset<SpriteFrame>(`${SharedDefines.WINDOW_SHOP_TEXTURES}${targetItem.png}/spriteFrame`, SpriteFrame)
            .then(spriteFrame => {
                if (spriteFrame) {
                    sprTarget.spriteFrame = spriteFrame;
                }
            });
    }

    private setupSourceItems(itemNode: Node, data: any): void {
        const formulas = data.formula_1;
        const qualities = data.quality;
        const sources = [
            itemNode.getChildByName('source'),
            itemNode.getChildByName('source2'),
            itemNode.getChildByName('source3')
        ];
        const plusSprites = [
            itemNode.getChildByName('sprPlus').getComponent(Sprite),
            itemNode.getChildByName('sprPlus2').getComponent(Sprite)
        ];

        formulas.forEach((formula, index) => {
            if (index < sources.length) {
                this.setSourceData(sources[index], formula, qualities[index]);
                sources[index].active = true;
                if (index > 0 && index - 1 < plusSprites.length) {
                    plusSprites[index - 1].node.active = true;
                }
            }
        });

        // Hide unused sources and plus sprites
        for (let i = formulas.length; i < sources.length; i++) {
            sources[i].active = false;
            if (i > 0 && i - 1 < plusSprites.length) {
                plusSprites[i - 1].node.active = false;
            }
        }
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

    private setupStartButton(itemNode: Node, data: any): void {
        const btnStart = itemNode.getChildByName('btnStart').getComponent(Button);
        const canCraft = this.checkInventory(data);
        btnStart.node.active = canCraft;
        btnStart.node.on(Button.EventType.CLICK, this.onBtnStartClick.bind(this, btnStart, data));
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

    private updateRemainingTime(label: Label, remainingSeconds: number): void {
        const minutes = Math.floor(remainingSeconds / 60);
        label.string = `剩余${minutes}分钟`;

        if (remainingSeconds > 0) {
            this.scheduleOnce(() => {
                this.updateRemainingTime(label, remainingSeconds - 60);
            }, 60);
        } else {
            label.node.active = false;
            // 可能需要刷新数据或更新UI
            this.refreshData();
        }
    }

    private refreshData(): void {
        // 重新获取数据并更新UI
        this.getSceneSyntheDataListFromServer(this.currentBuilding.SceneItem.id, this.currentBuilding.id);
    }
}


