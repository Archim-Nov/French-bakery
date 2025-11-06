import { IngredientType, BreadQuality, Decoration, CoffeeType, CoffeeRecipe } from './types';

export const INGREDIENT_PRICES: Record<IngredientType, number> = {
    [IngredientType.Flour]: 5,
    [IngredientType.Water]: 1,
    [IngredientType.Yeast]: 3,
    [IngredientType.Salt]: 2,
    [IngredientType.Sugar]: 4,
    [IngredientType.RyeFlour]: 6,
    [IngredientType.WholeWheatFlour]: 6,
    [IngredientType.StoneGroundFlour]: 7,
    [IngredientType.NaturalYeast]: 5,
    [IngredientType.SourdoughYeast]: 5,
    [IngredientType.Egg]: 3,
    [IngredientType.Butter]: 8,
    [IngredientType.Milk]: 4,
    [IngredientType.Chocolate]: 10,
    [IngredientType.ApplePuree]: 6,
    [IngredientType.Cinnamon]: 5,
    [IngredientType.Cream]: 7,
    [IngredientType.Raisins]: 6,
    [IngredientType.OliveOil]: 8,
    [IngredientType.Herbs]: 5,
    [IngredientType.ChoppedOlives]: 7,
    [IngredientType.ChocolateChips]: 9,
    [IngredientType.ChoppedWalnuts]: 8,
    [IngredientType.Sesame]: 4,
    [IngredientType.Honey]: 7,
    [IngredientType.SunDriedTomatoes]: 9,
    [IngredientType.BuckwheatFlour]: 7,
    [IngredientType.Oats]: 5,
    [IngredientType.SunflowerSeeds]: 6,
    [IngredientType.FlaxSeeds]: 6,
    // Coffee ingredients are free and not purchased
    [IngredientType.CoffeeBean]: 0,
    [IngredientType.MilkFoam]: 0,
    [IngredientType.Syrup]: 0,
    [IngredientType.ChocolateSauce]: 0,
};

export const BREAD_SALE_PRICE_MODIFIERS: Record<BreadQuality, number> = {
    [BreadQuality.Perfect]: 1.0,
    [BreadQuality.Undercooked]: 0.5,
    [BreadQuality.Burnt]: 0.2,
};

export const KNEAD_TARGET = 15; // Default knead target
export const BAKE_TIME_MS = 10000; // Default ferment time: 10 seconds
export const BAKE_PERFECT_WINDOW_START = 0.7; // 70%
export const BAKE_PERFECT_WINDOW_END = 0.9; // 90%
export const SIMPLE_BAKE_DURATION_MS = 3000; // 3 seconds for simple baking


export const INGREDIENT_EMOJIS: Record<IngredientType, string> = {
    [IngredientType.Flour]: '🌾',
    [IngredientType.Water]: '💧',
    [IngredientType.Yeast]: '🦠',
    [IngredientType.Salt]: '🧂',
    [IngredientType.Sugar]: '🍬',
    [IngredientType.RyeFlour]: '🌱',
    [IngredientType.WholeWheatFlour]: '🍞',
    [IngredientType.StoneGroundFlour]: '🪨',
    [IngredientType.NaturalYeast]: '🌿',
    [IngredientType.SourdoughYeast]: ' sourdough',
    [IngredientType.Egg]: '🥚',
    [IngredientType.Butter]: '🧈',
    [IngredientType.Milk]: '🥛',
    [IngredientType.Chocolate]: '🍫',
    [IngredientType.ApplePuree]: '🍎',
    [IngredientType.Cinnamon]: '🪵',
    [IngredientType.Cream]: '🍦',
    [IngredientType.Raisins]: '🍇',
    [IngredientType.OliveOil]: '🫒',
    [IngredientType.Herbs]: '🌿',
    [IngredientType.ChoppedOlives]: '🫒',
    [IngredientType.ChocolateChips]: '🍪',
    [IngredientType.ChoppedWalnuts]: '🌰',
    [IngredientType.Sesame]: ' Sesame',
    [IngredientType.Honey]: '🍯',
    [IngredientType.SunDriedTomatoes]: '🍅',
    [IngredientType.BuckwheatFlour]: '🌾',
    [IngredientType.Oats]: ' Oats',
    [IngredientType.SunflowerSeeds]: '🌻',
    [IngredientType.FlaxSeeds]: '🟤',
    [IngredientType.CoffeeBean]: '🫘',
    [IngredientType.MilkFoam]: '☁️',
    [IngredientType.Syrup]: '🍮',
    [IngredientType.ChocolateSauce]: '🍫',
};

