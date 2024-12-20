import { _decorator, Component, Node, Prefab, instantiate,Sprite, Camera } from 'cc';
import { ResourceManager } from '../managers/ResourceManager';
import { WindowBase } from './base/WindowBase';
const { ccclass, property } = _decorator;

//define enum for screen orientation
export enum WindowOrientation {
    PORTRAIT = "portrait",
    LANDSCAPE = "landscape"
}

@ccclass('WindowManager')
export class WindowManager extends Component {
    @property(Camera)
    private camera: Camera | null = null;
    //getter camera
    public get uiCamera(): Camera | null {
        return this.camera;
    }
    private currentOrientation: WindowOrientation = WindowOrientation.LANDSCAPE;

    private static _instance: WindowManager | null = null;


    private windowMap: Map<string, WindowBase> = new Map();

    @property(Node)
    private windowsContainer: Node | null = null;

    private isLoadingWindow: boolean = false;

    protected onLoad(): void {
        WindowManager._instance = this;
    }

    public static get instance(): WindowManager {
        if (this._instance === null) {
            const node = new Node('WindowManager');
            this._instance = node.addComponent(WindowManager);
        }
        return this._instance;
    }

    public initialize(): void {
        if (!this.windowsContainer) {
            console.warn('Windows container is not set. Please assign it in the editor.');
        }
    }

    public async show(name: string,...args: any[]): Promise<void> {
        if(this.isLoadingWindow){
            return;
        }
        try
        {
            this.isLoadingWindow = true;
            let windowBase = this.windowMap.get(name);
    
            if (!windowBase) {
                const orientationStr = this.currentOrientation === WindowOrientation.LANDSCAPE ? "landscape" : "portrait";
                // Load the prefab
                const prefabPath = `ui/windows/${orientationStr}/${name}`;
                const prefab = await ResourceManager.instance.loadPrefab(prefabPath);
                if (!prefab) {
                    console.error(`Failed to load prefab: ${name}`);
                    return;
                }
    
                // Instantiate the prefab
                const windowNode = instantiate(prefab);
                if (!this.windowsContainer) {
                    console.error('Windows container is not set');
                    return;
                }
                this.windowsContainer.addChild(windowNode);
    
                // Get WindowBase component
                windowBase = windowNode.getComponent(WindowBase);
                if (!windowBase) {
                    console.error(`WindowBase component not found on prefab: ${name}`);
                    return;
                }
                // Initialize the window
                windowBase.initialize(this.currentOrientation);
    
                // Store the window node in the map
                this.windowMap.set(name, windowBase);
            }
    
            // Show the window
            windowBase.show(...args);
             // Ensure the window is on top
             windowBase.node.setSiblingIndex(windowBase.node.parent!.children.length - 1);
        }
        finally
        {
            this.isLoadingWindow = false;
        }
    }

    //get window by name
    public getWindow(name: string): WindowBase | null {
        //check if window is already loaded
        let windowBase = this.windowMap.get(name);
        if (!windowBase) {
            console.warn(`Window not found: ${name}`);
            return null;
        }
        return windowBase;
    }

    public changeWindowOrientation(isLandscape: boolean): void {
        //暂不处理运行时 切换横竖屏
         this.currentOrientation = isLandscape ? WindowOrientation.LANDSCAPE : WindowOrientation.PORTRAIT;
        // this.windowMap.forEach((window) => {
        //     window.WindowOrientation = this.currentOrientation;
        // });
    }

    public hide(name: string): void {
        const windowBase = this.windowMap.get(name);
        if (windowBase) {
            windowBase.hide();
        } else {
            console.warn(`Window not found: ${name}`);
        }
    }
}
