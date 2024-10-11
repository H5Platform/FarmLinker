import { _decorator, Component, Node, UITransform, view, Vec3, Vec2, Layout, Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LayoutAdapter')
export class LayoutAdapter extends Component {

    @property(Number)
    public designWidth: number = 1920;
    @property(Number)
    public designHeight: number = 1080;

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

    //define padding and spacing
    private paddingLeft: number = 0;
    private paddingRight: number = 0;
    private paddingTop: number = 0;
    private paddingBottom: number = 0;
    private spacingX: number = 0;
    private spacingY: number = 0;

    private originalContentSize: Vec3 = new Vec3();
    private currentContentSize: Vec3 = new Vec3();
    private realScale: Vec3 = new Vec3();

    protected onLoad(): void {
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            // this.originalContentSize.set(uiTransform.width, uiTransform.height, 0);
            // this.currentContentSize.set(uiTransform.width, uiTransform.height, 0);
            this.originalContentSize.set(this.designWidth, this.designHeight, 0);
            this.currentContentSize.set(this.designWidth, uiTransform.height, 0);
        }

        this.paddingLeft = this.layout.paddingLeft;
        this.paddingRight = this.layout.paddingRight;
        this.paddingTop = this.layout.paddingTop;
        this.paddingBottom = this.layout.paddingBottom;
        this.spacingX = this.layout.spacingX;
        this.spacingY = this.layout.spacingY;

        
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
        console.log(`updateRealScale start .. name = ${this.node.name}, originalContentSize: ${this.currentContentSize}`);
        const screenSize = this.currentContentSize;
        const designSize = this.originalContentSize;
        const scaleX = this.adapterWidth ? Math.floor((screenSize.x / designSize.x) * 100) / 100 : 1;
        const scaleY = this.adapterHeight ? Math.floor((screenSize.y / designSize.y) * 100) / 100 : 1;
        this.realScale.set(scaleX, scaleY, 1);
        //log realScale
        console.log(`realScale: ${this.realScale}`);
        
        this.updateLayoutPaddingAndSpacing();
        this.updateLayoutChildrenScale();
        this.layout.updateLayout();
    }

    protected updateLayoutPaddingAndSpacing(): void {
        //to floor the padding and spacing
        this.layout.paddingLeft = Math.floor(this.paddingLeft * this.realScale.x);
        this.layout.paddingRight = Math.floor(this.paddingRight * this.realScale.x);
        this.layout.paddingTop = Math.floor(this.paddingTop * this.realScale.y);
        this.layout.paddingBottom = Math.floor(this.paddingBottom * this.realScale.y);
        this.layout.spacingX = Math.floor(this.spacingX * this.realScale.x);
        this.layout.spacingY = Math.floor(this.spacingY * this.realScale.y);
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
