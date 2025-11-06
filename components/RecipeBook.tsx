import React from 'react';
import type { Recipe } from '../types';
import { INGREDIENT_EMOJIS } from '../constants';
import { IngredientType } from '../types';

interface RecipeBookProps {
    recipes: Recipe[];
    onClose: () => void;
}

const RecipeBook: React.FC<RecipeBookProps> = ({ recipes, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-amber-50 rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col" style={{border: '10px solid #a16207'}}>
                <header className="p-4 flex justify-between items-center border-b-4 border-amber-800">
                    <h2 className="text-3xl font-bold text-amber-900">📖 Recipe Book</h2>
                    <button onClick={onClose} className="text-4xl font-bold text-amber-900 hover:text-red-600 transition-colors">&times;</button>
                </header>
                <main className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recipes.map(recipe => (
                            <div key={recipe.name} className="bg-white/70 p-4 rounded-lg border-2 border-amber-700">
                                <h3 className="text-xl font-bold text-stone-800 mb-2">{recipe.name}</h3>
                                <ul className="mb-2">
                                    {Object.entries(recipe.ingredients).map(([ingredient, amount]) => (
                                        <li key={ingredient} className="flex items-center gap-2 text-stone-700">
                                            <span className="text-2xl">{INGREDIENT_EMOJIS[ingredient as IngredientType]}</span>
                                            <span className="capitalize">{ingredient.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <span>x{amount}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-right font-bold text-amber-800">Base Price: 🪙 {recipe.basePrice}</p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RecipeBook;