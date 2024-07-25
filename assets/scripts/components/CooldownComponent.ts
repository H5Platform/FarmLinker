import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

interface CooldownTimer {
    remainingTime: number;
    duration: number;
    callback: () => void;
}

@ccclass('CooldownComponent')
export class CooldownComponent extends Component {
    private cooldowns: Map<string, CooldownTimer> = new Map();

    /**
     * Adds a new cooldown timer
     * @param key Unique identifier for the cooldown timer
     * @param duration Cooldown duration in seconds
     * @param callback Function to be called when the cooldown finishes
     */
    public startCooldown(key: string, duration: number, callback: () => void): void {
        if (this.cooldowns.has(key)) {
            console.warn(`Cooldown with key "${key}" already exists. Overwriting.`);
        }
        this.cooldowns.set(key, {
            remainingTime: duration,
            duration: duration,
            callback: callback
        });
    }

    /**
     * Removes a cooldown timer
     * @param key Identifier of the cooldown timer to remove
     */
    public removeCooldown(key: string): void {
        this.cooldowns.delete(key);
    }

    /**
     * Checks if a cooldown timer is currently active
     * @param key Identifier of the cooldown timer to check
     * @returns true if the cooldown is active, false otherwise
     */
    public isOnCooldown(key: string): boolean {
        return this.cooldowns.has(key);
    }

    /**
     * Gets the remaining time of a cooldown timer
     * @param key Identifier of the cooldown timer
     * @returns Remaining cooldown time in seconds. Returns 0 if the timer doesn't exist.
     */
    public getRemainingTime(key: string): number {
        const cooldown = this.cooldowns.get(key);
        return cooldown ? cooldown.remainingTime : 0;
    }

    /**
     * Gets the progress of a cooldown timer (value between 0 and 1)
     * @param key Identifier of the cooldown timer
     * @returns Cooldown progress. Returns 1 if the timer doesn't exist.
     */
    public getCooldownProgress(key: string): number {
        const cooldown = this.cooldowns.get(key);
        if (!cooldown) return 1;
        return 1 - (cooldown.remainingTime / cooldown.duration);
    }

    update(dt: number) {
        this.cooldowns.forEach((timer, key) => {
            timer.remainingTime -= dt;
            if (timer.remainingTime <= 0) {
                timer.callback();
                this.cooldowns.delete(key);
            }
        });
    }
}
