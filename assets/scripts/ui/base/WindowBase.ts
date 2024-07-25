import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WindowBase')
export class WindowBase extends Component {
    public initialize(): void { }

    public show(): void {
        this.node.active = true;
    }

    public hide(): void {
        this.node.active = false;
    }
}
