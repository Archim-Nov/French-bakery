import React, { useState } from 'react';
import type { Customer, Recipe, CoffeeRecipe, Decoration, GamePhase } from '../types';
import { INGREDIENT_EMOJIS, DECORATIONS } from '../constants';
import { IngredientType } from '../types';

interface PhoneProps {
    townsfolk: Customer[];
    breadRecipes: Recipe[];
    coffeeRecipes: CoffeeRecipe[];
    purchasedDecorations: string[];
    gold: number;
    gamePhase: GamePhase;
    onStartNightChat: (customer: Customer) => void;
    onBuyDecoration: (decoration: Decoration) => void;
}

type PhoneApp = 'home' | 'contacts' | 'baking' | 'coffee' | 'decor';

const Phone: React.FC<PhoneProps> = (props) => {
    const { townsfolk, breadRecipes, coffeeRecipes, purchasedDecorations, gold, gamePhase, onStartNightChat, onBuyDecoration } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [activeApp, setActiveApp] = useState<PhoneApp>('home');

    const openApp = (app: PhoneApp) => {
        setActiveApp(app);
        setIsOpen(true);
    };

    const closePhone = () => {
        setIsOpen(false);
        // Reset to home screen after a short delay for the closing animation
        setTimeout(() => setActiveApp('home'), 300);
    };
    
    const goHome = () => {
        setActiveApp('home');
    };

    const renderAppContent = () => {
        switch (activeApp) {
            case 'contacts':
                const sortedTownsfolk = [...townsfolk].sort((a, b) => b.favorability - a.favorability || a.name.localeCompare(b.name));
                return (
                    <div className="bg-blue-100 h-full">
                        <header className="p-3 bg-blue-500 text-white text-center font-bold text-xl sticky top-0">Contacts</header>
                        <ul className="p-2 overflow-y-auto" style={{height: 'calc(100% - 48px)'}}>
                            {sortedTownsfolk.map(character => (
                                <li key={character.id} className="flex items-center gap-3 p-2 mb-2 bg-white/80 rounded-lg shadow-sm">
                                    <img src={character.avatarUrl} alt={character.name} className="w-12 h-12 rounded-full border-2 border-blue-300 shrink-0 object-cover" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-blue-900">{character.name}</p>
                                        <div className="mt-1 text-red-500" title={`Favorability: ${character.favorability}`}>
                                            {character.favorability > 0 ? '❤️'.repeat(character.favorability) : '🤍'}
                                        </div>
                                    </div>
                                    {gamePhase === 'night' && character.favorability >= 3 && (
                                        <button onClick={() => onStartNightChat(character)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600">
                                            Chat
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            case 'baking':
                return (
                    <div className="bg-amber-100 h-full">
                        <header className="p-3 bg-amber-500 text-white text-center font-bold text-xl sticky top-0">Baking Recipes</header>
                         <main className="p-2 overflow-y-auto" style={{height: 'calc(100% - 48px)'}}>
                            <div className="grid grid-cols-1 gap-3">
                                {breadRecipes.map(recipe => (
                                    <div key={recipe.name} className="bg-white/70 p-3 rounded-lg border border-amber-300">
                                        <h3 className="font-bold text-amber-900">{recipe.name}</h3>
                                        <ul className="text-sm">
                                            {Object.entries(recipe.ingredients).map(([ingredient, amount]) => (
                                                <li key={ingredient} className="flex items-center gap-1 text-stone-700">
                                                    <span className="text-lg">{INGREDIENT_EMOJIS[ingredient as IngredientType]}</span>
                                                    <span className="capitalize text-xs flex-grow">{ingredient.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span>x{amount}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </main>
                    </div>
                );
            case 'coffee':
                return (
                    <div className="bg-stone-200 h-full">
                        <header className="p-3 bg-stone-600 text-white text-center font-bold text-xl sticky top-0">Coffee Recipes</header>
                        <main className="p-2 overflow-y-auto" style={{height: 'calc(100% - 48px)'}}>
                            <div className="grid grid-cols-1 gap-3">
                                {coffeeRecipes.map(recipe => (
                                    <div key={recipe.name} className="bg-white/90 p-3 rounded-lg border border-stone-300">
                                        <h3 className="font-bold text-stone-800 flex items-center gap-2">
                                            <span className="text-xl">{recipe.icon}</span> {recipe.name}
                                        </h3>
                                        <ul className="text-sm pl-2">
                                            {Object.entries(recipe.ingredients).map(([ingredient, amount]) => (
                                                 <li key={ingredient} className="flex items-center gap-1 text-stone-700">
                                                    <span className="text-lg w-6 text-center">{INGREDIENT_EMOJIS[ingredient as IngredientType]}</span>
                                                    <span className="capitalize flex-grow text-xs">{ingredient.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span className="font-bold">x {amount}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </main>
                    </div>
                );
            case 'decor':
                 const purchasedCounts = purchasedDecorations.reduce((acc, id) => {
                    acc[id] = (acc[id] || 0) + 1;
                    return acc;
                 }, {} as Record<string, number>);
                return (
                     <div className="bg-green-100 h-full">
                        <header className="p-3 bg-green-600 text-white text-center font-bold text-xl sticky top-0">Decor Shop</header>
                        <main className="p-2 overflow-y-auto" style={{height: 'calc(100% - 48px)'}}>
                            <div className="grid grid-cols-1 gap-3">
                                {DECORATIONS.map(item => {
                                    const count = purchasedCounts[item.id] || 0;
                                    const isSoldOut = count >= item.limit;
                                    const canAfford = gold >= item.price;
                                    return (
                                        <div key={item.id} className="bg-white/80 p-3 rounded-lg shadow-sm flex gap-3">
                                            <span className="text-4xl">{item.icon}</span>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-green-900">{item.name}</h3>
                                                    <span className="text-xs font-bold bg-black/10 px-2 py-0.5 rounded-full">{count}/{item.limit}</span>
                                                </div>
                                                <p className="text-xs text-stone-600">{item.description}</p>
                                                <p className="text-xs text-amber-600 font-bold">💖 +{item.comfortValue} Comfort</p>
                                                {isSoldOut ? (
                                                    <button disabled className="w-full mt-2 py-1 text-sm bg-gray-400 text-white font-bold rounded-lg cursor-not-allowed">Sold Out</button>
                                                ) : (
                                                    <button onClick={() => onBuyDecoration(item)} disabled={!canAfford} className="w-full mt-2 py-1 text-sm bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 disabled:bg-gray-400">
                                                        Buy for 🪙 {item.price}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </main>
                    </div>
                );
            default: // Home screen
                const apps = [
                    { name: 'Contacts', icon: '👥', app: 'contacts' as PhoneApp, color: 'bg-blue-500' },
                    { name: 'Baking Recipes', icon: '🍞', app: 'baking' as PhoneApp, color: 'bg-amber-500' },
                    { name: 'Coffee Recipes', icon: '☕', app: 'coffee' as PhoneApp, color: 'bg-stone-600' },
                    { name: 'Decor Shop', icon: '🛋️', app: 'decor' as PhoneApp, color: 'bg-green-600' },
                ];
                return (
                    <div className="p-4 grid grid-cols-2 gap-4 bg-gray-800 h-full">
                        {apps.map(app => (
                            <button key={app.name} onClick={() => openApp(app.app)} className={`p-4 rounded-2xl text-white font-bold flex flex-col items-center justify-center gap-2 transform hover:scale-105 transition-transform ${app.color}`}>
                                <span className="text-4xl">{app.icon}</span>
                                <span className="text-sm">{app.name}</span>
                            </button>
                        ))}
                    </div>
                );
        }
    };
    
    return (
        <>
            <div className={`fixed bottom-4 left-4 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-[-200%]' : 'translate-x-0'}`}>
                <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-gray-800/80 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-gray-900">
                    📱
                </button>
            </div>

            <div className={`fixed inset-0 md:inset-auto md:bottom-4 md:left-4 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} >
                <div className="bg-black rounded-3xl shadow-2xl p-2 w-full h-full md:w-[320px] md:h-[600px] flex flex-col" style={{border: '4px solid #333'}}>
                    {/* Screen Area */}
                    <main className="flex-grow bg-gray-200 rounded-xl overflow-hidden relative">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-b-lg"></div>
                        <div className="pt-4 h-full">
                             {renderAppContent()}
                        </div>
                    </main>
                     {/* Home button bar */}
                    <footer className="shrink-0 h-12 flex items-center justify-center p-1">
                        <button onClick={activeApp === 'home' ? closePhone : goHome} className="w-24 h-2 bg-gray-500 rounded-full hover:bg-gray-400"></button>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default Phone;
