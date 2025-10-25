import { Content } from "@google/genai";

export type GamePhase = 'night' | 'day' | 'summary';

export enum Season {
    Spring = 'Spring',
    Summer = 'Summer',
    Autumn = 'Autumn',
    Winter = 'Winter',
}

export interface GameDate {
    year: number;
    season: Season;
    day: number;
}

export interface FavorabilityChange {
    customerId: string;
    customerName: string;
    newLevel: number;
    avatarUrl: string;
}

export enum IngredientType {
    // Original
    Flour = 'flour',
    Water = 'water',
    Yeast = 'yeast',
    Salt = 'salt',
    Sugar = 'sugar',

    // New
    RyeFlour = 'ryeFlour',
    WholeWheatFlour = 'wholeWheatFlour',
    StoneGroundFlour = 'stoneGroundFlour',
    NaturalYeast = 'naturalYeast',
    SourdoughYeast = 'sourdoughYeast',
    Egg = 'egg',
    Butter = 'butter',
    Milk = 'milk',
    Chocolate = 'chocolate',
    ApplePuree = 'applePuree',
    Cinnamon = 'cinnamon',
    Cream = 'cream',
    Raisins = 'raisins',
    OliveOil = 'oliveOil',
    Herbs = 'herbs',
    ChoppedOlives = 'choppedOlives',
    ChocolateChips = 'chocolateChips',
    ChoppedWalnuts = 'choppedWalnuts',
    Sesame = 'sesame',
    Honey = 'honey',
    SunDriedTomatoes = 'sunDriedTomatoes',
    BuckwheatFlour = 'buckwheatFlour',
    Oats = 'oats',
    SunflowerSeeds = 'sunflowerSeeds',
    FlaxSeeds = 'flaxSeeds',
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

export type Mood = 'happy' | 'stressed' | 'thoughtful' | 'grumpy' | 'energetic';

export interface Customer {
    id: string;
    name: string;
    personality: string;
    dialogue: string;
    coffeeDialogue: string;
    avatarUrl: string;
    favorability: number;
    conversation: { role: 'player' | 'customer'; text: string }[];
    mood?: Mood;
}

export enum BakingStep {
    Buy = 'buy',
    Mix = 'mix',
    Knead = 'knead',
    Bake = 'bake',
    Finished = 'finished'
}

export enum CoffeeStep {
    Idle,
    Grind,
    Mix,
    Brew,
    Ready,
}

export enum CoffeeType {
    Espresso = 'Espresso',
    CafeAuLait = 'Cafe au Lait',
    Cappuccino = 'Cappuccino',
    Mocha = 'Mocha',
    LatteMacchiato = 'Latte Macchiato',
}

export interface CoffeeRecipe {
    name: CoffeeType;
    ingredients: Partial<Record<IngredientType, number>>;
    basePrice: number;
    icon: string;
}

export type DragItem = {
    type: 'ingredient' | 'bread' | 'coffee';
    id: string;
}

export interface Recipe {
    name: string;
    ingredients: Partial<Record<IngredientType, number>>;
    basePrice: number;
    kneadTarget?: number;
    bakeTimeMs?: number;
}

export interface Decoration {
    id: string;
    name: string;
    type: 'seat' | 'plant' | 'umbrella' | 'decor';
    price: number;
    icon: string;
    description: string;
    comfortValue: number;
    limit: number;
}