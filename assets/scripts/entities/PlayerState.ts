// PlayerState.ts

import { EventTarget } from 'cc';
import { SharedDefines } from '../misc/SharedDefines';

export class PlayerState {
    private _level: number;
    private _experience: number;
    private _gold: number;
    private _diamond: number;

    public eventTarget: EventTarget;

    constructor(initialLevel: number = 1, initialExperience: number = 0, initialGold: number = 0, initialDiamond: number = 0) {
        this._level = initialLevel;
        this._experience = initialExperience;
        this._gold = initialGold;
        this._diamond = initialDiamond;
        this.eventTarget = new EventTarget();
    }

    // Getters
    public get level(): number { return this._level; }
    public get experience(): number { return this._experience; }
    public get gold(): number { return this._gold; }
    public get diamond(): number { return this._diamond; }

    // Setters with event emission
    public set level(value: number) {
        if (this._level !== value) {
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
        const expNeededForNextLevel = this.getExpNeededForNextLevel();
        if (this._experience >= expNeededForNextLevel) {
            this._experience -= expNeededForNextLevel;
            this.level += 1;
            this.checkLevelUp(); // prevent too many levels
        }
    }

    private getExpNeededForNextLevel(): number {
        // TEST ONLY
        return Math.floor(100 * Math.pow(1.5, this._level - 1));
    }
}