// BuildingPlacementComponent.ts

import { _decorator, Component, Node, Vec3, EventTouch, Camera, geometry, Director, Vec2, Layers, PhysicsSystem2D, UITransform,  Rect, Sprite, SpriteFrame, Color } from 'cc';
import { BuildingManager } from '../managers/BuildingManager';
import { NetworkAddBuildingResult, SceneItem, SceneItemType, SharedDefines } from '../misc/SharedDefines';
import { ResourceManager } from '../managers/ResourceManager';
import { Building } from '../entities/Building';
import { NetworkManager } from '../managers/NetworkManager';
import { SpriteHelper } from '../helpers/SpriteHelper';
const { ccclass, property } = _decorator;

@ccclass('BuildingPlacementComponent')
export class BuildingPlacementComponent extends Component {
    private buildData: any;
    private buildingManager: BuildingManager | null = null;
    private isPlacing: boolean = false;
    private camera: Camera | null = null;
    private buildingSprite: Sprite | null = null;

    public initialize(buildData: any, buildingManager: BuildingManager): void {
        this.node.name = buildData.id;
        this.buildData = buildData;
        this.buildingManager = buildingManager;
        const cameraNode = Director.instance.getScene().getChildByPath(SharedDefines.PATH_CAMERA);
        if (cameraNode) {
            this.camera = cameraNode.getComponent(Camera);
        }
        else{
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
            this.updateBuildingPosition( new Vec3(uiLocation.x, uiLocation.y, 0));
            if (this.canPlaceBuilding()) {
                SpriteHelper.setSpriteColor(this.buildingSprite, new Color(255, 255, 255, 125));
            }
            else{
                SpriteHelper.setSpriteColor(this.buildingSprite, new Color(255, 0, 0, 125));
            }
        }
    }


    private updateBuildingPosition(uiPos: Vec3): void {
        const worldPos = this.camera.screenToWorld(uiPos); //this.getWorldPositionFromUI(uiPos);
        if (worldPos) {
            this.node.setWorldPosition(worldPos);
        }
    }


    private updateBuildingAppearance(): void {
        
        ResourceManager.instance.loadAsset(`${SharedDefines.WINDOW_BUILDING_TEXTURES}${this.buildData.texture}/spriteFrame`, SpriteFrame).then((spriteFrame) => {
            this.buildingSprite.spriteFrame = spriteFrame as SpriteFrame;
        });
    }

    public canPlaceBuilding(): boolean {
        const position = this.node.getWorldPosition();
        const ray = new geometry.Ray();
        Vec3.subtract(ray.o, position, new Vec3(0, 10, 0));
        ray.d = Vec3.UP;

        const uiTransform = this.node.getComponent(UITransform);
        const worldPos = this.node.getWorldPosition();
        //@TODO The contentSize can be changed manully or by configuration.
        const rect = new Rect(worldPos.x, worldPos.y, uiTransform.contentSize.width, uiTransform.contentSize.height);  

        const colliders = PhysicsSystem2D.instance.testAABB(rect);
        if (colliders.length > 0) {
            console.log('Colliders found:', colliders.length);
            colliders.forEach(collider => {
                console.log('Collider:', collider.node.name);
            });
            
            return false
        }
        return true;
    }

    public async placeBuilding(callback: (result: NetworkAddBuildingResult) => void): Promise<void> {
        console.log("Place building");


        const buildingComponent = this.node.addComponent(Building);
        
        const buildingContainer = Director.instance.getScene().getChildByPath(SharedDefines.PATH_BUILDINGS);
        if (buildingContainer) {
            this.node.removeFromParent();
            buildingContainer.addChild(this.node);
        } else {
            console.error('BuildingContainer not found, building will remain in current parent');
            return;
        }

        
       const result  = await NetworkManager.instance.addBuilding(this.buildData.id,this.node.getWorldPosition().x,this.node.getWorldPosition().y,buildingContainer.name);
       console.log("add building result",result);
       if(result.success){

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