import { IngredientType, Recipe } from './types';

export const BREAD_RECIPES: Recipe[] = [
    // 1. Classic Staples (Easier)
    {
        name: 'Baguette',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Water]: 1, [IngredientType.Salt]: 1, [IngredientType.Yeast]: 1 },
        basePrice: 20,
        kneadTarget: 12,
        bakeTimeMs: 9000
    },
    {
        name: 'Pain de Campagne',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.RyeFlour]: 1, [IngredientType.Water]: 1, [IngredientType.Salt]: 1, [IngredientType.NaturalYeast]: 1 },
        basePrice: 25,
        kneadTarget: 16,
        bakeTimeMs: 11000
    },
    {
        name: 'Pain Complet',
        ingredients: { [IngredientType.WholeWheatFlour]: 2, [IngredientType.Water]: 1, [IngredientType.Yeast]: 1, [IngredientType.Salt]: 1 },
        basePrice: 22,
        kneadTarget: 15,
        bakeTimeMs: 12000
    },
    {
        name: 'Pain Poilâne',
        ingredients: { [IngredientType.StoneGroundFlour]: 1, [IngredientType.Water]: 1, [IngredientType.NaturalYeast]: 1, [IngredientType.Salt]: 1, [IngredientType.Honey]: 1 },
        basePrice: 30,
        kneadTarget: 18,
        bakeTimeMs: 13000
    },
    {
        name: 'Pain de Seigle',
        ingredients: { [IngredientType.RyeFlour]: 2, [IngredientType.Water]: 1, [IngredientType.Salt]: 1, [IngredientType.SourdoughYeast]: 1 },
        basePrice: 28,
        kneadTarget: 18,
        bakeTimeMs: 14000
    },
    // 2. Sweet & Buttery (Medium)
    {
        name: 'Brioche',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Egg]: 1, [IngredientType.Butter]: 2, [IngredientType.Sugar]: 1, [IngredientType.Yeast]: 1 },
        basePrice: 35,
        kneadTarget: 25,
        bakeTimeMs: 10000
    },
    {
        name: 'Croissant',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Butter]: 2, [IngredientType.Sugar]: 1, [IngredientType.Milk]: 1, [IngredientType.Yeast]: 1 },
        basePrice: 38,
        kneadTarget: 22,
        bakeTimeMs: 11000
    },
    {
        name: 'Pain au Chocolat',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Butter]: 2, [IngredientType.Chocolate]: 1, [IngredientType.Sugar]: 1, [IngredientType.Milk]: 1 },
        basePrice: 42,
        kneadTarget: 22,
        bakeTimeMs: 11000
    },
    {
        name: 'Chausson aux Pommes',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Butter]: 1, [IngredientType.ApplePuree]: 1, [IngredientType.Sugar]: 1, [IngredientType.Cinnamon]: 1 },
        basePrice: 32,
        kneadTarget: 18,
        bakeTimeMs: 10000
    },
    {
        name: 'Pain aux Raisins',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Butter]: 1, [IngredientType.Cream]: 1, [IngredientType.Raisins]: 1, [IngredientType.Sugar]: 1 },
        basePrice: 34,
        kneadTarget: 20,
        bakeTimeMs: 10000
    },
    // 3. Special Flavors (Medium-Hard)
    {
        name: 'Fougasse',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.OliveOil]: 1, [IngredientType.Herbs]: 1, [IngredientType.Salt]: 1, [IngredientType.ChoppedOlives]: 1 },
        basePrice: 40,
        kneadTarget: 15,
        bakeTimeMs: 8000
    },
    {
        name: 'Pain Viennois',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Butter]: 1, [IngredientType.Milk]: 1, [IngredientType.Sugar]: 1, [IngredientType.ChocolateChips]: 1 },
        basePrice: 36,
        kneadTarget: 18,
        bakeTimeMs: 9500
    },
    {
        name: 'Pain aux Noix',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Water]: 1, [IngredientType.Salt]: 1, [IngredientType.ChoppedWalnuts]: 1, [IngredientType.Yeast]: 1 },
        basePrice: 33,
        kneadTarget: 16,
        bakeTimeMs: 12000
    },
    {
        name: 'Pain d’Épi',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Water]: 1, [IngredientType.Salt]: 1, [IngredientType.Yeast]: 1, [IngredientType.Sesame]: 1 },
        basePrice: 24,
        kneadTarget: 14,
        bakeTimeMs: 9000
    },
    {
        name: 'Pain au Levain',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Water]: 1, [IngredientType.NaturalYeast]: 1, [IngredientType.Salt]: 1, [IngredientType.Honey]: 1 },
        basePrice: 28,
        kneadTarget: 20,
        bakeTimeMs: 15000
    },
    // 4. Regional & Creative (Hard)
    {
        name: 'Pain Provençal',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.OliveOil]: 1, [IngredientType.SunDriedTomatoes]: 1, [IngredientType.Herbs]: 1, [IngredientType.Salt]: 1 },
        basePrice: 45,
        kneadTarget: 17,
        bakeTimeMs: 11000
    },
    {
        name: 'Pain Brie',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Water]: 1, [IngredientType.Salt]: 1, [IngredientType.Butter]: 1, [IngredientType.Yeast]: 1 },
        basePrice: 26,
        kneadTarget: 15,
        bakeTimeMs: 10000
    },
    {
        name: 'Pain de Mie',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Milk]: 1, [IngredientType.Butter]: 1, [IngredientType.Sugar]: 1, [IngredientType.Yeast]: 1 },
        basePrice: 30,
        kneadTarget: 18,
        bakeTimeMs: 12000
    },
    {
        name: 'Pain Breton',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.BuckwheatFlour]: 1, [IngredientType.Water]: 1, [IngredientType.Salt]: 1, [IngredientType.Cream]: 1 },
        basePrice: 38,
        kneadTarget: 16,
        bakeTimeMs: 13000
    },
    {
        name: 'Pain aux Céréales',
        ingredients: { [IngredientType.Flour]: 1, [IngredientType.Oats]: 1, [IngredientType.SunflowerSeeds]: 1, [IngredientType.FlaxSeeds]: 1, [IngredientType.Yeast]: 1 },
        basePrice: 40,
        kneadTarget: 19,
        bakeTimeMs: 14000
    }
];