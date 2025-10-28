import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Ingredients, Bread, DragItem, Recipe, Decoration, Customer, GameDate } from '../types';
import { IngredientType, BakingStep, BreadQuality } from '../types';
import { INGREDIENT_PRICES, KNEAD_TARGET, BAKE_TIME_MS, BAKE_PERFECT_WINDOW_START, BAKE_PERFECT_WINDOW_END, BREAD_SALE_PRICE_MODIFIERS, INGREDIENT_EMOJIS, DECORATIONS, SIMPLE_BAKE_DURATION_MS } from '../constants';
import { BREAD_RECIPES } from '../recipes';
import RecipeBook from './RecipeBook';
import ChatModal from './ChatModal';

interface NightSceneProps {
    gold: number;
    inventory: { ingredients: Ingredients; breads: Bread[] };
    townsfolk: Customer[];
    purchasedDecorations: string[];
    nightChatCustomer: Customer | null;
    isReplying: boolean;
    gameDate: GameDate;
    updateGold: (amount: number) => void;
    updateInventory: (newInventory: { ingredients: Ingredients; breads: Bread[] }) => void;
    onEndNight: () => void;
    onBuyDecoration: (decoration: Decoration) => void;
    onStartNightChat: (customer: Customer) => void;
    onEndNightChat: () => void;
    onSendMessage: (message: string) => void;
}

type NightTab = 'baking' | 'decorating' | 'contacts';

const getWeekday = (day: number): string => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekdays[(day - 1) % 7];
};

const formatDate = (date: GameDate): string => {
    return `Year ${date.year}, ${date.season} ${date.day} (${getWeekday(date.day)})`;
};

