export enum CropType {
    WHEAT = 'wheat',
    CORN = 'corn',
    POTATO = 'potato',
    TOMATO = 'tomato',
    // 可以根据需要添加更多作物类型
}

export enum GameState {
    LOADING = 'loading',
    MAIN_MENU = 'main_menu',
    PLAYING = 'playing',
    PAUSED = 'paused',
    GAME_OVER = 'game_over',
}

export class SharedDefines {
    // // 作物相关
    // public static readonly MAX_CROP_LEVEL: number = 5;
    // public static readonly INITIAL_CROP_PRICE: number = 100;
    // public static readonly CROP_PRICE_INCREASE_RATE: number = 1.5;
    // public static readonly CROP_YIELD_INCREASE_RATE: number = 1.2;

    // // 时间相关（单位：秒）
    // public static readonly DEFAULT_YIELD_INTERVAL: number = 60;
    // public static readonly DEFAULT_GROWTH_TIME: number = 300;
    // public static readonly DEFAULT_HARVEST_TIME: number = 10;

    // // 经济相关
    // public static readonly INITIAL_PLAYER_MONEY: number = 1000;

    // // UI相关
    // public static readonly FADE_DURATION: number = 0.5;

    // // 游戏平衡相关
    // public static readonly XP_PER_HARVEST: number = 10;
    // public static readonly XP_TO_LEVEL_UP: number = 100;

    // // 资源路径
    // public static readonly CROP_SPRITE_PATH: string = 'textures/crops/';

    // // 存储相关
    // public static readonly SAVE_KEY: string = 'farm_game_save';

    // // 音频相关
    // public static readonly BACKGROUND_MUSIC_VOLUME: number = 0.5;
    // public static readonly SFX_VOLUME: number = 1.0;

    // // 你可以根据需要继续添加更多常量

    public static readonly CROP_CORN: string = 'entities/crops/Corn';
    public static readonly CROP_CARROT: string = 'entities/crops/Carrot';
    public static readonly CROP_GRAPE: string = 'entities/crops/Grape';
    public static readonly CROP_CABBAGE: string = 'entities/crops/Cabbage';
}
