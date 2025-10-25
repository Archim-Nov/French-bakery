import React, { useState, useCallback, useEffect } from 'react';
import type { Ingredients, Bread, DragItem } from '../types';
import { IngredientType, BakingStep, BreadQuality } from '../types';
import { INGREDIENT_PRICES, KNEAD_TARGET, BAKE_TIME_MS, BAKE_PERFECT_START_MS, BAKE_PERFECT_END_MS, BREAD_SALE_PRICES, INGREDIENT_EMOJIS } from '../constants';

interface NightSceneProps {
    gold: number;
    inventory: { ingredients: Ingredients; breads: Bread[] };
    updateGold: (amount: number) => void;
    updateInventory: (newInventory: { ingredients: Ingredients; breads: Bread[] }) => void;
    onEndNight: () => void;
}

const NightScene: React.FC<NightSceneProps> = ({ gold, inventory, updateGold, updateInventory, onEndNight }) => {
    const [step, setStep] = useState<BakingStep>(BakingStep.Buy);
    const [mixingBowl, setMixingBowl] = useState<IngredientType[]>([]);
    const [kneadCount, setKneadCount] = useState(0);
    const [bakeProgress, setBakeProgress] = useState(0);
    const [isBaking, setIsBaking] = useState(false);

    const handleBuyIngredient = (ingredient: IngredientType) => {
        const price = INGREDIENT_PRICES[ingredient];
        if (gold >= price) {
            updateGold(-price);
            const newIngredients = { ...inventory.ingredients };
            newIngredients[ingredient] = (newIngredients[ingredient] || 0) + 1;
            updateInventory({ ...inventory, ingredients: newIngredients });
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, ingredient: IngredientType) => {
        if (inventory.ingredients[ingredient] > 0) {
            const dragItem: DragItem = { type: 'ingredient', id: ingredient };
            e.dataTransfer.setData('application/json', JSON.stringify(dragItem));
            e.currentTarget.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const item: DragItem = JSON.parse(data);

        if (item.type === 'ingredient' && inventory.ingredients[item.id as IngredientType] > 0) {
            const ingredient = item.id as IngredientType;
            setMixingBowl(prev => [...prev, ingredient]);
            const newIngredients = { ...inventory.ingredients };
            newIngredients[ingredient]--;
            updateInventory({ ...inventory, ingredients: newIngredients });
        }
        e.currentTarget.classList.remove('border-green-500');
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('border-green-500');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('border-green-500');
    };

    const handleStartMixing = () => {
        // Basic recipe check
        if (mixingBowl.includes(IngredientType.Flour) && mixingBowl.includes(IngredientType.Water) && mixingBowl.includes(IngredientType.Yeast)) {
            setStep(BakingStep.Knead);
        } else {
            alert("You need at least Flour, Water, and Yeast to make bread!");
            // Return ingredients
            const newIngredients = { ...inventory.ingredients };
            mixingBowl.forEach(ing => newIngredients[ing]++);
            updateInventory({ ...inventory, ingredients: newIngredients });
            setMixingBowl([]);
        }
    };

    const handleKnead = () => {
        if (kneadCount < KNEAD_TARGET) {
            setKneadCount(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (kneadCount >= KNEAD_TARGET) {
            const timer = setTimeout(() => setStep(BakingStep.Bake), 1000);
            return () => clearTimeout(timer);
        }
    }, [kneadCount]);

    useEffect(() => {
        let interval: number;
        if (isBaking) {
            interval = window.setInterval(() => {
                setBakeProgress(prev => {
                    const newProgress = prev + 100;
                    if (newProgress >= BAKE_TIME_MS + 1000) {
                        handleFinishBaking(newProgress);
                        return prev;
                    }
                    return newProgress;
                });
            }, 100);
        }
        return () => window.clearInterval(interval);
    }, [isBaking]);

    const handleFinishBaking = (currentTime = bakeProgress) => {
        setIsBaking(false);
        setBakeProgress(0);

        let quality: BreadQuality;
        if (currentTime < BAKE_PERFECT_START_MS) {
            quality = BreadQuality.Undercooked;
        } else if (currentTime <= BAKE_PERFECT_END_MS) {
            quality = BreadQuality.Perfect;
        } else {
            quality = BreadQuality.Burnt;
        }

        const newBread: Bread = {
            id: `bread-${Date.now()}`,
            quality,
            name: `${quality.charAt(0).toUpperCase() + quality.slice(1)} Loaf`,
            price: BREAD_SALE_PRICES[quality],
        };

        updateInventory({ ...inventory, breads: [...inventory.breads, newBread] });
        
        // Reset for next batch
        setMixingBowl([]);
        setKneadCount(0);
        setStep(BakingStep.Finished);
    };

    const getBreadColor = () => {
        if (bakeProgress < BAKE_PERFECT_START_MS) {
            const progress = bakeProgress / BAKE_PERFECT_START_MS;
            const lightness = 100 - progress * 20; // from 100 to 80
            return `hsl(40, 100%, ${lightness}%)`; // Pale yellow
        } else if (bakeProgress <= BAKE_PERFECT_END_MS) {
            return '#d2a679'; // Golden brown
        } else {
            const progress = (bakeProgress - BAKE_PERFECT_END_MS) / (BAKE_TIME_MS - BAKE_PERFECT_END_MS);
            const lightness = 60 - progress * 40; // from 60 to 20
            return `hsl(25, 50%, ${lightness}%)`; // Burnt
        }
    };

    const renderStep = () => {
        switch (step) {
            case BakingStep.Buy:
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4 text-stone-300">Ingredient Shop</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {Object.values(IngredientType).map(ing => (
                                <button key={ing} onClick={() => handleBuyIngredient(ing)} className="p-4 bg-amber-200 rounded-lg shadow-md hover:bg-amber-300 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-stone-800" disabled={gold < INGREDIENT_PRICES[ing]}>
                                    <span className="text-4xl">{INGREDIENT_EMOJIS[ing]}</span>
                                    <p className="font-bold capitalize">{ing}</p>
                                    <p className="text-sm">🪙 {INGREDIENT_PRICES[ing]}</p>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(BakingStep.Mix)} className="mt-8 px-8 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition-colors">Go to Mixing Station</button>
                    </div>
                );
            case BakingStep.Mix:
                return (
                     <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-1/3">
                            <h2 className="text-2xl font-bold mb-2">Your Ingredients</h2>
                             <div className="grid grid-cols-3 gap-2 p-2 bg-stone-800/50 rounded-lg">
                                 {Object.values(IngredientType).map(ing => (
                                     <div key={ing} draggable={inventory.ingredients[ing] > 0} onDragStart={(e) => handleDragStart(e, ing)} onDragEnd={handleDragEnd} className={`p-3 text-center rounded-md ${inventory.ingredients[ing] > 0 ? 'bg-amber-100 cursor-grab active:cursor-grabbing' : 'bg-stone-500 opacity-50'}`}>
                                         <span className="text-3xl">{INGREDIENT_EMOJIS[ing]}</span>
                                         <p className="font-semibold text-sm text-stone-800">x{inventory.ingredients[ing] || 0}</p>
                                     </div>
                                 ))}
                            </div>
                        </div>
                        <div className="w-full md:w-2/3 flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-2">Mixing Bowl</h2>
                             <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className="w-full h-48 bg-stone-500/80 rounded-full flex items-center justify-center border-4 border-dashed border-stone-400 transition-colors">
                                 <p className="text-stone-300 text-lg">Drop ingredients here</p>
                                 <div className="flex text-4xl gap-2">
                                    {mixingBowl.map((ing, i) => <span key={i}>{INGREDIENT_EMOJIS[ing]}</span>)}
                                 </div>
                             </div>
                            {mixingBowl.length > 0 && <button onClick={handleStartMixing} className="mt-4 px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-colors">Mix Dough</button>}
                        </div>
                    </div>
                );
            case BakingStep.Knead:
                 return (
                    <div className="text-center">
                         <h2 className="text-3xl font-bold mb-4">Knead the Dough!</h2>
                         <p className="mb-4">Click and drag on the dough to knead it.</p>
                        <div className="w-48 h-48 bg-amber-200 rounded-full mx-auto flex items-center justify-center cursor-pointer active:scale-95 transition-transform" onMouseDown={handleKnead} onMouseMove={(e) => e.buttons === 1 && handleKnead()}>
                             <span className="text-6xl">🍞</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                             <div className="bg-green-500 h-4 rounded-full" style={{ width: `${(kneadCount / KNEAD_TARGET) * 100}%` }}></div>
                        </div>
                        {kneadCount >= KNEAD_TARGET && <p className="mt-4 text-xl font-bold text-green-300 animate-pulse">Ready for the oven!</p>}
                    </div>
                 );
             case BakingStep.Bake:
                 return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Baking Time!</h2>
                        <p className="mb-4">Take it out when it's golden brown!</p>
                        <div className="w-64 h-40 bg-gray-800 rounded-lg mx-auto flex items-center justify-center p-4" style={{border: '10px solid #4a5568'}}>
                            <div className="w-24 h-24 rounded-full" style={{ backgroundColor: getBreadColor() }}></div>
                        </div>
                        <div className="w-full bg-gray-400 rounded-full h-2.5 mt-4">
                            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${(bakeProgress / BAKE_TIME_MS) * 100}%` }}></div>
                            <div className="relative h-0">
                                <div className="absolute bg-green-500 h-4 w-1 -bottom-1" style={{left: `${(BAKE_PERFECT_START_MS / BAKE_TIME_MS) * 100}%`}}></div>
                                <div className="absolute bg-green-500 h-4 w-1 -bottom-1" style={{left: `${(BAKE_PERFECT_END_MS / BAKE_TIME_MS) * 100}%`}}></div>
                            </div>
                        </div>
                        {!isBaking && <button onClick={() => setIsBaking(true)} className="mt-4 px-8 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700">Start Baking</button>}
                        {isBaking && <button onClick={() => handleFinishBaking()} className="mt-4 px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700">Take Out!</button>}
                    </div>
                );
            case BakingStep.Finished:
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4 text-green-300">Baking Complete!</h2>
                        <p className="mb-4">You've baked a new loaf of bread.</p>
                        <button onClick={() => setStep(BakingStep.Buy)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-colors">Bake Another</button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-stone-800 text-white p-4 sm:p-8 flex flex-col" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-wood.png")'}}>
            <header className="flex justify-between items-center mb-8 p-4 bg-black/30 rounded-lg">
                <h1 className="text-4xl font-bold">🌙 Night Phase: Baking</h1>
                <div className="flex items-center gap-4 text-2xl">
                    <span className="font-bold">🪙 {gold}</span>
                    <button onClick={onEndNight} className="px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors">Start the Day ☀️</button>
                </div>
            </header>
            <main className="flex-grow bg-stone-700/70 p-6 rounded-2xl shadow-inner">
                {renderStep()}
            </main>
        </div>
    );
};

export default NightScene;