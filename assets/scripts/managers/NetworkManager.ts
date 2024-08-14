// NetworkManager.ts

import { _decorator, Component,EventTarget  } from 'cc';
import { HttpHelper } from '../helpers/HttpHelper';
import { SharedDefines } from '../misc/SharedDefines';
const { ccclass, property } = _decorator;

interface LoginResp{
    success: boolean;
    token: string;
    user: {}
}

@ccclass('NetworkManager')
export class NetworkManager extends Component {
    public static readonly API_LOGIN: string = "/login";

    public static readonly API_GET_USER_SCENE_ITEMS: string = "/game/getUserSceneItems";

    public static readonly EVENT_LOGIN_SUCCESS = 'login-success';
    public static readonly EVENT_LOGIN_FAILED = 'login-failed';
    public static readonly EVENT_GET_USER_SCENE_ITEMS = 'get-user-scene-items';

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

    public async requestSceneItemsByUserId(userId: string, session: string): Promise<void> {
        const url = `${this.baseUrl}:${this.gameServerPort}${NetworkManager.API_GET_USER_SCENE_ITEMS}`;
        console.log(url);
        const headers = {
            'Authorization': session,
        };

        const data = { userid: userId };
        try {
            const response = await HttpHelper.post(url, data, headers);
            const result = JSON.parse(response);
            this.eventTarget.emit(NetworkManager.EVENT_GET_USER_SCENE_ITEMS, result.data);
            
        } catch (error) {
            this.handleError(error);
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