import { _decorator, Component, Node, director, Button, instantiate } from 'cc';
const { ccclass, property } = _decorator;
import { ResourceManager } from '../../managers/ResourceManager';
import { SharedDefines } from '../../misc/SharedDefines';
import { WindowBase } from '../base/WindowBase';
import { GameController } from '../../controllers/GameController';

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
    
    private gameController: GameController | null = null;


    public initialize(): void 
    {
        super.initialize();
        this.setupEventLisnters();
        const gameControllerNode = director.getScene()?.getChildByName('GameController');
        if (gameControllerNode) {
            this.gameController = gameControllerNode.getComponent(GameController);
        }
    }

    public show(): void 
    {
        super.show();
        this.gameController?.setGameViewVisibility(true);
    }

    public hide(): void 
    {
        super.hide();
    }

    // update(deltaTime: number) {
        
    // }

    private setupEventLisnters(): void 
    {
        this.btnCrop1?.node.on(Button.EventType.CLICK, this.onBtnCrop1Clicked, this);
        this.btnCrop2?.node.on(Button.EventType.CLICK, this.onBtnCrop2Clicked, this);
        this.btnCrop3?.node.on(Button.EventType.CLICK, this.onBtnCrop3Clicked, this);
        this.btnCrop4?.node.on(Button.EventType.CLICK, this.onBtnCrop4Clicked, this);
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
        this.node.addChild(corn);
        corn.setWorldPosition(this.btnCrop1.node.worldPosition);
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
        this.node.addChild(carrot);
        carrot.setWorldPosition(this.btnCrop2.node.worldPosition);
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
        this.node.addChild(grape);
        grape.setWorldPosition(this.btnCrop3.node.worldPosition);
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
        this.node.addChild(cabbage);
        cabbage.setWorldPosition(this.btnCrop4.node.worldPosition);
    }
}


