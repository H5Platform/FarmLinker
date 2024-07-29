import { _decorator, Component, Node, director, Button, instantiate,Vec3, UITransform, Prefab } from 'cc';
const { ccclass, property } = _decorator;
import { ResourceManager } from '../../managers/ResourceManager';
import { SharedDefines } from '../../misc/SharedDefines';
import { WindowBase } from '../base/WindowBase';
import { GameController } from '../../controllers/GameController';
import { PlotTile } from '../../entities/PlotTile';
import { Crop } from '../../entities/Crop';
import { DragDropComponent } from '../../components/DragDropComponent';

@ccclass('GameWindow')
export class GameWindow extends WindowBase {

    @property(Button)
    public btnCrop1: Button | null = null;
    @property(Button)
    public btnCrop2: Button | null = null;
    @property(Button)
    public btnCrop3: Button | null = null;
    @property(Button)
    public btnCrop4: Button | null = null;

    

    @property(Node)
    public dragContainer: Node | null = null;
    
    private gameController: GameController | null = null;
    private plotContainer: Node | null = null;
    private dragDropComponent: DragDropComponent | null = null;
    private plots: PlotTile[] = [];


    public initialize(): void 
    {
        super.initialize();
        this.setupEventLisnters();
        const gameControllerNode = director.getScene()?.getChildByName('GameController');
        if (gameControllerNode) {
            this.gameController = gameControllerNode.getComponent(GameController);
        }

        //this.initializeDragDropComponent();
        this.initializePlots();
    }

    private initializePlots(): void {
        this.plotContainer = director.getScene()?.getChildByPath('Canvas/Gameplay/Plots');
        if (this.plotContainer) {
            this.plots = this.plotContainer.getComponentsInChildren(PlotTile);
            this.plots.forEach(plot => {
                this.dragDropComponent?.registerDropZone(plot);
            });
        }
        else 
        {
            console.error('Failed to find plot container');
            return;
        }
    }

    private initializeDragDropComponent(): void {
        this.dragDropComponent = this.getComponent(DragDropComponent);
        if (!this.dragDropComponent) {
            this.dragDropComponent = this.addComponent(DragDropComponent);
        }
        this.dragDropComponent.dragContainer = this.dragContainer;
    }

    public show(): void 
    {
        super.show();
        this.gameController?.startGame();
    }

    public hide(): void 
    {
        super.hide();
    }

    // update(deltaTime: number) {
        
    // }

    protected onDestroy(): void {
        super.onDestroy();
        this.btnCrop1?.node.off(Button.EventType.CLICK, this.onBtnCrop1Clicked, this);
        this.btnCrop2?.node.off(Button.EventType.CLICK, this.onBtnCrop2Clicked, this);
        this.btnCrop3?.node.off(Button.EventType.CLICK, this.onBtnCrop3Clicked, this);
        this.btnCrop4?.node.off(Button.EventType.CLICK, this.onBtnCrop4Clicked, this);
        
        this.plots.forEach(plot => {
            this.dragDropComponent?.unregisterDropZone(plot);
        });
    }

    private setupEventLisnters(): void 
    {
        this.btnCrop1?.node.on(Button.EventType.CLICK, this.onBtnCrop1Clicked, this);
        this.btnCrop2?.node.on(Button.EventType.CLICK, this.onBtnCrop2Clicked, this);
        this.btnCrop3?.node.on(Button.EventType.CLICK, this.onBtnCrop3Clicked, this);
        this.btnCrop4?.node.on(Button.EventType.CLICK, this.onBtnCrop4Clicked, this);
    }

    private startDragging(crop: Node) {
        this.dragContainer?.addChild(crop);
        const cropComponent = crop.getComponent(Crop);
        if (cropComponent && this.dragDropComponent) {
            this.dragDropComponent.startDragging(cropComponent, crop);
        }
    }

    private async onBtnCrop1Clicked(): Promise<void> 
    {
        console.log('onBtnCrop1Clicked');
        const cornPrefab = await ResourceManager.instance.loadPrefab(SharedDefines.CROP_CORN);
        if (!cornPrefab) 
        {
            console.error('Failed to load corn prefab');
            return;
        }
        const corn = instantiate(cornPrefab);
        this.startDragging(corn);
    }

    private async onBtnCrop2Clicked(): Promise<void> 
    {
        //same as onBtnCrop1Clicked logic but instead of corn use carrot
        console.log('onBtnCrop2Clicked');
        const carrotPrefab = await ResourceManager.instance.loadPrefab(SharedDefines.CROP_CARROT);
        if (!carrotPrefab) 
        {
            console.error('Failed to load carrot prefab');
            return;
        }
        const carrot = instantiate(carrotPrefab);
        this.startDragging(carrot);
    }

    private async onBtnCrop3Clicked(): Promise<void> 
    {
        //same as onBtnCrop1Clicked logic but instead of corn use grape
        console.log('onBtnCrop3Clicked');
        const grapePrefab = await ResourceManager.instance.loadPrefab(SharedDefines.CROP_GRAPE);
        if (!grapePrefab) 
        {
            console.error('Failed to load grape prefab');
            return;
        }
        const grape = instantiate(grapePrefab);
        this.startDragging(grape);
    }

    private async onBtnCrop4Clicked(): Promise<void> 
    {
        //same as onBtnCrop1Clicked logic but instead of corn use cabbage
        console.log('onBtnCrop4Clicked');
        const cabbagePrefab = await ResourceManager.instance.loadPrefab(SharedDefines.CROP_CABBAGE);
        if (!cabbagePrefab) 
        {
            console.error('Failed to load cabbage prefab');
            return;
        }
        const cabbage = instantiate(cabbagePrefab);
        this.startDragging(cabbage);
    }
}


