
import { IngredientType, BreadQuality } from './types';

export const INGREDIENT_PRICES: Record<IngredientType, number> = {
    [IngredientType.Flour]: 5,
    [IngredientType.Water]: 1,
    [IngredientType.Yeast]: 3,
    [IngredientType.Salt]: 2,
    [IngredientType.Sugar]: 4,
};

export const BREAD_SALE_PRICES: Record<BreadQuality, number> = {
    [BreadQuality.Perfect]: 20,
    [BreadQuality.Undercooked]: 5,
    [BreadQuality.Burnt]: 2,
};

export const KNEAD_TARGET = 15;
export const BAKE_TIME_MS = 10000; // 10 seconds
export const BAKE_PERFECT_START_MS = 7000;
export const BAKE_PERFECT_END_MS = 9000;

export const INGREDIENT_EMOJIS: Record<IngredientType, string> = {
    [IngredientType.Flour]: '🌾',
    [IngredientType.Water]: '💧',
    [IngredientType.Yeast]: '🦠',
    [IngredientType.Salt]: '🧂',
    [IngredientType.Sugar]: '🍬',
};
