export enum InteractionMode {
    CameraDrag,
    BuildingPlacement,
    Command,
    Plant
}

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

export enum GrowState
{
    NONE,
    GROWING,
    HARVESTING
}

export enum FarmSelectionType{
    NONE,
    BUILDING,
    PLOT,
    PLOT_COMMAND,           //浇水、施肥、除虫等
    FENCE,
    ANIMAL_COMMAND          //喂养、洗澡等
}

export enum SceneItemType {
    None = 0,
    Crop = 1,
    Animal = 2,
    Building = 3
}

export enum BuildingType {
    None = 0,
    Factory = 1,
    Decoration = 2
}

export enum SceneItemState {
    None = 0,
    InProgress = 1,
    Complete = 2,
    Dead = 3
}

export enum CommandType {
    None = 0,
    Care = 1,                   //浇水/喂养
    Treat = 2,                   //施肥/安抚
    Cleanse = 3,                 //除虫/洗澡
    Disease = 4,                //生病
}

export enum CommandState {
    None = 0,
    InProgress = 1,
    Complete = 2
}

export enum GameState {
    LOADING = 'loading',
    MAIN_MENU = 'main_menu',
    PLAYING = 'playing',
    PAUSED = 'paused',
    GAME_OVER = 'game_over',
}

export enum DiseaseState{
    None = 0,
    Disease = 1
}

export enum SyntheState{
    None = 0,
    InProgress = 1,
    Complete = 2
}

export class NetworkLoginResult{
    success: boolean;
    message: string;
    sessionToken: string;
    user: NetworkUser;
}

export class NetworkUser{
    id: string;
    nickname: string;
    level: number;
    exp: number;
    coin: number;
    diamond: number;
    register_time: Date;
    last_login_time: Date;
    inventory_items?: NetworkInventoryItem[];
}

export class NetworkInventoryItem{
    id: string;
    num: number;
    type: number;
    item_id: string;
}

export class NetworkHarvestResultData{
    userid: string;
    item_id: string;
    exp_gained: number;
    new_exp: number;
    new_level: number;
    current_coin: number;
}

export class NetworkHarvestResult{
    success: boolean;
    message: string;
    data: NetworkHarvestResultData;
}

export class NetworkBuyItemResultData{
    item_id: string;
    current_coin: number;
    num: number;
}

export class NetworkBuyItemResult{
    success: boolean;
    message: string;
    data: NetworkBuyItemResultData;
}

export class NetworkSellItemResultData{
    item_id: string;
    current_coin: number;
    num: number;
}

export class NetworkSellItemResult{
    success: boolean;
    message: string;
    data: NetworkSellItemResultData;
}

export class NetworkCareResultData{
    sceneid: string;
    scene_item_type: SceneItemType;
    command_id: string;
    care_count: number;
    friend_id: string;
    diamond_added: number;
}

export class NetworkCareResult{
    success: boolean;
    message: string;
    data: NetworkCareResultData;
}

export class NetworkTreatResultData{
    sceneid: string;
    command_id: string;
    treat_count: number;
    friend_id: string;
    diamond_added: number;
}

export class NetworkTreatResult{
    success: boolean;
    message: string;
    data: NetworkTreatResultData;
}

export class NetworkCleanseResultData{
    sceneid: string;
    command_id: string;
    cleanse_count: number;
    friend_id: string;
    diamond_added: number;
}

export class NetworkCleanseResult{
    success: boolean;
    message: string;
    data: NetworkCleanseResultData;
}

export class NetworkDiseaseStatusResult{
    success: boolean;
    message: string;
    is_sick: boolean;
    count:  number;
    last_updated_time:string|null;
}

export class NetworkSyntheListResult{
    success: boolean;
    message: string;
    data: NetworkSyntheResultData[];
}

export class NetworkSyntheResultData{
    id: string;
    sceneid: string;
    syntheid: string;
    startTime: string;
    endTime: string;
    count: number;
    state: SyntheState;
}