const NightScene: React.FC<NightSceneProps> = (props) => {
    const { gold, inventory, townsfolk, purchasedDecorations, nightChatCustomer, isReplying, gameDate, updateGold, updateInventory, onEndNight, onBuyDecoration, onStartNightChat, onEndNightChat, onSendMessage } = props;
    const [step, setStep] = useState<BakingStep>(BakingStep.Buy);
    const [mixingBowl, setMixingBowl] = useState<IngredientType[]>([]);
    const [kneadCount, setKneadCount] = useState(0);
    const [bakeProgress, setBakeProgress] = useState(0);
    const [isBaking, setIsBaking] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
    const [isRecipeBookOpen, setIsRecipeBookOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<NightTab>('baking');
    const [recipeHint, setRecipeHint] = useState<string | null>(null);

    // Fermentation mini-game state (new)
    const [fermentProgress, setFermentProgress] = useState(0);
    const [isFermenting, setIsFermenting] = useState(false);
    const [fermentationOutcome, setFermentationOutcome] = useState<BreadQuality | null>(null);

    // Dynamic baking parameters based on recipe (now for fermentation)
    const kneadTarget = currentRecipe?.kneadTarget || KNEAD_TARGET;
    const totalFermentTime = currentRecipe?.bakeTimeMs || BAKE_TIME_MS;
    const perfectFermentStart = totalFermentTime * BAKE_PERFECT_WINDOW_START;
    const perfectFermentEnd = totalFermentTime * BAKE_PERFECT_WINDOW_END;


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

    const handleAddIngredientToBowl = (ingredient: IngredientType) => {
        if (inventory.ingredients[ingredient] > 0) {
            setMixingBowl(prev => [...prev, ingredient]);
            const newIngredients = { ...inventory.ingredients };
            newIngredients[ingredient]--;
            updateInventory({ ...inventory, ingredients: newIngredients });
        }
    };
    
    const handleRemoveIngredientFromBowl = (indexToRemove: number) => {
        const ingredientToRemove = mixingBowl[indexToRemove];
        if (!ingredientToRemove) return;
    
        // Remove from bowl
        const newMixingBowl = [...mixingBowl];
        newMixingBowl.splice(indexToRemove, 1);
        setMixingBowl(newMixingBowl);
    
        // Return to inventory
        const newIngredients = { ...inventory.ingredients };
        newIngredients[ingredientToRemove] = (newIngredients[ingredientToRemove] || 0) + 1;
        updateInventory({ ...inventory, ingredients: newIngredients });
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const item: DragItem = JSON.parse(data);

        if (item.type === 'ingredient' && inventory.ingredients[item.id as IngredientType] > 0) {
            handleAddIngredientToBowl(item.id as IngredientType);
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
    
    const handleClearBowl = () => {
        if (mixingBowl.length === 0) return;
        const newIngredients = { ...inventory.ingredients };
        mixingBowl.forEach(ing => {
            newIngredients[ing] = (newIngredients[ing] || 0) + 1;
        });
        updateInventory({ ...inventory, ingredients: newIngredients });
        setMixingBowl([]);
    };

    const findMatchingRecipe = (bowl: IngredientType[]): Recipe | null => {
        const bowlCounts: Partial<Record<IngredientType, number>> = {};
        for (const ing of bowl) {
            bowlCounts[ing] = (bowlCounts[ing] || 0) + 1;
        }

        for (const recipe of BREAD_RECIPES) {
            const recipeIngredients = Object.keys(recipe.ingredients);
            const bowlIngredients = Object.keys(bowlCounts);

            if (recipeIngredients.length !== bowlIngredients.length) {
                continue;
            }

            let isMatch = true;
            for (const ing of recipeIngredients) {
                if (recipe.ingredients[ing as IngredientType] !== bowlCounts[ing as IngredientType]) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                return recipe;
            }
        }
        return null;
    };

    useEffect(() => {
        const bowlCounts: Partial<Record<IngredientType, number>> = {};
        for (const ing of mixingBowl) {
            bowlCounts[ing] = (bowlCounts[ing] || 0) + 1;
        }
        const bowlIngredientKeys = Object.keys(bowlCounts);

        if (bowlIngredientKeys.length === 0) {
            setRecipeHint(null);
            return;
        }

        const potentialRecipes = BREAD_RECIPES.filter(recipe => {
            for (const ingInBowl of bowlIngredientKeys) {
                if (!recipe.ingredients[ingInBowl as IngredientType]) {
                    return false;
                }
                if (bowlCounts[ingInBowl as IngredientType]! > recipe.ingredients[ingInBowl as IngredientType]!) {
                    return false;
                }
            }
            return true;
        });

        if (potentialRecipes.length > 0) {
            const exactMatch = findMatchingRecipe(mixingBowl);

            if (exactMatch) {
                setRecipeHint(`You're making: ${exactMatch.name}`);
            } else if (potentialRecipes.length === 1) {
                setRecipeHint(`Looks like you're starting a ${potentialRecipes[0].name}...`);
            } else {
                 setRecipeHint(`Could be: ${potentialRecipes.map(r => r.name).slice(0, 2).join(' or ')}...`);
            }
        } else {
            setRecipeHint('Unknown Combination');
        }

    }, [mixingBowl]);

    const handleStartMixing = () => {
        const matchedRecipe = findMatchingRecipe(mixingBowl);
        if (matchedRecipe) {
            setCurrentRecipe(matchedRecipe);
            setStep(BakingStep.Knead);
        } else {
            alert("These ingredients don't seem to make a recognized bread. Try a different combination!");
            // Return ingredients
            const newIngredients = { ...inventory.ingredients };
            mixingBowl.forEach(ing => newIngredients[ing] = (newIngredients[ing] || 0) + 1);
            updateInventory({ ...inventory, ingredients: newIngredients });
            setMixingBowl([]);
        }
    };

    const handleKnead = () => {
        if (kneadCount < kneadTarget) {
            setKneadCount(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (kneadCount >= kneadTarget) {
            const timer = setTimeout(() => {
                setStep(BakingStep.Ferment);
                setFermentationOutcome(null);
                setFermentProgress(0);
                setIsFermenting(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [kneadCount, kneadTarget]);
    
    // Fermentation timer
    useEffect(() => {
        let interval: number;
        if (isFermenting) {
            interval = window.setInterval(() => {
                setFermentProgress(prev => {
                    const newProgress = prev + 100;
                    if (newProgress >= totalFermentTime + 500) { // Auto-finish as burnt
                        handleFinishFermenting(newProgress);
                        return prev;
                    }
                    return newProgress;
                });
            }, 100);
        }
        return () => window.clearInterval(interval);
    }, [isFermenting, totalFermentTime]);

    const handleFinishFermenting = (currentTime = fermentProgress) => {
        if (!isFermenting) return;
        setIsFermenting(false);

        let quality: BreadQuality;
        if (currentTime < perfectFermentStart) {
            quality = BreadQuality.Undercooked;
        } else if (currentTime <= perfectFermentEnd) {
            quality = BreadQuality.Perfect;
        } else {
            quality = BreadQuality.Burnt;
        }
        setFermentationOutcome(quality);

        setTimeout(() => {
            setStep(BakingStep.Bake);
        }, 1500);
    };

    // Simple, non-interactive baking timer
    useEffect(() => {
        let interval: number;
        if (step === BakingStep.Bake && !isBaking) {
            setIsBaking(true);
        }

        if (isBaking) {
            interval = window.setInterval(() => {
                setBakeProgress(prev => {
                    const newProgress = prev + 100;
                    if (newProgress >= SIMPLE_BAKE_DURATION_MS) {
                        handleFinishBaking();
                        return SIMPLE_BAKE_DURATION_MS;
                    }
                    return newProgress;
                });
            }, 100);
        }
        return () => window.clearInterval(interval);
    }, [step, isBaking]);


    const handleFinishBaking = () => {
        if (!currentRecipe || !fermentationOutcome) return;
        
        setIsBaking(false);

        const finalPrice = Math.round(currentRecipe.basePrice * BREAD_SALE_PRICE_MODIFIERS[fermentationOutcome]);

        const newBread: Bread = {
            id: `bread-${Date.now()}`,
            quality: fermentationOutcome,
            name: currentRecipe.name,
            price: finalPrice,
        };

        updateInventory({ ...inventory, breads: [...inventory.breads, newBread] });
        
        // Reset for next bake
        setMixingBowl([]);
        setKneadCount(0);
        setCurrentRecipe(null);
        setFermentationOutcome(null);
        setFermentProgress(0);
        setBakeProgress(0);
        setIsFermenting(false);
        setStep(BakingStep.Finished);
    };

    const getBreadColor = () => {
        const progress = bakeProgress / SIMPLE_BAKE_DURATION_MS;
        const lightness = 100 - progress * 40; // from light to golden brown
        return `hsl(40, 100%, ${lightness}%)`;
    };

    const renderBaking = () => {
        switch (step) {
            case BakingStep.Buy:
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4 text-stone-300">Ingredient Shop</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {Object.values(IngredientType).map(ing => (
                                <button key={ing} onClick={() => handleBuyIngredient(ing)} className="p-4 bg-amber-200 rounded-lg shadow-md hover:bg-amber-300 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-stone-800 flex flex-col items-center justify-center relative" disabled={gold < INGREDIENT_PRICES[ing]}>
                                    <span className="absolute -top-2 -right-2 bg-amber-800 text-white text-xs font-bold rounded-full px-2 py-1 shadow-md">
                                        {inventory.ingredients[ing] || 0}
                                    </span>
                                    <span className="text-4xl">{INGREDIENT_EMOJIS[ing]}</span>
                                    <p className="font-bold capitalize text-sm">{ing.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="text-xs">🪙 {INGREDIENT_PRICES[ing]}</p>
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
                             <div className="grid grid-cols-3 gap-2 p-2 bg-stone-800/50 rounded-lg max-h-96 overflow-y-auto">
                                 {Object.values(IngredientType).map(ing => (
                                     <div key={ing} draggable={inventory.ingredients[ing] > 0} onClick={() => handleAddIngredientToBowl(ing)} onDragStart={(e) => handleDragStart(e, ing)} onDragEnd={handleDragEnd} className={`p-2 flex flex-col justify-between text-center rounded-md transition-colors h-24 ${inventory.ingredients[ing] > 0 ? 'bg-amber-100 cursor-pointer hover:bg-amber-200' : 'bg-stone-500 opacity-50'}`}>
                                         <span className="text-3xl">{INGREDIENT_EMOJIS[ing]}</span>
                                         <p className="font-semibold text-xs capitalize text-stone-800 leading-tight">{ing.replace(/([A-Z])/g, ' $1').trim()}</p>
                                         <p className="font-bold text-sm text-stone-800">x{inventory.ingredients[ing] || 0}</p>
                                     </div>
                                 ))}
                            </div>
                        </div>
                        <div className="w-full md:w-2/3 flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-2">Mixing Bowl</h2>
                             <div className="h-8 mb-2 text-center text-lg font-bold text-amber-300 transition-opacity duration-300">
                                {recipeHint}
                            </div>
                             <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className="w-full min-h-[12rem] bg-stone-500/80 rounded-full flex items-center justify-center border-4 border-dashed border-stone-400 transition-colors p-4">
                                 <div className="flex flex-wrap text-4xl gap-2 justify-center">
                                    {mixingBowl.length === 0 ? <p className="text-stone-300 text-lg">Click or drop ingredients here</p> : mixingBowl.map((ing, i) => (
                                        <div key={i} className="relative group">
                                            <span className="text-4xl select-none" title={ing}>{INGREDIENT_EMOJIS[ing]}</span>
                                            <button 
                                                onClick={() => handleRemoveIngredientFromBowl(i)}
                                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                aria-label={`Remove ${ing}`}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                 </div>
                             </div>
                            <div className="mt-4 flex flex-wrap justify-center items-center gap-4">
                                <button onClick={() => setStep(BakingStep.Buy)} className="px-6 py-2 bg-gray-500 text-white font-bold rounded-full shadow-lg hover:bg-gray-600 transition-colors">
                                    Back to Shop
                                </button>
                                {mixingBowl.length > 0 && (
                                    <button onClick={handleClearBowl} className="px-6 py-2 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition-colors">
                                        Clear Bowl
                                    </button>
                                )}
                                {mixingBowl.length > 0 && (
                                    <button onClick={handleStartMixing} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                                        Mix Dough
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case BakingStep.Knead:
                 return (
                    <div className="text-center">
                         <h2 className="text-3xl font-bold mb-4">Knead the {currentRecipe?.name}!</h2>
                         <p className="mb-4">Click the dough {kneadTarget} times to knead it.</p>
                        <div className="w-48 h-48 bg-amber-200 rounded-full mx-auto flex items-center justify-center cursor-pointer active:scale-95 transition-transform" onClick={handleKnead}>
                             <span className="text-6xl">🍞</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
                             <div className="bg-green-500 h-4 rounded-full" style={{ width: `${Math.min(100, (kneadCount / kneadTarget) * 100)}%` }}></div>
                        </div>
                        {kneadCount >= kneadTarget && <p className="mt-4 text-xl font-bold text-green-300 animate-pulse">Ready for the next step!</p>}
                    </div>
                 );
            case BakingStep.Ferment:
                 return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Ferment the Dough</h2>
                        <p className="mb-4">Stop at the right time for perfect fermentation! (Duration: {totalFermentTime / 1000}s)</p>
                        <div className="w-64 h-40 bg-gray-800 rounded-lg mx-auto flex items-center justify-center p-4" style={{border: '10px solid #4a5568'}}>
                             <div className="w-24 h-24 rounded-full bg-amber-200"></div>
                        </div>
                        <div className="w-full bg-gray-400 rounded-full h-2.5 mt-4 overflow-hidden">
                            <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (fermentProgress / totalFermentTime) * 100)}%` }}></div>
                            <div className="relative h-0">
                                <div className="absolute bg-green-500/70 h-4 -bottom-1" style={{ left: `${(perfectFermentStart / totalFermentTime) * 100}%`, width: `${((perfectFermentEnd - perfectFermentStart) / totalFermentTime) * 100}%` }}></div>
                            </div>
                        </div>
                        {fermentationOutcome ? (
                             <p className={`mt-4 text-2xl font-bold animate-pulse ${fermentationOutcome === BreadQuality.Perfect ? 'text-green-400' : 'text-red-400'}`}>
                                {fermentationOutcome === BreadQuality.Perfect && 'Perfect Fermentation!'}
                                {fermentationOutcome === BreadQuality.Undercooked && 'Under-fermented...'}
                                {fermentationOutcome === BreadQuality.Burnt && 'Over-fermented!'}
                            </p>
                        ) : (
                            <>
                                {!isFermenting && <button onClick={() => setIsFermenting(true)} className="mt-4 px-8 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700">Start Fermenting</button>}
                                {isFermenting && <button onClick={() => handleFinishFermenting()} className="mt-4 px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700">Stop!</button>}
                            </>
                        )}
                    </div>
                );
             case BakingStep.Bake:
                 return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Baking the {currentRecipe?.name}!</h2>
                        <p className="mb-4 animate-pulse">Please wait, the bread is baking automatically...</p>
                        <div className="w-64 h-40 bg-gray-800 rounded-lg mx-auto flex items-center justify-center p-4" style={{border: '10px solid #4a5568'}}>
                            <div className="w-24 h-24 rounded-full" style={{ backgroundColor: getBreadColor() }}></div>
                        </div>
                        <div className="w-full bg-gray-400 rounded-full h-4 mt-4 overflow-hidden">
                            <div className="bg-orange-500 h-4 rounded-full" style={{ width: `${(bakeProgress / SIMPLE_BAKE_DURATION_MS) * 100}%` }}></div>
                        </div>
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

    const renderDecorating = () => {
        const purchasedCounts = purchasedDecorations.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return (
            <div>
                <h2 className="text-3xl font-bold mb-4 text-center text-stone-300">Decoration Shop</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DECORATIONS.map(item => {
                        const count = purchasedCounts[item.id] || 0;
                        const isSoldOut = count >= item.limit;
                        const canAfford = gold >= item.price;
                        return (
                            <div key={item.id} className={`p-4 rounded-lg shadow-lg flex flex-col justify-between ${isSoldOut ? 'bg-green-900/80' : 'bg-stone-800/80'}`}>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-4">
                                            <span className="text-5xl">{item.icon}</span>
                                            <h3 className="text-2xl font-bold">{item.name}</h3>
                                        </div>
                                        <span className="text-lg font-bold bg-black/30 px-3 py-1 rounded-full">{count}/{item.limit}</span>
                                    </div>
                                    <p className="text-stone-300 mb-1">{item.description}</p>
                                    <p className="text-amber-300 font-bold">💖 +{item.comfortValue} Comfort</p>
                                </div>
                                <div className="mt-4">
                                    {isSoldOut ? (
                                        <button disabled className="w-full py-2 bg-gray-500 text-white font-bold rounded-lg cursor-not-allowed">Sold Out</button>
                                    ) : (
                                        <button 
                                            onClick={() => onBuyDecoration(item)} 
                                            disabled={!canAfford}
                                            className="w-full py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        >
                                            Buy for 🪙 {item.price}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderContacts = () => {
        const familiarContacts = townsfolk.filter(c => c.favorability >= 3);
        return (
            <div>
                <h2 className="text-3xl font-bold mb-4 text-center text-stone-300">Contacts</h2>
                {familiarContacts.length === 0 ? (
                    <p className="text-center text-stone-400">No one has shared their contact info with you yet. Keep building relationships! (3+ ❤️)</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {familiarContacts.map(contact => (
                            <div key={contact.id} className="p-4 bg-stone-800/80 rounded-lg text-center">
                                <div style={{ backgroundImage: `url(${contact.avatarUrl})` }} aria-label={contact.name} className="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-amber-600 bg-cover bg-top"></div>
                                <h3 className="text-xl font-bold">{contact.name}</h3>
                                <div className="text-red-500 my-1">{'❤️'.repeat(contact.favorability)}</div>
                                <button onClick={() => onStartNightChat(contact)} className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                                    Chat
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-stone-800 text-white p-4 sm:p-8 flex flex-col" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-wood.png")'}}>
            <header className="flex justify-between items-center mb-4 p-4 bg-black/30 rounded-lg">
                <div>
                    <h1 className="text-4xl font-bold">🌙 Night Phase</h1>
                    <p className="text-xl text-amber-300">{formatDate(gameDate)}</p>
                </div>
                <div className="flex items-center gap-4 text-2xl">
                    <span className="font-bold">🪙 {gold}</span>
                    <button onClick={onEndNight} className="px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors">Start the Day ☀️</button>
                </div>
            </header>

            <div className="mb-4 flex justify-center gap-4 border-b-2 border-stone-600">
                {(['baking', 'decorating', 'contacts'] as NightTab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 text-xl font-bold capitalize transition-colors rounded-t-lg ${activeTab === tab ? 'bg-stone-700/70 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <main className="flex-grow bg-stone-700/70 p-6 rounded-2xl shadow-inner relative">
                {activeTab === 'baking' && renderBaking()}
                {activeTab === 'decorating' && renderDecorating()}
                {activeTab === 'contacts' && renderContacts()}

                {activeTab === 'baking' && (
                    <button 
                        onClick={() => setIsRecipeBookOpen(true)} 
                        className="absolute bottom-4 right-4 bg-amber-800 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl z-20 hover:bg-amber-900 transition-transform transform hover:scale-110"
                        title="Open Recipe Book"
                    >
                        📖
                    </button>
                )}
            </main>

            {isRecipeBookOpen && (
                <RecipeBook recipes={BREAD_RECIPES} onClose={() => setIsRecipeBookOpen(false)} />
            )}
            {nightChatCustomer && (
                <ChatModal 
                    customer={nightChatCustomer} 
                    isReplying={isReplying}
                    onClose={onEndNightChat} 
                    onSendMessage={onSendMessage} 
                />
            )}
        </div>
    );
};

export default NightScene;