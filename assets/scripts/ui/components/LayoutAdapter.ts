import { _decorator, Component, Node, UITransform, view, Vec3, Vec2, Layout, Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LayoutAdapter')
export class LayoutAdapter extends Component {

    @property(Boolean)
    private adapterWidth: boolean = true;
    @property(Boolean)
    private adapterHeight: boolean = false;

    @property(Layout)
    private _layout: Layout = null;

    public get layout(): Layout {
        if (!this._layout) {
            this._layout = this.node.getComponent(Layout);
        }
        return this._layout;
    }

    private originalContentSize: Vec3 = new Vec3();
    private currentContentSize: Vec3 = new Vec3();
    private realScale: Vec3 = new Vec3();

    protected onLoad(): void {
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            this.originalContentSize.set(uiTransform.width, uiTransform.height, 0);
            this.currentContentSize.set(uiTransform.width, uiTransform.height, 0);
        }
        this.updateRealScale();

        const widget = this.node.getComponent(Widget);
        if (widget) {
            widget.node.on(Node.EventType.SIZE_CHANGED, () => {
                this.onSizeChanged();
            });
        }
    }

    protected onSizeChanged(): void {
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            this.currentContentSize.set(uiTransform.width, uiTransform.height, 0);
        }
        this.updateRealScale();
    }

    public get RealScale(): Vec3 {
        return this.realScale;
    }

    protected updateRealScale(): void {
        console.log(`updateRealScale start .. originalContentSize: ${this.currentContentSize}`);
        const screenSize = this.currentContentSize;
        const designSize = this.originalContentSize;
        const scaleX = this.adapterWidth ? screenSize.x / designSize.x : 1;
        const scaleY = this.adapterHeight ? screenSize.y / designSize.y : 1;
        this.realScale.set(scaleX, scaleY, 1);
        //log realScale
        console.log(`realScale: ${this.realScale}`);
        
        this.updateLayoutPaddingAndSpacing();
        this.updateLayoutChildrenScale();
        this.layout.updateLayout();
    }

    protected updateLayoutPaddingAndSpacing(): void {
        this.layout.paddingLeft *= this.realScale.x;
        this.layout.paddingRight *= this.realScale.x;
        this.layout.paddingTop *= this.realScale.y;
        this.layout.paddingBottom *= this.realScale.y;
        this.layout.spacingX *= this.realScale.x;
        this.layout.spacingY *= this.realScale.y;
        //log layout padding and spacing
        console.log(`layout padding: ${this.layout.paddingLeft}, ${this.layout.paddingRight}, ${this.layout.paddingTop}, ${this.layout.paddingBottom}`);
        console.log(`layout spacing: ${this.layout.spacingX}, ${this.layout.spacingY}`);
    }

    protected updateLayoutChildrenScale(): void {
        const children = this.node.children;
        for (const child of children) {
            const childTransform = child.getComponent(UITransform);
            if (childTransform) {
                childTransform.node.setScale(this.realScale.x, this.realScale.y, this.realScale.z);
            }
        }
    }
    
}
