export enum CropType {
    WHEAT = 1,
    CABBAGE ,
    CARROT,
    TOMATO ,
    CORN,
    POTATO,
    STRAWBERRY,
    PUMPKIN,
    GRAPE
}

export enum CropState
{
    NONE,
    GROWING,
    HARVESTING
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

    public static readonly TIME_MINUTE: number = 60;

    public static readonly INIT_PLOT_NUM: number = 5;

    public static readonly EVENT_PLOT_SELECTED: string = 'plotSelected';

    public static readonly EVENT_PLAYER_LEVEL_UP: string = 'player-level-up';
    public static readonly EVENT_PLAYER_EXP_CHANGE: string = 'player-exp-change';
    public static readonly EVENT_PLAYER_GOLD_CHANGE: string = 'player-gold-change';
    public static readonly EVENT_PLAYER_DIAMOND_CHANGE: string = 'player-diamond-change';

    public static readonly EVENT_CROP_HARVEST: string = 'crop-harvest';



    public static readonly CROP_GROWTH_STAGES: number = 4;
    public static readonly CROP_GROWTH_TIME: number = 60;

    public static readonly JSON_CROP_DATA: string = 'data/CropsData';
    public static readonly JSON_ITEM_DATA: string = 'data/ItemData';

    public static readonly PREFAB_CROP_CORN: string = 'entities/crops/Corn';
    public static readonly PREFAB_CROP_CARROT: string = 'entities/crops/Carrot';
    public static readonly PREFAB_CROP_GRAPE: string = 'entities/crops/Grape';
    public static readonly PREFAB_CROP_CABBAGE: string = 'entities/crops/Cabbage';
}
