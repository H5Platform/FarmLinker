// PlayerState.ts

import { EventTarget } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';

export class PlayerState {
    private _id: string = '';
    private _nickname: string = '';
    private _registerTime: Date = new Date();
    private _lastLoginTime: Date = new Date();
    private _token: string = '';
    private _level: number;
    private _experience: number;
    private _gold: number;
    private _diamond: number;
    private _prosperity: number;
    private _headUrl: string = '';

    // Getters
    public get id(): string { return this._id; }
    public get nickname(): string { return this._nickname; }
    public get registerTime(): Date { return this._registerTime; }
    public get lastLoginTime(): Date { return this._lastLoginTime; }
    public get token(): string { return this._token; }
    public get level(): number { return this._level; }
    public get experience(): number { return this._experience; }
    public get gold(): number { return this._gold; }
    public get diamond(): number { return this._diamond; }
    public get prosperity(): number { return this._prosperity; }
    public get headUrl(): string { return this._headUrl; }
    public set headUrl(value: string) { this._headUrl = value; }
    public eventTarget: EventTarget;

    

    constructor(id: string,initialLevel: number = 1, initialExperience: number = 0, initialGold: number = 0, initialDiamond: number = 0) {
        this._id = id;
        this._level = initialLevel;
        this._experience = initialExperience;
        this._gold = initialGold;
        this._diamond = initialDiamond;
        this.eventTarget = new EventTarget();
    }

    public initialize(userData: any, token: string): void {
        this._id = userData.id;
        this._nickname = userData.nickname;
        this.level = userData.level;
        this.experience = userData.exp;
        this.gold = userData.coin;
        this.diamond = userData.diamond;
        this.prosperity = userData.prosperity;
        this._registerTime = new Date(userData.register_time);
        this._lastLoginTime = new Date(userData.last_login_time);
        this._token = token;

        // 触发更新事件
        this.eventTarget.emit(SharedDefines.EVENT_PLAYER_STATE_INIT,this);
    }



    // Setters with event emission
    public set level(value: number) {
        if (this._level !== value) {
            console.log(`set level: ${value}`);
            const oldLevel = this._level;
            this._level = value;
            this.eventTarget.emit(SharedDefines.EVENT_PLAYER_LEVEL_UP, { oldLevel, newLevel: value });
        }
    }

    public set experience(value: number) {
        if (this._experience !== value) {
            const oldExp = this._experience;
            this._experience = value;
            this.eventTarget.emit(SharedDefines.EVENT_PLAYER_EXP_CHANGE, { oldExp, newExp: value });
            this.checkLevelUp();
        }
    }

    public set gold(value: number) {
        if (this._gold !== value) {
            const oldGold = this._gold;
            this._gold = value;
            this.eventTarget.emit(SharedDefines.EVENT_PLAYER_GOLD_CHANGE, { oldGold, newGold: value });
        }
    }

    public set diamond(value: number) {
        if (this._diamond !== value) {
            const oldDiamond = this._diamond;
            this._diamond = value;
            this.eventTarget.emit(SharedDefines.EVENT_PLAYER_DIAMOND_CHANGE, { oldDiamond, newDiamond: value });
        }
    }

    public set prosperity(value: number) {
        if (this._prosperity !== value) {
            const oldProsperity = this._prosperity;
            this._prosperity = value;
            this.eventTarget.emit(SharedDefines.EVENT_PLAYER_PROSPERITY_CHANGE, { oldProsperity, newProsperity: value });
        }
    }

    // Methods to modify player attributes
    public addExperience(amount: number): void {
        this.experience += amount;
    }

    public addGold(amount: number): void {
        this.gold += amount;
    }

    public addDiamond(amount: number): void {
        this.diamond += amount;
    }

    public addProsperity(amount: number): void {
        this.prosperity += amount;
    }

    public spendGold(amount: number): boolean {
        if (this._gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    public spendDiamond(amount: number): boolean {
        if (this._diamond >= amount) {
            this.diamond -= amount;
            return true;
        }
        return false;
    }

    private checkLevelUp(): void {
        console.log(`PlayerState: checkLevelUp  level: ${this.level} experience: ${this.experience}`);
        const expNeededForNextLevel = this.getExpNeededForNextLevel();
        if (this.experience >= expNeededForNextLevel) {
            this.experience -= expNeededForNextLevel;
            this.level += 1;
            console.log(`PlayerState: checkLevelUp  levelup: ${this.level} experience: ${this.experience}`);
            this.checkLevelUp(); // prevent too many levels
        }
    }

    private getExpNeededForNextLevel(): number {
        // TEST ONLY
        return Math.floor(100 * Math.pow(1.5, this._level - 1));
    }
}