import { _decorator, Button, Component, Node, ScrollView, instantiate, Label, Sprite, SpriteFrame } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { BuildingManager } from '../../managers/BuildingManager';
import { SyntheDataManager } from '../../managers/SyntheDataManager';
import { InventoryComponent, InventoryItem } from '../../components/InventoryComponent';
import { ResourceManager } from '../../managers/ResourceManager';
import { NetworkSyntheResultData, SharedDefines, SyntheState } from '../../misc/SharedDefines';
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
        //log all syntheDatas & sceneSyntheDataList
        console.log(`syntheDatas:`,syntheDatas);
        console.log(`sceneSyntheDataList:`,sceneSyntheDataList);
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

        const syntheData = SyntheDataManager.instance.findSyntheDataById(item.syntheid);
        if (!syntheData) {
            console.error(`Synthe data not found for id: ${item.syntheid}`);
            return itemNode;
        }

        this.setupTargetItem(itemNode, syntheData);
        this.setupSourceItems(itemNode, syntheData);
        this.setupInProgressStatus(itemNode, item);
        this.setupItemButtons(itemNode, syntheData,item.state);
        return itemNode;
    }

    private setupInProgressStatus(itemNode: Node, item: NetworkSyntheResultData): void {
        itemNode.name = item.id;
        const txtRemainingTime = itemNode.getChildByName('txtRemainingTime').getComponent(Label);
        const btnSynthesisEnd = itemNode.getChildByName('btnSynthesisEnd').getComponent(Button);

        txtRemainingTime.node.active = true;
        const endTime = new Date(item.endTime);
        const remainingTime = Math.max(0, (endTime.getTime() - Date.now()) / 1000);
        console.log(`setupInProgressStatus:remainingTime:${remainingTime}`);
        this.updateRemainingTime(txtRemainingTime,btnSynthesisEnd, remainingTime);
    }

    private populateAvailableItems(syntheDatas: any[],sceneSyntheDataList: NetworkSyntheResultData[]): void {
        const availableSyntheDatas = this.filterAvailableSyntheDatas(syntheDatas,sceneSyntheDataList);
        //log all availableSyntheDatas
        console.log(`availableSyntheDatas:`,availableSyntheDatas);
        availableSyntheDatas.forEach(data => {
            const itemNode = this.createAvailableItemNode(data);
            this.scrollView.content.addChild(itemNode);
        });
    }

    private filterAvailableSyntheDatas(syntheDatas: any[],sceneSyntheDataList: NetworkSyntheResultData[]): any[] {
        const inProgressIds = new Set(sceneSyntheDataList.map(item => item.syntheid));
        return syntheDatas.filter(data => !inProgressIds.has(data.id));
    }

    private createAvailableItemNode(data: any): Node {
        const itemNode = instantiate(this.itemTemplate);
        itemNode.active = true;

        this.setupTargetItem(itemNode, data);
        this.setupSourceItems(itemNode, data);
        this.setupItemButtons(itemNode, data);

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

    private setupItemButtons(itemNode: Node, data: any,state:SyntheState = SyntheState.None): void {
        
        const btnStart = itemNode.getChildByName('btnStart').getComponent(Button);
        const btnSynthesisEnd = itemNode.getChildByName('btnSynthesisEnd').getComponent(Button);
        const hasEnoughItems = this.checkInventory(data);
        btnStart.node.active = hasEnoughItems && state != SyntheState.Complete;
        btnStart.node.on(Button.EventType.CLICK, ()=>{this.onBtnStartClick(data, itemNode)} );
        btnSynthesisEnd.node.active = state == SyntheState.InProgress;
        btnSynthesisEnd.node.on(Button.EventType.CLICK, ()=>{this.onBtnSynthesisEndClick(data,itemNode)} );
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

    private startSynthesisTimer(totalTime: number, txtRemainingTime: Label, btnSynthesisEnd: Button, onComplete: () => void): void {
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
                btnSynthesisEnd.node.active = true;
            }
        };

        // Update immediately and then every minute
        updateTimer();
        this.schedule(updateTimer, 60);
    }

    private async onBtnStartClick( data: any, itemNode: Node ): Promise<void> {
        // Handle button click event
        console.log(`Crafting ${data.name} with formula ${data.formula_1} , itemNode name: ${itemNode.name}`);
        const txtRemainingTime = itemNode.getChildByName('txtRemainingTime').getComponent(Label);
        const btnSynthesisEnd = itemNode.getChildByName('btnSynthesisEnd').getComponent(Button);
        const btnStart = itemNode.getChildByName('btnStart').getComponent(Button);
        console.log(`data.time_min:`,data.time_min);
        this.updateRemainingTime(txtRemainingTime,btnStart,data.time_min * SharedDefines.TIME_MINUTE);
        btnStart.node.active = false;
        btnSynthesisEnd.node.active = false;
        txtRemainingTime.node.active = true;
        txtRemainingTime.string = `剩余${data.time_min}分钟`;

        const result = await NetworkManager.instance.syntheStart(data.id,this.currentBuilding.SceneItem.id);
        if(result && result.success){
            console.log(`Synthesis start success`);
            const sceneSyntheData = result.data;
            itemNode.name = sceneSyntheData.id;
            data.formula_1.forEach((source, index) => {
                
                const item = this.inventoryComponent.getItem(source);
                if (item) {
                    this.inventoryComponent.removeItem(item.id);
                }
            });

        }else{
            console.log(`Synthesis start failed`);
        }
    }

    private async onBtnSynthesisEndClick( data: any,itemNode:Node): Promise<void> {
        console.log(`Synthesis completed after ${data.time_min} minutes`);
        const result = await NetworkManager.instance.syntheEnd(this.currentBuilding.SceneItem.id,itemNode.name);
        if(result && result.success){
            console.log(`Synthesis end success`);
            const syntheData = SyntheDataManager.instance.findSyntheDataById(result.data.syntheid);
            const syntheItem = ItemDataManager.instance.getItemById(syntheData.synthe_item_id);
            const inventoryItem = new InventoryItem(syntheItem,1);
            this.inventoryComponent.addItem(inventoryItem);
            this.refreshData();
        }
        else{
            console.log(`Synthesis end failed`);
        }
    }

    private onBtnUpgradeClick(event: Event): void {
        console.log('Upgrade button clicked');
    }

    private onBtnCloseClick(event: Event): void {
        WindowManager.instance.hide(SharedDefines.WINDOW_FARM_FACTORY_NAME);
    }

    private updateRemainingTime(label: Label,btnSynthesisEnd:Button, remainingSeconds: number): void {
        const minutes = Math.floor(remainingSeconds / 60);
        label.string = `剩余${minutes}分钟`;

        if (remainingSeconds > 0) {
            this.scheduleOnce(() => {
                this.updateRemainingTime(label,btnSynthesisEnd, remainingSeconds - 60);
            }, 60);
        } else {
            label.node.active = false;
            btnSynthesisEnd.node.active = true;
            // 可能需要刷新数据或更新UI
            //this.refreshData();
        }
    }

    private refreshData(): void {
        // 重新获取数据并更新UI
        this.getSceneSyntheDataListFromServer(this.currentBuilding.SceneItem.id, this.currentBuilding.id);
    }
}

