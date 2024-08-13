import { _decorator, Component, Node } from 'cc';
import { PlayerState } from '../entities/PlayerState';
const { ccclass, property } = _decorator;

@ccclass('NetworkPlayerState')
export class NetworkPlayerState extends PlayerState {
    private _id: string = '';
    private _nickname: string = '';
    private _registerTime: Date = new Date();
    private _lastLoginTime: Date = new Date();
    private _token: string = '';

    // Getters
    public get Id(): string { return this._id; }
    public get Nickname(): string { return this._nickname; }
    public get RegisterTime(): Date { return this._registerTime; }
    public get LastLoginTime(): Date { return this._lastLoginTime; }
    public get Token(): string { return this._token; }

    constructor(userData: any, token: string) {
        super(userData.level, userData.exp, userData.coin, userData.diamond);
        this.initialize(userData, token);
    }

    public initialize(userData: any, token: string): void {
        this._id = userData.id;
        this._nickname = userData.nickname;
        this.level = userData.level;
        this.experience = userData.exp;
        this.gold = userData.coin;
        this.diamond = userData.diamond;
        this._registerTime = new Date(userData.register_time);
        this._lastLoginTime = new Date(userData.last_login_time);
        this._token = token;

        // 触发更新事件
        this.eventTarget.emit('player-state-updated');
    }


}


