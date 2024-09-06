// NetworkManager.ts

import { _decorator, Component,EventTarget  } from 'cc';
import { HttpHelper } from '../helpers/HttpHelper';
import { NetworkAddBuildingResult, NetworkCareResult, NetworkCleanseResult, NetworkDiseaseStatusResult, NetworkSyntheListResult, NetworkSyntheResult, NetworkTreatResult, NetworkVisitResult, SceneItemType, SharedDefines } from '../misc/SharedDefines';
const { ccclass, property } = _decorator;

interface LoginResp{
    success: boolean;
    token: string;
    user: {}
}

@ccclass('NetworkManager')
export class NetworkManager extends Component {
    public static readonly API_LOGIN: string = "/login";

    public static readonly API_GET_LATEST_COMMAND_DURATION: string = "/game/getLatestCommandDuration";
    public static readonly API_GET_USER_SCENE_ITEMS: string = "/game/getUserSceneItems";
    public static readonly API_PLANT: string = "/game/plant";
    public static readonly API_ADD_INVENTORY_ITEM: string = "/inventory/add";
    public static readonly API_REMOVE_INVENTORY_ITEM: string = "/inventory/remove";
    public static readonly API_HARVEST: string = "/game/harvest";
    public static readonly API_BUY_ITEM: string = "/game/buyItem";
    public static readonly API_SELL_ITEM: string = "/game/sellItem";
    public static readonly API_CARE: string = "/game/care";
    public static readonly API_CARE_FRIEND: string = "/game/careFriend";
    public static readonly API_TREAT: string = "/game/treat";
    public static readonly API_TREAT_FRIEND: string = "/game/treatFriend";
    public static readonly API_CLEANSE: string = "/game/cleanse";
    public static readonly API_CLEANSE_FRIEND: string = "/game/cleanseFriend";
    public static readonly API_QUERY_DISEASE_STATUS: string = "/game/queryDiseaseStatus";
    public static readonly API_UPDATE_DISEASE_STATUS: string = '/game/updateDiseaseStatus';
    public static readonly API_QUERY_SYNTHE_LIST: string = '/game/getSyntheList';
    public static readonly API_START_SYNTHE: string = '/game/startSynthe';
    public static readonly API_SYNTHE_END: string = '/game/syntheEnd';
    public static readonly API_VISIT: string = '/game/visit';
    public static readonly API_ADD_BUILDING: string = '/scene/addBuilding';
    

    public static readonly EVENT_LOGIN_SUCCESS = 'login-success';
    public static readonly EVENT_LOGIN_FAILED = 'login-failed';
    public static readonly EVENT_GET_USER_SCENE_ITEMS = 'get-user-scene-items';
    public static readonly EVENT_PLANT = 'plant';
    public static readonly EVENT_HARVEST = 'harvest';
    public static readonly EVENT_BUY_ITEM = 'buy-item';
    public static readonly EVENT_SELL_ITEM = 'sell-item';
    public static readonly EVENT_CARE = 'care';
    public static readonly EVENT_CARE_FRIEND = 'care-friend';
    public static readonly EVENT_TREAT = 'treat';
    public static readonly EVENT_TREAT_FRIEND = 'treat-friend';
    public static readonly EVENT_CLEANSE = 'cleanse';
    public static readonly EVENT_UPDATE_DISEASE_STATUS: string = 'update-disease-status';
    public static readonly EVENT_QUERY_DISEASE_STATUS: string = 'query-disease-status';
    private static _instance: NetworkManager | null = null;

    @property
    private baseUrl: string = '';

    @property
    private loginPort: number = 3000; // 登录服务器端口
    @property
    private gameServerPort: number = 3001; // 游戏服务器端口

    @property
    private maxLoginRetries: number = 3;

    @property({
        multiline: true,
        tooltip: 'Enter default headers in JSON format'
    })
    private defaultHeadersJson: string = '{}';

    private token: string = '';
    private userId: string = '';

    @property
    private simulateNetwork:boolean = false;

    //getter simulateNetwork
    public get SimulateNetwork():boolean{
        return this.simulateNetwork;
    }
    

    private get defaultHeaders(): Record<string, string> {
        try {
            return JSON.parse(this.defaultHeadersJson);
        } catch (error) {
            console.error('Invalid default headers JSON:', error);
            return {};
        }
    }

    public eventTarget: EventTarget = new EventTarget();

    public static get instance(): NetworkManager {
        return this._instance;
    }

    onLoad() {
        if (NetworkManager._instance !== null) {
            this.node.destroy();
            return;
        }
        NetworkManager._instance = this;
    }

