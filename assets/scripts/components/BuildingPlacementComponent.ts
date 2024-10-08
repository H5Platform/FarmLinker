// BuildingPlacementComponent.ts

import { _decorator, Component, Node, Vec3, EventTouch, Camera, geometry, Director, Vec2, Layers, PhysicsSystem2D, UITransform, Rect, Sprite, SpriteFrame, Color, BoxCollider2D, Intersection2D, Graphics, Collider2D, Contact2DType, IPhysics2DContact, RigidBody2D, Size } from 'cc';
import { BuildingManager } from '../managers/BuildingManager';
import { NetworkAddBuildingResult, SceneItem, SceneItemType, SharedDefines } from '../misc/SharedDefines';
import { ResourceManager } from '../managers/ResourceManager';
import { Building } from '../entities/Building';
import { NetworkManager } from '../managers/NetworkManager';
import { SpriteHelper } from '../helpers/SpriteHelper';
import { GameController } from '../controllers/GameController';
const { ccclass, property } = _decorator;

@ccclass('BuildingPlacementComponent')
export class BuildingPlacementComponent extends Component {
    private buildData: any;
    private buildingManager: BuildingManager | null = null;
    private isPlacing: boolean = false;
    private camera: Camera | null = null;
    private buildingSprite: Sprite | null = null;
    private collider: Collider2D | null = null;
    private contactCount: number = 0;

    private isIntersecting: boolean = false;

    protected onEnable(): void {

        //get rigidbody
        let rigidbody = this.node.getComponent(RigidBody2D);
        if (rigidbody) {
            rigidbody.enabledContactListener = true;
        }
        this.collider = this.node.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    protected onDisable(): void {
        let rigidbody = this.node.getComponent(RigidBody2D);
        if (rigidbody) {
            rigidbody.enabledContactListener = false;
        }
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void {
        this.contactCount++;
        SpriteHelper.setSpriteColor(this.buildingSprite, new Color(255, 0, 0, 125));
        
        
        console.log(`onBeginContact self: ${this.node.name}, other: ${otherCollider.node.name}, contact count: ${this.contactCount}`);
    }

    private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void {
        this.contactCount--;
        if (this.contactCount === 0) {
            SpriteHelper.setSpriteColor(this.buildingSprite, new Color(255, 255, 255, 125));
        }
        console.log(`onEndContact self: ${this.node.name}, other: ${otherCollider.node.name}, contact count: ${this.contactCount}`);
    }

    public initialize(buildData: any, buildingManager: BuildingManager): void {
        this.node.name = buildData.id;
        this.buildData = buildData;
        this.buildingManager = buildingManager;
        const cameraNode = Director.instance.getScene().getChildByPath(SharedDefines.PATH_CAMERA);
        if (cameraNode) {
            this.camera = cameraNode.getComponent(Camera);
        }
        else {
            console.error("Cannot find camera node");
            return;
        }
        this.buildingSprite = this.node.getComponent(Sprite);

        this.updateBuildingAppearance();
    }

    public onTouchStart(event: EventTouch): void {
        this.isPlacing = true;
        const uiLocation = event.getLocation();
        this.updateBuildingPosition(new Vec3(uiLocation.x, uiLocation.y, 0));
    }

    public onTouchMove(event: EventTouch): void {
        if (this.isPlacing) {
            const uiLocation = event.getLocation();
            this.updateBuildingPosition(new Vec3(uiLocation.x, uiLocation.y, 0));

        }
    }


    private updateBuildingPosition(uiPos: Vec3): void {
        const worldPos = this.camera.screenToWorld(uiPos); //this.getWorldPositionFromUI(uiPos);
        if (worldPos) {
            this.node.setWorldPosition(worldPos);
        }
    }


    private updateBuildingAppearance(): void {
        console.log(`BuildingPlacementComponent.updateBuildingAppearance start .. pending texture = ${this.buildData.texture}`);
        ResourceManager.instance.loadAsset(`${SharedDefines.WINDOW_BUILDING_TEXTURES}${this.buildData.texture}/spriteFrame`, SpriteFrame).then((spriteFrame) => {
            this.buildingSprite.spriteFrame = spriteFrame as SpriteFrame;

            const uiTransform = this.node.getComponent(UITransform);
            //update collider box size
            const collider = this.node.getComponent(BoxCollider2D);
            if (collider) {
                
                const size = uiTransform.contentSize;
                collider.size = new Size(size.width * 0.7, size.height * 0.7);
            }
        });


    }

    private debugDraw: Graphics | null = null;
    public canPlaceBuilding(): boolean {
        return this.contactCount === 0;
    }

    public async placeBuilding(callback: (result: NetworkAddBuildingResult) => void): Promise<void> {
        console.log("Place building");
        SpriteHelper.setSpriteColor(this.buildingSprite, new Color(255, 255, 255, 255));

        const buildingComponent = this.node.addComponent(Building);

        const buildingContainer = Director.instance.getScene().getChildByPath(SharedDefines.PATH_BUILDINGS);
        if (buildingContainer) {
            this.node.removeFromParent();
            buildingContainer.addChild(this.node);
        } else {
            console.error('BuildingContainer not found, building will remain in current parent');
            return;
        }

        //get game controller
        const gameController = Director.instance.getScene().getComponentInChildren(GameController);
        //convert world pos to design pos   
        const designPos = new Vec2(this.node.getWorldPosition().x / gameController.ScreenScale.x, this.node.getWorldPosition().y / gameController.ScreenScale.y);
        const result = await NetworkManager.instance.addBuilding(this.buildData.id, designPos.x, designPos.y, buildingContainer.name);
        console.log("add building result", result);
        if (result.success) {

            buildingComponent.initializeFromSceneItem(result.data.sceneItem);
            // 完成建造
            buildingComponent.completeConstruction();
            console.log("add building success");
            this.buildingManager!.addBuilding(this.buildData.id, this.node);
            this.isPlacing = false;
            callback(result);
            this.destroy();
        }

    }

    public cancelPlacement(): void {
        this.isPlacing = false;
        this.node.destroy();
    }

    public finalizePlacement(): void {
        if (this.isPlacing) {
            if (this.canPlaceBuilding()) {
                this.placeBuilding();
            } else {
                this.cancelPlacement();
            }
        }
    }
}