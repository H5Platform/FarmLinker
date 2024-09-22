import { _decorator, Component, Node, UITransform, view, Vec3, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScrollViewItem')
export class ScrollViewItem extends Component {

    public setScale(scale: Vec3) {
        this.node.setScale(scale);
    }
}


