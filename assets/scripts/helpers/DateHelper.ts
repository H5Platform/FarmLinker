import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
// helpers/DateHelper.ts

export class DateHelper {
    /**
     * 将日期时间字符串转换为 Date 对象
     * @param dateString 日期时间字符串
     * @returns Date 对象，如果转换失败则返回 null
     */
    public static stringToDate(dateString: string): Date | null {
        if (typeof dateString !== 'string') {
            console.error('Input is not a string', dateString);
            return new Date();
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date string', dateString);
            return null;
        }

        return date;
    }

    /**
     * 计算从给定日期到现在的经过时间（毫秒）
     * @param date Date 对象或日期时间字符串
     * @returns 经过的毫秒数，如果输入无效则返回 null
     */
    public static getElapsedTime(date: Date | string): number | null {
        let startDate: Date | null;

        if (typeof date === 'string') {
            startDate = this.stringToDate(date);
        } else if (date instanceof Date) {
            startDate = date;
        } else {
            console.error('Invalid input type for getElapsedTime', date);
            return null;
        }

        if (!startDate) {
            return null;
        }

        return Date.now() - startDate.getTime();
    }
}