    public async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        const url = this.buildUrl(endpoint);
        try {
            const response = await HttpHelper.get(url, params);
            return JSON.parse(response) as T;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    public async post<T>(endpoint: string, data?: any): Promise<T> {
        const url = this.buildUrl(endpoint);
        try {
            const response = await HttpHelper.post(url, data, this.defaultHeaders);
            return JSON.parse(response) as T;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    public async login(userId: string): Promise<boolean> {
        const loginUrl = `${this.baseUrl}:${this.loginPort}${NetworkManager.API_LOGIN}`;
        const data = { userid: userId };

        for (let attempt = 1; attempt <= this.maxLoginRetries; attempt++) {
            try {
                console.log(loginUrl);
                const response = await HttpHelper.post(loginUrl, data, this.defaultHeaders);
                const result = JSON.parse(response);
                
                if (result.success) {
                    console.log('Login successful',result);
                    this.token = result.sessionToken;
                    this.userId = result.user.id;
                    this.eventTarget.emit(NetworkManager.EVENT_LOGIN_SUCCESS, result.user, result.sessionToken);
                    return;
                } else {
                    console.warn(`Login attempt ${attempt} failed: ${result.message}`);
                    if (attempt === this.maxLoginRetries) {
                        console.error('Max login attempts reached');
                        this.eventTarget.emit(NetworkManager.EVENT_LOGIN_FAILED, 'Max login attempts reached');
                        return;
                    }
                    await this.delay(1000 * attempt);
                }
            } catch (error) {
                console.error(`Login attempt ${attempt} error:`, error);
                if (attempt === this.maxLoginRetries) {
                    this.handleError(error);
                    this.eventTarget.emit(NetworkManager.EVENT_LOGIN_FAILED, error);
                    return;
                }
                await this.delay(1000 * attempt);
            }
        }

        return false;
    }

    public async requestSceneItemsByUserId(userId: string): Promise<void> {
        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_GET_USER_SCENE_ITEMS}`;
        console.log(url);
        const headers = {
            'Authorization': this.token,
        };

        const data = { userid: userId };
        try {
            const response = await HttpHelper.post(url, data, headers);
            console.log(response);
            const result = JSON.parse(response);
            this.eventTarget.emit(NetworkManager.EVENT_GET_USER_SCENE_ITEMS, result);
            
        } catch (error) {
            this.handleError(error);
        }
    }

    public async getLatestCommandDuration(sceneItemId: string,userid:string = null): Promise<any> {
        if(this.simulateNetwork){
            return {success:true,duration:0};
        }
        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_GET_LATEST_COMMAND_DURATION}`;
        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };
    
        const data = { userid: userid || this.userId,sceneItemId };
    
        try {
            const response = await HttpHelper.post(url, data, headers);
            return JSON.parse(response);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    public async plant( itemId: string,sceneType:SceneItemType, x: number, y: number,parent_node_name: string): Promise<boolean> {
        if(this.simulateNetwork){
            this.eventTarget.emit(NetworkManager.EVENT_PLANT, { success: true });
            return true;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_PLANT}`;
        
        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };
    
        const data = {
            userid: this.userId,
            itemid: itemId,
            type:(sceneType as number),
            x: x,
            y: y,
            parent_node_name:parent_node_name
        };
    
        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response);
            this.eventTarget.emit(NetworkManager.EVENT_PLANT, result);
            return result.success;

        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    public async harvest(sceneId: string, itemId: string,itemType:number): Promise<boolean> {
        if (this.simulateNetwork) {
            this.eventTarget.emit(NetworkManager.EVENT_HARVEST, { success: true });
            return true;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_HARVEST}`;
        
        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };
    
        const data = {
            userid: this.userId,
            sceneid: sceneId,
            itemid: itemId,
            itemtype: itemType
        };
    
        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response);
            this.eventTarget.emit(NetworkManager.EVENT_HARVEST, result);
            return result.success;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    public async addInventoryItem(token: string,userId: string, itemId: string, type: string, delta: number): Promise<boolean> {
        if(this.simulateNetwork){
            return true;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_ADD_INVENTORY_ITEM}`;
        
        const headers = {
            'Authorization': token,
            ...this.defaultHeaders
        };
    
        const data = {
            userId,
            itemId,
            type,
            quantity: delta
        };
    
        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response);
            return result.success;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    public async removeInventoryItem(token: string,userId: string, itemId: string, type: string, delta: number): Promise<boolean> {
        if(this.simulateNetwork){
            return true;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_REMOVE_INVENTORY_ITEM}`;
        
        const headers = {
            'Authorization': token,
            ...this.defaultHeaders
        };
    
        const data = {
            userId,
            itemId,
            type,
            quantity: delta
        };
    
        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response);
            return result.success;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    public async buyItem(itemId: string,num:number): Promise<boolean> {
        if (this.simulateNetwork) {
            return true;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_BUY_ITEM}`;
        
        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userid: this.userId,
            itemid: itemId,
            num: num
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response);
            this.eventTarget.emit(NetworkManager.EVENT_BUY_ITEM, result);
            return result.success;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    public async sellItem(itemId: string,num:number): Promise<any|null> {
        if (this.simulateNetwork) {
            return true;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_SELL_ITEM}`;
        
        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userid: this.userId,
            itemid: itemId,
            num: num
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response);
            this.eventTarget.emit(NetworkManager.EVENT_SELL_ITEM, result);
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    public async care(sceneId: string): Promise<NetworkCareResult> {
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_CARE}`;
        
        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userid: this.userId,
            sceneid: sceneId
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkCareResult;
            this.eventTarget.emit(NetworkManager.EVENT_CARE, result);
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    public async careFriend(sceneId: string,friendId: string): Promise<NetworkCareResult> {
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_CARE_FRIEND}`;

        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userid: this.userId,
            sceneid: sceneId,
            friendId: friendId
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkCareResult;
            this.eventTarget.emit(NetworkManager.EVENT_CARE_FRIEND, result);
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    public async treat(sceneId: string): Promise<NetworkTreatResult> {
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_TREAT}`;
        
        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userid: this.userId,
            sceneid: sceneId
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkTreatResult;
            this.eventTarget.emit(NetworkManager.EVENT_TREAT, result);
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    public async treatFriend(sceneId: string, friendId: string): Promise<NetworkTreatResult> {
        if (this.simulateNetwork) {
            return null;
        }
    
        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_TREAT_FRIEND}`;
    
        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };
    
        const data = {
            userid: this.userId,
            sceneid: sceneId,
            friendId: friendId
        };
    
        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkTreatResult;
            this.eventTarget.emit(NetworkManager.EVENT_TREAT_FRIEND, result);
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    //cleanse
    public async cleanse(sceneId: string): Promise<NetworkCleanseResult> {
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_CLEANSE}`;

        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userid: this.userId,
            sceneid: sceneId
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkCleanseResult;
            this.eventTarget.emit(NetworkManager.EVENT_CLEANSE, result);
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    //cleanse friend
    public async cleanseFriend(sceneId: string, friendId: string): Promise<NetworkCleanseResult> {
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_CLEANSE_FRIEND}`;

        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userid: this.userId,
            sceneid: sceneId,
            friendId: friendId
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkCleanseResult;
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    // Disease status update
    public async updateDiseaseStatus(sceneId: string,updateDiseaseTimes:number): Promise<NetworkDiseaseStatusResult> {
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_UPDATE_DISEASE_STATUS}`;

        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userid: this.userId,
            sceneid: sceneId,
            updateDiseaseTimes
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkDiseaseStatusResult;
            this.eventTarget.emit(NetworkManager.EVENT_UPDATE_DISEASE_STATUS, result);
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    public async addBuilding(itemId: string,x: number, y: number,parent_node_name: string): Promise<NetworkAddBuildingResult>{
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_ADD_BUILDING}`;

        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userid: this.userId,
            buildingId: itemId,
            x: x,
            y: y,
            parent_node_name: parent_node_name
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkAddBuildingResult;
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    public async querySceneSyntheList(sceneId:string): Promise<NetworkSyntheListResult>{
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_QUERY_SYNTHE_LIST}`;

        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            sceneId: sceneId
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkSyntheListResult;
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    //implement start synthe
    public async syntheStart(syntheId:string,sceneId:string): Promise<NetworkSyntheResult>{
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_START_SYNTHE}`;

        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userId: this.userId,
            sceneId: sceneId,
            syntheId: syntheId,
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkSyntheResult;
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    public async syntheEnd(sceneId:string,syntheId:string): Promise<NetworkSyntheResult>{
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_SYNTHE_END}`;

        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userId: this.userId,
            sceneId: sceneId,
            syntheId: syntheId,
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkSyntheResult;
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    public async visit(userId:string): Promise<NetworkVisitResult>{
        if (this.simulateNetwork) {
            return null;
        }

        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_VISIT}`;

        const headers = {
            'Authorization': this.token,
            ...this.defaultHeaders
        };

        const data = {
            userid: userId, //The friend's userid
        };

        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response) as NetworkVisitResult;
            console.log(`visit result: ${JSON.stringify(result)}`);
            //this.eventTarget.emit(NetworkManager.EVENT_VISIT, result);
            return result;
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    private buildUrl(endpoint: string): string {
        return `${this.baseUrl}${endpoint}`;
    }

    private handleError(error: any): void {
        console.error('Network error:', error);
        // 这里可以添加更多的错误处理逻辑，比如显示错误提示等
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}