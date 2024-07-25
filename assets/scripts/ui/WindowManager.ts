import { _decorator, Component, Node, Prefab, instantiate,Sprite } from 'cc';
import { ResourceManager } from '../managers/ResourceManager';
import { WindowBase } from './base/WindowBase';
const { ccclass, property } = _decorator;

@ccclass('WindowManager')
export class WindowManager extends Component {
    private static _instance: WindowManager | null = null;
    private windowMap: Map<string, WindowBase> = new Map();

    @property(Node)
    private windowsContainer: Node | null = null;

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

    public async show(name: string): Promise<void> {
        let windowBase = this.windowMap.get(name);

        if (!windowBase) {
            // Load the prefab
            const prefabPath = `ui/windows/${name}`;
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
            windowBase.initialize();

            // Store the window node in the map
            this.windowMap.set(name, windowBase);
        }

        // Show the window
        windowBase.show();
         // Ensure the window is on top
         windowBase.node.setSiblingIndex(windowBase.node.parent!.children.length - 1);
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