export const GRIND_TARGET = 10;
export const BREW_TIME_MS = 5000; // 5 seconds
export const COMFORT_PRICE_BONUS_PER_POINT = 0.1; // 1 gold per 10 comfort points

export const COFFEE_RECIPES: CoffeeRecipe[] = [
    // 1. Bitter
    { name: CoffeeType.Espresso, ingredients: { [IngredientType.CoffeeBean]: 3 }, basePrice: 4, icon: '☕' },
    { name: CoffeeType.Ristretto, ingredients: { [IngredientType.CoffeeBean]: 3, [IngredientType.MilkFoam]: 1 }, basePrice: 5, icon: '☕' },
    { name: CoffeeType.Macchiato, ingredients: { [IngredientType.CoffeeBean]: 2, [IngredientType.MilkFoam]: 1 }, basePrice: 5, icon: '☕' },
    // 2. Balanced
    { name: CoffeeType.Cappuccino, ingredients: { [IngredientType.CoffeeBean]: 2, [IngredientType.Milk]: 1, [IngredientType.MilkFoam]: 1 }, basePrice: 7, icon: '☕' },
    { name: CoffeeType.Latte, ingredients: { [IngredientType.CoffeeBean]: 2, [IngredientType.Milk]: 2 }, basePrice: 6, icon: '☕' },
    { name: CoffeeType.FlatWhite, ingredients: { [IngredientType.CoffeeBean]: 2, [IngredientType.Milk]: 3 }, basePrice: 7, icon: '☕' },
    // 3. Milky
    { name: CoffeeType.MilkCoffee, ingredients: { [IngredientType.CoffeeBean]: 1, [IngredientType.Milk]: 3 }, basePrice: 5, icon: '🥛' },
    { name: CoffeeType.SweetMilkCoffee, ingredients: { [IngredientType.CoffeeBean]: 1, [IngredientType.Milk]: 2, [IngredientType.Syrup]: 1 }, basePrice: 6, icon: '🥛' },
    { name: CoffeeType.CreamLatte, ingredients: { [IngredientType.CoffeeBean]: 1, [IngredientType.Milk]: 2, [IngredientType.MilkFoam]: 1 }, basePrice: 6, icon: '🥛' },
    // 4. Sweet
    { name: CoffeeType.VanillaLatte, ingredients: { [IngredientType.CoffeeBean]: 2, [IngredientType.Milk]: 2, [IngredientType.Syrup]: 1 }, basePrice: 8, icon: '🍮' },
    { name: CoffeeType.CaramelLatte, ingredients: { [IngredientType.CoffeeBean]: 2, [IngredientType.Milk]: 1, [IngredientType.Syrup]: 1, [IngredientType.MilkFoam]: 1 }, basePrice: 9, icon: '🍮' },
    { name: CoffeeType.SweetCreamCoffee, ingredients: { [IngredientType.CoffeeBean]: 1, [IngredientType.Milk]: 1, [IngredientType.MilkFoam]: 1, [IngredientType.Syrup]: 1 }, basePrice: 8, icon: '🍮' },
    // 5. Special
    { name: CoffeeType.Mocha, ingredients: { [IngredientType.CoffeeBean]: 2, [IngredientType.Milk]: 1, [IngredientType.ChocolateSauce]: 1 }, basePrice: 8, icon: '🍫' },
    { name: CoffeeType.MochaLatte, ingredients: { [IngredientType.CoffeeBean]: 2, [IngredientType.Milk]: 1, [IngredientType.MilkFoam]: 1, [IngredientType.ChocolateSauce]: 1 }, basePrice: 9, icon: '🍫' },
    { name: CoffeeType.ChocolateMacchiato, ingredients: { [IngredientType.CoffeeBean]: 2, [IngredientType.MilkFoam]: 1, [IngredientType.ChocolateSauce]: 1 }, basePrice: 8, icon: '🍫' },
    { name: CoffeeType.DoubleChocolate, ingredients: { [IngredientType.CoffeeBean]: 1, [IngredientType.Milk]: 1, [IngredientType.Syrup]: 1, [IngredientType.ChocolateSauce]: 1 }, basePrice: 9, icon: '🍫' },
];


