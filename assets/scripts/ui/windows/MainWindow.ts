import { _decorator, Node, Button } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { WindowManager } from '../WindowManager';

const { ccclass, property } = _decorator;

@ccclass('MainWindow')
export class MainWindow extends WindowBase {
    @property(Button)
    private btnStart: Button | null = null;

    public initialize(): void {
        super.initialize();
        this.setupEventListeners();
        console.log('MainWindow initialized');
    }

    public show(...args: any[]): void {
        super.show(...args);
        console.log('MainWindow shown');
    }

    public hide(): void {
        super.hide();
        console.log('MainWindow hidden');
    }

    private setupEventListeners(): void {
        if (this.btnStart) {
            this.btnStart.node.on(Button.EventType.CLICK, this.onStartButtonClicked, this);
        } else {
            console.warn('Start button not found in MainWindow');
        }
    }

    private onStartButtonClicked(): void {
        // Add your start game logic here
        WindowManager.instance.show("GameWindow");
        this.hide();
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.btnStart) {
            this.btnStart.node.off(Button.EventType.CLICK, this.onStartButtonClicked, this);
        }
    }
}