export class NetworkSyntheResult{
    success: boolean;
    message: string;
    data: NetworkSyntheResultData;
}

export class NetworkVisitResultData{
    userId: string;
    level: number;
    exp: number;
    coin: number;
    diamond: number;
    sceneItems: SceneItem[];
}

export class NetworkVisitResult{
    success: boolean;
    message: string;
    data: NetworkVisitResultData;
}

export class NetworkCommand{
    id: string;
    userid: string;
    customid: string;
    state: CommandState;
    last_updated_time: string;
    type: CommandType;
    sceneid: string;
    count: number;
}

export class NetworkAddBuildingResult{
    success: boolean;
    message: string;
    data: NetworkAddBuildingResultData;
}

export class NetworkAddBuildingResultData{
    sceneItem: SceneItem;
    coin: number;
    diamond: number;
    prosperity: number;
}

export class NetworkRecommendFriendsResult{
    success: boolean;
    message: string;
    data: NetworkRecommendFriendsResultData[];
}

export class NetworkRecommendFriendsResultData{
    id: string;
    nickname: string;
    level: number;
}

export class SceneItem{
    id: string;
    item_id: string;
    type: SceneItemType;
    x: number;
    y: number;
    state: SceneItemState;
    userid: string;
    parent_node_name: string;
    last_updated_time: string;
    elapsed_time: number;
    commands: NetworkCommand[];
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

    public static readonly CURRENT_USER_ID: string = '123';

    public static readonly CARE_TIME_RATIO_REDUCE: number = 0.05;            //浇水/喂养冷却时间减少比例
    public static readonly TREAT_TIME_RATIO_REDUCE: number = 0.1;            //施肥/安抚冷却时间减少比例

    //作物相关
    public static readonly MAX_CROP_CARE_COUNT: number = 4;
    public static readonly MAX_CROP_TREAT_COUNT: number = 4;
    public static readonly MAX_CROP_CLEANSE_COUNT: number = 4;

    //动物相关
    public static readonly MAX_ANIMAL_CARE_COUNT: number = 2;
    public static readonly MAX_ANIMAL_TREAT_COUNT: number = 2;
    public static readonly MAX_ANIMAL_CLEANSE_COUNT: number = 2;

    //冷却时间
    public static readonly CARE_COOLDOWN: number = 5 * 60;
    public static readonly TREAT_COOLDOWN: number = 5 * 60;
    public static readonly CLEANSE_COOLDOWN: number = 5 * 60;

    public static readonly DISEASE_STATUS_UPDATE_INTERVAL: number = 60 * 60;    //每小时更新一次生病状态

    public static readonly TIME_MINUTE: number = 60;

    public static readonly INIT_PLOT_NUM: number = 5;

    public static readonly COOLDOWN_SELECTION_TIME: number = 0.5;
    public static readonly COOLDOWN_KEY_CARE: string = 'care';
    public static readonly COOLDOWN_KEY_TREAT: string = 'treat';
    public static readonly COOLDOWN_KEY_CLEANSE: string = 'cleanse';

    public static readonly EVENT_TOUCH_START: string = 'touch-start';
    public static readonly EVENT_TOUCH_MOVE: string = 'touch-move';
    public static readonly EVENT_TOUCH_END: string = 'touch-end';
    public static readonly EVENT_TOUCH_CANCEL: string = 'touch-cancel';
    public static readonly EVENT_CLICK: string = 'click';

    public static readonly PATH_CAMERA: string = 'Canvas/Camera';
    public static readonly PATH_GAMEPLAY: string = 'Canvas/Gameplay';
    public static readonly PATH_INPUT_NODE: string = 'Canvas/InputNode';
    public static readonly PATH_BUILDINGS: string = 'Canvas/Gameplay/Buildings';

    public static readonly EVENT_PLOT_SELECTED: string = 'plotSelected';
    public static readonly EVENT_PLOT_OCCUPIED: string = 'plotOccupied';

