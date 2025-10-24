
export type GamePhase = 'night' | 'day';

export enum IngredientType {
    Flour = 'flour',
    Water = 'water',
    Yeast = 'yeast',
    Salt = 'salt',
    Sugar = 'sugar',
}

export type Ingredients = Record<IngredientType, number>;

export enum BreadQuality {
    Undercooked = 'undercooked',
    Perfect = 'perfect',
    Burnt = 'burnt',
}

export interface Bread {
    id: string;
    quality: BreadQuality;
    name: string;
    price: number;
}

export interface Customer {
    id: string;
    name: string;
    personality: string;
    dialogue: string;
    avatarUrl: string;
}

export enum BakingStep {
    Buy = 'buy',
    Mix = 'mix',
    Knead = 'knead',
    Bake = 'bake',
    Finished = 'finished'
}

export type DragItem = {
    type: 'ingredient' | 'bread';
    id: string;
}