export const DECORATIONS: Decoration[] = [
    { id: 'extra_stool', name: 'Extra Stool', type: 'seat', price: 300, icon: '🪑', description: 'Adds an extra seat for a customer. Does not add comfort.', comfortValue: 0, limit: 8 },
    // Standard Decorations
    { id: 'potted_fern', name: 'Potted Fern', type: 'plant', price: 150, icon: '🪴', description: 'A small plant to liven up a corner.', comfortValue: 2, limit: 3 },
    { id: 'comfy_chair', name: 'Comfy Chair', type: 'seat', price: 500, icon: '🛋️', description: 'A comfortable chair for the main seating area.', comfortValue: 5, limit: 2 },
    { id: 'wall_art', name: 'Wall Art', type: 'decor', price: 300, icon: '🖼️', description: 'Enhances the wall\'s aesthetic and artistic atmosphere.', comfortValue: 3, limit: 3 },
    { id: 'table_flowers', name: 'Table Flowers', type: 'decor', price: 250, icon: '💐', description: 'A small vase of flowers for the tables.', comfortValue: 2, limit: 5 },
    { id: 'candle_set', name: 'Candle Set', type: 'decor', price: 350, icon: '🕯️', description: 'Soft candlelight for a romantic evening atmosphere.', comfortValue: 4, limit: 3 },
    { id: 'fairy_lights', name: 'Fairy Lights', type: 'decor', price: 200, icon: '✨', description: 'Hanging lights for a warm, magical feel.', comfortValue: 3, limit: 2 },
    { id: 'window_curtains', name: 'Window Curtains', type: 'decor', price: 300, icon: '🪟', description: 'Softens the light and improves comfort.', comfortValue: 3, limit: 2 },
    { id: 'chalkboard_sign', name: 'Chalkboard Sign', type: 'decor', price: 200, icon: ' chalkboard', description: 'A welcome sign at the entrance to improve friendliness.', comfortValue: 2, limit: 1 },
    { id: 'music_player', name: 'Music Player', type: 'decor', price: 600, icon: '🎵', description: 'Provides music for the entire hall, creating atmosphere.', comfortValue: 6, limit: 1 },
    { id: 'seasonal_garland', name: 'Seasonal Garland', type: 'decor', price: 450, icon: '🎉', description: 'Limited decoration used during festivals.', comfortValue: 4, limit: 2 },
    // Large Premium Decorations
    { id: 'chandelier', name: 'Chandelier', type: 'decor', price: 1200, icon: '💎', description: 'A high-end chandelier hanging in the center.', comfortValue: 12, limit: 1 },
    { id: 'fireplace', name: 'Fireplace', type: 'decor', price: 1000, icon: '🔥', description: 'Provides warmth and a visual focus in winter.', comfortValue: 10, limit: 1 },
    { id: 'indoor_fountain', name: 'Indoor Fountain', type: 'decor', price: 1300, icon: '⛲', description: 'The sound of flowing water brings a calm, relaxing atmosphere.', comfortValue: 14, limit: 1 },
    { id: 'vintage_piano', name: 'Vintage Piano', type: 'decor', price: 1500, icon: '🎹', description: 'A high-end decoration that may attract special customers.', comfortValue: 15, limit: 1 },
    { id: 'large_plant_wall', name: 'Large Plant Wall', type: 'plant', price: 900, icon: '🌿', description: 'A full wall of greenery, injecting nature into the café.', comfortValue: 10, limit: 1 },
];