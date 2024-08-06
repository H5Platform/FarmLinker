import { _decorator, Component, EventTarget } from 'cc';
const { ccclass, property } = _decorator;

export enum ItemType {
    NONE,
    CROP,
    CROPSEED,
    ANIMAL,
    ANIMALCUB,
}

export class InventoryItem {
    
    id: string;
    name: string;
    description: string;
    itemType: string;
    expGain: number;
    buyPrice: number;
    sellPrice: number;
    iconName: string;
    quantity: number;
    detailId: string;

    // constructor(id: string, name: string, description: string, itemType: string, expGain: number, buyPrice: number, sellPrice: number, iconName: string) {
    //     this.id = id;
    //     this.name = name;
    //     this.description = description;
    //     this.itemType = itemType;
    //     this.expGain = expGain;
    //     this.buyPrice = buyPrice;
    //     this.sellPrice = sellPrice;
    //     this.iconName = iconName;
    //     this.quantity = 1;
    // }
    constructor(jsonItemData: any) {
        this.id = jsonItemData.id;
        this.name = jsonItemData.name;
        this.description = jsonItemData.description;
        this.itemType = jsonItemData.item_type;
        this.expGain = jsonItemData.exp_get;
        this.buyPrice = jsonItemData.buy_price;
        this.sellPrice = jsonItemData.sell_price;
        this.iconName = jsonItemData.png;
        this.quantity = 1;
        this.detailId = jsonItemData.detail_id;
    }
}

@ccclass('InventoryComponent')
export class InventoryComponent extends Component {
    private items: Map<string, InventoryItem> = new Map();
    private capacity: number = 100; // Default capacity
    public eventTarget: EventTarget = new EventTarget();

    public static readonly EVENT_ITEM_ADDED = 'item-added';
    public static readonly EVENT_ITEM_REMOVED = 'item-removed';
    public static readonly EVENT_ITEM_UPDATED = 'item-updated';

    @property
    get itemCount(): number {
        return this.items.size;
    }

    @property
    get isFull(): boolean {
        return this.itemCount >= this.capacity;
    }

    public setCapacity(newCapacity: number): void {
        this.capacity = newCapacity;
    }

    public addItem(item: InventoryItem): boolean {
        if (this.isFull && !this.items.has(item.id)) {
            console.warn('Inventory is full. Cannot add new item.');
            return false;
        }

        const existingItem = this.items.get(item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity;
            this.eventTarget.emit(InventoryComponent.EVENT_ITEM_UPDATED, existingItem);
        } else {
            this.items.set(item.id, { ...item });
            this.eventTarget.emit(InventoryComponent.EVENT_ITEM_ADDED, item);
        }
        console.log(`Added ${item.quantity} of item with id: ${item.id}`);
        return true;
    }

    public removeItem(itemId: string, quantity: number = 1): boolean {
        const item = this.items.get(itemId);
        if (!item) {
            console.warn(`Item with id ${itemId} not found in inventory.`);
            return false;
        }

        if (item.quantity < quantity) {
            console.warn(`Not enough quantity to remove. Requested: ${quantity}, Available: ${item.quantity}`);
            return false;
        }

        item.quantity -= quantity;
        this.eventTarget.emit(InventoryComponent.EVENT_ITEM_UPDATED, item);

        if (item.quantity === 0) {
            this.items.delete(itemId);
            this.eventTarget.emit(InventoryComponent.EVENT_ITEM_REMOVED, itemId);
        }

        return true;
    }

    public getItem(itemId: string): InventoryItem | undefined {
        return this.items.get(itemId);
    }

    public getItemsByType(itemType: string): InventoryItem[] {
        return Array.from(this.items.values()).filter(item => item.itemType === itemType);
    }

    public getAllItems(): InventoryItem[] {
        return Array.from(this.items.values());
    }

    public clear(): void {
        this.items.clear();
    }

    public hasItem(itemId: string): boolean {
        return this.items.has(itemId);
    }

    public getItemQuantity(itemId: string): number {
        const item = this.items.get(itemId);
        return item ? item.quantity : 0;
    }
}
