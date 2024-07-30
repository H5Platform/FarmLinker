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

    @property(Node)
    public cropContainer: Node | null = null;
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
    private currentSelectedPlot: PlotTile | null = null;


    public initialize(): void 
    {
        super.initialize();
        this.setupEventLisnters();
        const gameControllerNode = director.getScene()?.getChildByName('GameController');
        if (gameControllerNode) {
            this.gameController = gameControllerNode.getComponent(GameController);
        }
        this.gameController.eventTarget.on(SharedDefines.EVENT_PLOT_SELECTED, this.onPlotSelected, this);

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

    public show(): void 
    {
        super.show();
        //set crop container invisible
        this.cropContainer.active = false;
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

    private async plantCrop(cropPath: string): Promise<void> {
        if (!this.currentSelectedPlot || this.currentSelectedPlot.isOccupied) {
            console.log('No valid plot selected or plot is already occupied');
            return;
        }

        let prefab = await ResourceManager.instance.loadPrefab(cropPath);
        if (!prefab) {
            console.error(`Failed to load crop prefab: ${cropPath}`);
            return;
        }
        
        const cropNode = instantiate(prefab);
        const crop = cropNode.getComponent(Crop);
        if (!crop) {
            console.error(`Failed to get Crop component from prefab: ${cropPath}`);
            return;
        }

        this.currentSelectedPlot.node.addChild(cropNode);
        cropNode.setPosition(Vec3.ZERO);
        this.currentSelectedPlot.occupy();
        crop.startGrowing();

        this.cropContainer!.active = false;
        this.currentSelectedPlot = null;
    }

    private async onBtnCrop1Clicked(): Promise<void> 
    {
        await this.plantCrop(SharedDefines.CROP_CORN);
    }

    private async onBtnCrop2Clicked(): Promise<void> 
    {
        await this.plantCrop(SharedDefines.CROP_CARROT);
    }

    private async onBtnCrop3Clicked(): Promise<void> 
    {
        await this.plantCrop(SharedDefines.CROP_GRAPE);
    }

    private async onBtnCrop4Clicked(): Promise<void> 
    {
        await this.plantCrop(SharedDefines.CROP_CABBAGE);
    }

    //create onPlotSelected func , when plot is selected, show crop container
    private onPlotSelected(plot: PlotTile): void 
    {
        if (plot.isOccupied) 
            return;
        this.cropContainer!.active = true;
        this.currentSelectedPlot = plot;
    }
}