    public static readonly EVENT_FENCE_ANIMAL_ADDED: string = 'fence-animal-added';

    public static readonly EVENT_PLAYER_LEVEL_UP: string = 'player-level-up';
    public static readonly EVENT_PLAYER_EXP_CHANGE: string = 'player-exp-change';
    public static readonly EVENT_PLAYER_GOLD_CHANGE: string = 'player-gold-change';
    public static readonly EVENT_PLAYER_DIAMOND_CHANGE: string = 'player-diamond-change';
    public static readonly EVENT_PLAYER_PROSPERITY_CHANGE: string = 'player-prosperity-change';
    public static readonly EVENT_PLAYER_PLACEMENT_BUILDING: string = 'player-placement-building';
    public static readonly EVENT_PLAYER_STATE_INIT: string = 'player-state-init';

    public static readonly EVENT_VISIT_MODE_CHANGE: string = 'visit-mode-change';
    
    public static readonly EVENT_CROP_HARVEST: string = 'crop-harvest';
    public static readonly EVENT_ANIMAL_HARVEST: string = 'animal-harvest';


    public static readonly WINDOW_CRAFT_NAME: string = 'CraftWindow';
    public static readonly WINDOW_SHOP_NAME: string = 'ShopWindow';
    public static readonly WINDOW_SELECTION_NAME: string = 'FarmSelectionWindow';
    public static readonly WINDOW_FARM_FACTORY_NAME: string = 'FarmFactoryWindow';
    public static readonly WINDOW_GAME_NAME: string = 'GameWindow';
    public static readonly WINDOW_TOAST_NAME: string = "ToastWindow";

    public static readonly WINDOW_CRAFT_TEXTURES: string = 'textures/craftWindow/';
    public static readonly WINDOW_BUILDING_TEXTURES: string = 'textures/buildings/';
    public static readonly WINDOW_GAME_TEXTURES: string = 'textures/gameWindow/';
    public static readonly WINDOW_SHOP_TEXTURES: string = 'textures/shopWindow/';
    public static readonly CROPS_TEXTURES: string = 'textures/crops/';
    public static readonly ANIMALS_TEXTURES: string = 'textures/animals/';

    public static readonly LAYER_GROUND_NAME: string = 'Ground';
    public static readonly LAYER_BUILDING_NAME: string = 'Building';
    public static readonly LAYER_OBSTACLE_NAME: string = 'Obstacle';
    public static readonly LAYER_FENCE_NAME: string = 'Fence';
    public static readonly LAYER_PLOTTILE_NAME: string = 'PlotTile';

    public static readonly CROP_GROWTH_STAGES: number = 4;
    public static readonly CROP_GROWTH_TIME: number = 10;

    public static readonly JSON_CROP_DATA: string = 'data/CropsData';
    public static readonly JSON_ITEM_DATA: string = 'data/ItemData';
    public static readonly JSON_BUILD_DATA: string = 'data/BuildData';
    public static readonly JSON_ANIMAL_DATA: string = 'data/AnimalData';
    public static readonly JSON_SYNTHE_DATA: string = 'data/SyntheData';
    public static readonly JSON_GRADE_DATA: string = 'data/GradeData';

    public static readonly PREFAB_CROP_CORN: string = 'entities/crops/Corn';
    public static readonly PREFAB_CROP_CARROT: string = 'entities/crops/Carrot';
    public static readonly PREFAB_CROP_GRAPE: string = 'entities/crops/Grape';
    public static readonly PREFAB_CROP_CABBAGE: string = 'entities/crops/Cabbage';
    public static readonly PREFAB_ANIMAL:string = 'entities/animal/Animal';
    public static readonly PREFAB_COIN_COLLECTION_EFFECT:string = 'ui/effects/CoinCollectEffect';

    public static readonly PREFAB_PLACEMENT_BUILDING: string = 'entities/buildings/placementBuilding';

}
