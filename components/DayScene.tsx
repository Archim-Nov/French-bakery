import React, { useState, useEffect, useRef } from 'react';
// FIX: Moved CoffeeType from 'import type' to regular import because it's used as a value (enum).
import type { Bread, Customer, DragItem, Ingredients, GameDate } from '../types';
import { CoffeeStep, IngredientType, CoffeeType } from '../types';
import ContactList from './ContactList';
import { GRIND_TARGET, BREW_TIME_MS, COFFEE_RECIPES, INGREDIENT_EMOJIS } from '../constants';

interface DaySceneProps {
    gold: number;
    breads: Bread[];
    townsfolk: Customer[];
    inventoryIngredients: Ingredients;
    currentCustomer: Customer | null;
    seatedCustomers: Customer[];
    maxSeats: number;
    cafeComfort: number;
    purchasedDecorations: string[];
    isGeneratingCustomer: boolean;
    isReplying: boolean;
    gameDate: GameDate;
    updateGold: (amount: number) => void;
    onSellBread: (breadId: string) => void;
    onServeCoffee: (customerId: string, coffeeType: CoffeeType) => void;
    onEndDay: () => void;
    onSendMessage: (message: string) => void;
}

const getWeekday = (day: number): string => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekdays[(day - 1) % 7];
};

const formatDate = (date: GameDate): string => {
    return `Year ${date.year}, ${date.season} ${date.day} (${getWeekday(date.day)})`;
};

