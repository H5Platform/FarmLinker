import { _decorator, Component, Node } from 'cc';
import { WindowManager } from './ui/WindowManager';

const { ccclass, property } = _decorator;

@ccclass('GameEntry')
export class GameEntry extends Component {
    start() {
        this.initializeManagers();
        this.showMainWindow();
    }

    private initializeManagers(): void {
        WindowManager.instance.initialize();
    }

    private async showMainWindow(): Promise<void> {
        try {
            await WindowManager.instance.show('MainWindow');
            console.log('MainWindow shown successfully');
        } catch (error) {
            console.error('Failed to show MainWindow:', error);
        }
    }
}
