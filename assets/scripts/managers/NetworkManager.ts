// NetworkManager.ts

import { _decorator, Component } from 'cc';
import { HttpHelper } from '../helpers/HttpHelper';
const { ccclass, property } = _decorator;

@ccclass('NetworkManager')
export class NetworkManager extends Component {
    private static _instance: NetworkManager | null = null;

    @property
    private baseUrl: string = '';

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

    private buildUrl(endpoint: string): string {
        return `${this.baseUrl}${endpoint}`;
    }

    private handleError(error: any): void {
        console.error('Network error:', error);
        // 这里可以添加更多的错误处理逻辑，比如显示错误提示等
    }
}