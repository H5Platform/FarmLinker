import { _decorator, Node, Button } from 'cc';
import { WindowBase } from '../base/WindowBase';

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

    public show(): void {
        super.show();
        console.log('MainWindow shown');
    }

    public onHide(): void {
        super.onHide();
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
        console.log('Start button clicked');
        // Add your start game logic here
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this.btnStart) {
            this.btnStart.node.off(Button.EventType.CLICK, this.onStartButtonClicked, this);
        }
    }
}