import { _decorator, Component, Node, Label, Tween, tween, Vec3, UIOpacity } from 'cc';
import { WindowBase } from '../base/WindowBase';
import { SharedDefines } from '../../misc/SharedDefines';

const { ccclass, property } = _decorator;

@ccclass('ToastWindow')
export class ToastWindow extends WindowBase {
    @property(Label)
    private txtToast: Label | null = null;

    @property(Node)
    private layoutNode: Node | null = null;

    private currentTween: Tween<Node> | null = null;

    public initialize(): void {
        super.initialize();
    }

    public show(...args: any[]): void {
        super.show(...args);

        if (args.length > 0 && typeof args[0] === 'string') {
            this.showToast(args[0]);
        }
    }

    private showToast(message: string): void {
        if (this.txtToast) {
            this.txtToast.string = message;
        }

        if (this.currentTween) {
            this.currentTween.stop();
        }

        this.layoutNode!.active = true;
        const uiOpacity = this.layoutNode!.getComponent(UIOpacity) || this.layoutNode!.addComponent(UIOpacity);
        uiOpacity.opacity = 0;

        this.currentTween = tween(this.layoutNode)
            .to(0.3, { scale: new Vec3(1, 1, 1) })
            .call(() => {
                tween(uiOpacity)
                    .to(0.3, { opacity: 255 })
                    .delay(2)
                    .to(0.3, { opacity: 0 })
                    .call(() => {
                        this.layoutNode!.active = false;
                    })
                    .start();
            })
            .start();
    }

    public hide(): void {
        if (this.currentTween) {
            this.currentTween.stop();
        }
        this.layoutNode!.active = false;
        super.hide();
    }
}