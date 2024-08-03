import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BuildingManager')
export class BuildingManager extends Component {
    private static _instance: BuildingManager | null = null;
    private buildings: Map<string, Node> = new Map();

    public static get instance(): BuildingManager {
        if (this._instance === null) {
            this._instance = new BuildingManager();
        }
        return this._instance;
    }


    public addBuilding(buildingId: string, buildingNode: Node): void {
        this.buildings.set(buildingId, buildingNode);
    }

    public hasBuildingOfType(buildingId: string): boolean {
        return this.buildings.has(buildingId);
    }

    public focusOnBuilding(buildingId: string): void {
        const building = this.buildings.get(buildingId);
        if (building) {
            // 实现相机聚焦逻辑
            // 这里需要根据您的相机系统进行适当的实现
            console.log(`Focusing on building: ${buildingId}`);
        }
    }

    public getBuildingPosition(buildingId: string): Vec3 | null {
        const building = this.buildings.get(buildingId);
        return building ? building.worldPosition : null;
    }
}