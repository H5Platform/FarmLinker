import { _decorator, Component, Node } from 'cc';
import { SceneItem } from '../misc/SharedDefines';
const { ccclass, property } = _decorator;

@ccclass('SceneEntity')
export class SceneEntity extends Component {

    protected id: string = '';
    protected isPlayerOwner: boolean = false;

    //getters
    public get Id(): string {
        return this.id;
    }

    public get IsPlayerOwner(): boolean {
        return this.isPlayerOwner;
    }
    
    public init( id: string, isPlayerOwner: boolean): void {
        this.id = id;
        this.isPlayerOwner = isPlayerOwner;
    }
}