const DayScene: React.FC<DaySceneProps> = (props) => {
    const { gold, breads, townsfolk, inventoryIngredients, currentCustomer, seatedCustomers, maxSeats, cafeComfort, purchasedDecorations, isGeneratingCustomer, isReplying, gameDate, updateGold, onSellBread, onServeCoffee, onEndDay, onSendMessage } = props;
    const [chatInput, setChatInput] = useState('');
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    
    const [coffeeStep, setCoffeeStep] = useState<CoffeeStep>(CoffeeStep.Idle);
    const [grindCount, setGrindCount] = useState(0);
    const [brewProgress, setBrewProgress] = useState(0);
    const [isBrewing, setIsBrewing] = useState(false);
    const [coffeeMix, setCoffeeMix] = useState<IngredientType[]>([]);
    const [currentCoffeeRecipe, setCurrentCoffeeRecipe] = useState<CoffeeType | null>(null);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [currentCustomer?.conversation]);
    
    const handleGrind = () => {
        if (coffeeStep === CoffeeStep.Grind) {
            setGrindCount(prev => prev + 1);
        }
    };

    const resetCoffeeStation = () => {
        setCoffeeStep(CoffeeStep.Idle);
        setGrindCount(0);
        setBrewProgress(0);
        setIsBrewing(false);
        setCoffeeMix([]);
        setCurrentCoffeeRecipe(null);
    };

    useEffect(() => {
        if (grindCount >= GRIND_TARGET) {
            const timer = setTimeout(() => setCoffeeStep(CoffeeStep.Mix), 500);
            return () => clearTimeout(timer);
        }
    }, [grindCount]);

    useEffect(() => {
        let interval: number;
        if (isBrewing) {
            interval = window.setInterval(() => {
                setBrewProgress(prev => {
                    const newProgress = prev + 100;
                    if (newProgress >= BREW_TIME_MS) {
                        setIsBrewing(false);
                        setCoffeeStep(CoffeeStep.Ready);
                        setBrewProgress(0);
                        return BREW_TIME_MS;
                    }
                    return newProgress;
                });
            }, 100);
        }
        return () => window.clearInterval(interval);
    }, [isBrewing]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: { type: 'bread' | 'coffee', id: string }) => {
        const dragItem: DragItem = { type: item.type, id: item.id };
        e.dataTransfer.setData('application/json', JSON.stringify(dragItem));
        e.currentTarget.style.opacity = '0.5';
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
    };

    const handleCustomerDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const item: DragItem = JSON.parse(data);

        if (item.type === 'bread' && currentCustomer) {
            const breadToSell = breads.find(b => b.id === item.id);
            if (breadToSell) {
                updateGold(breadToSell.price);
                onSellBread(breadToSell.id);
            }
        }
        e.currentTarget.classList.remove('border-green-500', 'scale-105');
    };
    
    const handleCafeDrop = (e: React.DragEvent<HTMLDivElement>, customerId: string) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const item: DragItem = JSON.parse(data);

        if (item.type === 'coffee') {
            onServeCoffee(customerId, item.id as CoffeeType);
            resetCoffeeStation();
        }
        e.currentTarget.classList.remove('border-green-500', 'scale-105');
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('border-green-500', 'scale-105');
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('border-green-500', 'scale-105');
    };

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim() && !isReplying) {
            onSendMessage(chatInput.trim());
            setChatInput('');
        }
    };

    const findCoffeeRecipe = (mix: IngredientType[]): CoffeeType | null => {
        const mixCounts: Partial<Record<IngredientType, number>> = {};
        for (const ing of mix) {
            mixCounts[ing] = (mixCounts[ing] || 0) + 1;
        }

        // Handle Espresso case (no ingredients)
        if (Object.keys(mixCounts).length === 0) return CoffeeType.Espresso;

        for (const recipe of COFFEE_RECIPES) {
             const recipeIngredients = Object.keys(recipe.ingredients);
             const mixIngredients = Object.keys(mixCounts);

             if (recipeIngredients.length !== mixIngredients.length) continue;

             let isMatch = true;
             for (const ing of recipeIngredients) {
                 if (recipe.ingredients[ing as IngredientType] !== mixCounts[ing as IngredientType]) {
                     isMatch = false;
                     break;
                 }
             }
             if (isMatch) return recipe.name;
        }
        return null;
    }
    
    const handleStartBrewing = () => {
        const recipeType = findCoffeeRecipe(coffeeMix);
        if (recipeType) {
            setCurrentCoffeeRecipe(recipeType);
            setIsBrewing(true);
            setCoffeeStep(CoffeeStep.Brew);
        } else {
            alert("This doesn't look like a valid coffee recipe.");
        }
    }

    const renderCoffeeStation = () => {
        switch (coffeeStep) {
            case CoffeeStep.Idle:
                return (
                    <div className="text-center p-4">
                        <button onClick={() => setCoffeeStep(CoffeeStep.Grind)} className="px-6 py-3 bg-stone-600 text-white font-bold rounded-lg shadow-lg hover:bg-stone-700 transition-colors w-full">
                            <span className="text-2xl mr-2">🫘</span> Grind Beans
                        </button>
                    </div>
                );
            case CoffeeStep.Grind:
                return (
                    <div className="text-center p-4">
                        <h3 className="font-bold mb-2">Grind the Beans!</h3>
                        <p className="text-sm mb-2">Click the grinder!</p>
                        <div onClick={handleGrind} className="w-24 h-24 bg-stone-300 rounded-full mx-auto flex items-center justify-center cursor-pointer active:scale-95 transition-transform text-5xl">
                            ⚙️
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
                            <div className="bg-stone-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (grindCount / GRIND_TARGET) * 100)}%` }}></div>
                        </div>
                        {grindCount >= GRIND_TARGET && <p className="mt-2 text-sm font-bold text-green-600 animate-pulse">Ready to mix!</p>}
                    </div>
                );
            case CoffeeStep.Mix:
                return (
                    <div className="p-4">
                        <h3 className="font-bold text-center mb-2">Mix your Coffee</h3>
                        <div className="min-h-[60px] bg-stone-200 rounded-lg p-2 mb-2 flex items-center justify-center gap-2 text-3xl">
                           <span title="Ground Coffee">🫘</span>
                           {coffeeMix.map((ing, i) => <span key={i} title={ing}>{INGREDIENT_EMOJIS[ing]}</span>)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {/* FIX: Used IngredientType enum members instead of string literals to satisfy TypeScript's type checker for the coffeeMix state. */}
                            {([IngredientType.Milk, IngredientType.Chocolate] as const).map(ing => (
                                <button key={ing} onClick={() => setCoffeeMix(prev => [...prev, ing])}
                                disabled={(inventoryIngredients[ing] || 0) <= coffeeMix.filter(i => i === ing).length}
                                className="p-2 bg-amber-100 rounded-lg flex items-center justify-center gap-2 text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-200">
                                    {INGREDIENT_EMOJIS[ing]} <span>x{(inventoryIngredients[ing] || 0) - coffeeMix.filter(i => i === ing).length}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={handleStartBrewing} className="w-full px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700">Brew!</button>
                    </div>
                );
            case CoffeeStep.Brew:
                const recipeBeingBrewed = COFFEE_RECIPES.find(r => r.name === currentCoffeeRecipe);
                return (
                    <div className="text-center p-4">
                        <h3 className="font-bold mb-2">Brewing {currentCoffeeRecipe}</h3>
                         <div className="w-24 h-24 bg-stone-300 rounded-full mx-auto flex items-center justify-center text-5xl mb-4">
                            {recipeBeingBrewed?.icon}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                            <div className="bg-amber-800 h-2.5 rounded-full" style={{ width: `${(brewProgress / BREW_TIME_MS) * 100}%` }}></div>
                        </div>
                    </div>
                );
            case CoffeeStep.Ready:
                const readyRecipe = COFFEE_RECIPES.find(r => r.name === currentCoffeeRecipe);
                if (!readyRecipe) return null;
                return (
                     <div draggable onDragStart={(e) => handleDragStart(e, { type: 'coffee', id: readyRecipe.name })} onDragEnd={handleDragEnd} className="p-4 bg-amber-50 rounded-lg text-center shadow-md cursor-grab active:cursor-grabbing transform hover:scale-105 transition-transform">
                        <span className="text-5xl">{readyRecipe.icon}</span>
                        <p className="font-bold">{readyRecipe.name}</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-amber-100 p-4 sm:p-8 flex flex-col" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/brushed-alum.png")'}}>
            <header className="flex justify-between items-center mb-8 p-4 bg-white/50 rounded-lg shadow-md">
                <div>
                    <h1 className="text-4xl font-bold text-amber-900">☀️ Day Phase</h1>
                    <p className="text-xl text-amber-800">{formatDate(gameDate)}</p>
                </div>
                <div className="flex items-center gap-4 text-2xl">
                    <span className="font-bold">🪙 {gold}</span>
                    <button onClick={onEndDay} className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">End Day</button>
                </div>
            </header>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-rows-2 gap-8">
                    <div className="bg-white/70 p-6 rounded-2xl shadow-lg flex flex-col min-h-[300px]">
                        {isGeneratingCustomer && <div className="flex-grow flex items-center justify-center text-center"><p className="text-2xl animate-pulse">A new customer is arriving...</p></div>}
                        {!isGeneratingCustomer && currentCustomer && (
                            <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8">
                                {/* Left side: Character Portrait */}
                                <div onDrop={handleCustomerDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className="p-2 border-4 border-dashed border-transparent rounded-lg transition-all duration-300 h-full flex items-center justify-center">
                                    <img 
                                        src={currentCustomer.avatarUrl} 
                                        alt={currentCustomer.name} 
                                        className="max-h-[300px] md:max-h-[450px] w-auto object-contain drop-shadow-lg" 
                                    />
                                </div>
                                
                                {/* Right side: Dialogue & Chat */}
                                <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center">
                                    <h2 className="text-3xl font-bold">{currentCustomer.name}</h2>
                                    <div className="relative mt-4 bg-amber-50 p-4 rounded-lg shadow-md w-full">
                                        <div className="absolute top-1/2 -translate-y-1/2 left-[-15px] w-0 h-0 border-t-8 border-b-8 border-r-[16px] border-t-transparent border-b-transparent border-r-amber-50 hidden md:block"></div>
                                        <p className="text-lg italic">"{currentCustomer.dialogue}"</p>
                                    </div>

                                    {currentCustomer.favorability >= 1 && (
                                        <div className="mt-6 w-full max-w-lg bg-stone-100 rounded-lg shadow-inner p-4 flex flex-col">
                                            <h3 className="text-lg font-bold text-stone-700 mb-2 text-center">Chat with {currentCustomer.name}</h3>
                                            <div ref={chatHistoryRef} className="flex-grow h-48 overflow-y-auto mb-2 p-2 bg-white rounded">
                                                {currentCustomer.conversation.map((msg, index) => (
                                                    <div key={index} className={`chat ${msg.role === 'player' ? 'chat-end' : 'chat-start'}`}><div className={`chat-bubble text-white ${msg.role === 'player' ? 'bg-blue-500' : 'bg-green-600'}`}>{msg.text}</div></div>
                                                ))}
                                                {isReplying && <div className="chat chat-start"><div className="chat-bubble bg-green-600/70 animate-pulse">...</div></div>}
                                            </div>
                                            <form onSubmit={handleChatSubmit} className="flex gap-2">
                                                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Say something..." disabled={isReplying} className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"/>
                                                <button type="submit" disabled={isReplying || !chatInput.trim()} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-stone-400">Send</button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {!isGeneratingCustomer && !currentCustomer && <div className="flex-grow flex items-center justify-center text-center"><p className="text-2xl text-stone-600">Waiting for a customer...</p></div>}
                    </div>
                    <div className="bg-amber-200/60 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center relative bg-cover bg-center" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")'}}>
                         <h2 className="text-2xl font-bold mb-4 text-amber-900 absolute top-4 left-4">Cafe Corner</h2>
                         <div className="absolute top-4 right-4 text-2xl">{purchasedDecorations.includes('umbrella_1') && '⛱️'} {purchasedDecorations.includes('decor_1') && '✨'}</div>
                         <div className="absolute bottom-4 right-4 text-xl font-bold bg-white/70 px-3 py-1 rounded-full shadow-md">💖 Comfort: {cafeComfort}</div>
                         <div className="absolute bottom-4 left-4 text-5xl">{purchasedDecorations.includes('plant_1') && '🪴'}</div>
                         <div className="flex flex-wrap gap-8 justify-center items-end">
                            {Array.from({ length: maxSeats }).map((_, i) => {
                                const customer = seatedCustomers[i];
                                if (customer) {
                                    return (
                                        <div key={customer.id} onDrop={(e) => handleCafeDrop(e, customer.id)} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className="text-center p-4 border-4 border-dashed border-transparent rounded-lg transition-all duration-300">
                                            <div style={{ backgroundImage: `url(${customer.avatarUrl})` }} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-amber-700 shadow-xl bg-cover bg-top"></div>
                                            <h3 className="text-xl font-bold">{customer.name}</h3>
                                            <div className="relative mt-2 bg-white/80 p-3 rounded-lg shadow-md max-w-xs mx-auto">
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/80"></div>
                                                <p className="text-md italic">"{customer.coffeeDialogue}"</p>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={`seat-${i}`} className="text-center p-4">
                                        <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-black/10 flex items-center justify-center text-4xl text-stone-600">🪑</div>
                                        <p className="font-bold text-stone-700">Empty Seat</p>
                                    </div>
                                );
                            })}
                        </div>
                        {seatedCustomers.length === 0 && maxSeats === 0 && <p className="text-xl text-stone-700">Buy some seats to have customers stay!</p>}
                    </div>
                </div>

                <div className="bg-amber-300/50 p-6 rounded-2xl shadow-lg flex flex-col gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 border-b-2 border-amber-500 pb-2">Your Baked Bread</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                            {breads.length > 0 ? breads.map(bread => (
                                <div key={bread.id} draggable onDragStart={(e) => handleDragStart(e, {type: 'bread', id: bread.id})} onDragEnd={handleDragEnd} className="p-4 bg-amber-50 rounded-lg text-center shadow-md cursor-grab active:cursor-grabbing transform hover:scale-105 transition-transform">
                                    <span className="text-5xl">🍞</span>
                                    <p className="font-bold">{bread.name}</p>
                                    <p className="text-sm">🪙 {bread.price}</p>
                                </div>
                            )) : (
                                <p className="col-span-full text-center text-stone-700 mt-4">No bread to sell! Go bake some tonight.</p>
                            )}
                        </div>
                    </div>
                    <div className="bg-white/50 rounded-lg">
                        <h2 className="text-2xl font-bold mb-2 border-b-2 border-amber-500 pb-2 p-4">Coffee Station</h2>
                        {renderCoffeeStation()}
                    </div>
                </div>
            </main>
            <ContactList townsfolk={townsfolk} />
        </div>
    );
};

export default DayScene;