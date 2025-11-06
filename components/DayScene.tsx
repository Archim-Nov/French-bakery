import React, { useState, useEffect, useRef } from 'react';
// FIX: Moved CoffeeType from 'import type' to regular import because it's used as a value (enum).
import type { Bread, Customer, DragItem, Ingredients, GameDate } from '../types';
import { CoffeeStep, IngredientType, CoffeeType } from '../types';
import ContactList from './ContactList';
import { GRIND_TARGET, BREW_TIME_MS, COFFEE_RECIPES, INGREDIENT_EMOJIS } from '../constants';
import ChatModal from './ChatModal';

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
    dayChatCustomer: Customer | null;
    updateGold: (amount: number) => void;
    onSellPackedBreads: (breadIds: string[]) => void;
    onServeCoffee: (customerId: string, coffeeType: CoffeeType) => void;
    onEndDay: () => void;
    onSendMessage: (message: string) => void;
    onStartDayChat: (customerId: string) => void;
    onEndDayChat: () => void;
    onDayChatSendMessage: (message: string) => void;
}

const getWeekday = (day: number): string => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekdays[(day - 1) % 7];
};

const formatDate = (date: GameDate): string => {
    return `Year ${date.year}, ${date.season} ${date.day} (${getWeekday(date.day)})`;
};

const DayScene: React.FC<DaySceneProps> = (props) => {
    const { gold, breads, townsfolk, inventoryIngredients, currentCustomer, seatedCustomers, maxSeats, cafeComfort, purchasedDecorations, isGeneratingCustomer, isReplying, gameDate, dayChatCustomer, updateGold, onSellPackedBreads, onServeCoffee, onEndDay, onSendMessage, onStartDayChat, onEndDayChat, onDayChatSendMessage } = props;
    const [chatInput, setChatInput] = useState('');
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    
    // UI State
    const [activePanel, setActivePanel] = useState<'bread' | 'coffee' | null>(null);
    const [activeTab, setActiveTab] = useState<'bakery' | 'coffee'>('bakery');

    // Coffee State
    const [coffeeStep, setCoffeeStep] = useState<CoffeeStep>(CoffeeStep.Idle);
    const [grindCount, setGrindCount] = useState(0);
    const [brewProgress, setBrewProgress] = useState(0);
    const [isBrewing, setIsBrewing] = useState(false);
    const [coffeeMix, setCoffeeMix] = useState<IngredientType[]>([]);
    const [currentCoffeeRecipe, setCurrentCoffeeRecipe] = useState<CoffeeType | null>(null);

    // Bread Packing State
    const [breadsToPack, setBreadsToPack] = useState<Bread[]>([]);
    const [isPacked, setIsPacked] = useState(false);
    
    // Filter available breads from those in the packing area
    const availableBreads = breads.filter(b => !breadsToPack.some(p => p.id === b.id));

    const groupedAvailableBreads = availableBreads.reduce<Record<string, { bread: Bread; count: number; ids: string[] }>>((acc, bread) => {
        const key = `${bread.name}-${bread.quality}-${bread.price}`;
        if (!acc[key]) {
            acc[key] = { bread, count: 0, ids: [] };
        }
        acc[key].count++;
        acc[key].ids.push(bread.id);
        return acc;
    }, {});


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

    const handlePackedBagDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const dragItem: DragItem = { type: 'bread', id: 'packed_bag' };
        e.dataTransfer.setData('application/json', JSON.stringify(dragItem));
        e.currentTarget.style.opacity = '0.5';
    };
    
    const handleCoffeeDragStart = (e: React.DragEvent<HTMLDivElement>, coffeeType: CoffeeType) => {
        const dragItem: DragItem = { type: 'coffee', id: coffeeType };
        e.dataTransfer.setData('application/json', JSON.stringify(dragItem));
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
    };

    const handleCustomerDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data || !currentCustomer) return;
        const item: DragItem = JSON.parse(data);

        if (item.type === 'bread' && item.id === 'packed_bag') {
            const breadIds = breadsToPack.map(b => b.id);
            onSellPackedBreads(breadIds);
            setBreadsToPack([]);
            setIsPacked(false);
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

    const handleClickBreadGroup = (group: { bread: Bread; count: number; ids: string[] }) => {
        if (isPacked) return;
        const breadIdToMove = group.ids.find(id => !breadsToPack.some(b => b.id === id));
        if (breadIdToMove) {
            const breadToMove = breads.find(b => b.id === breadIdToMove);
            if (breadToMove) {
                setBreadsToPack(prev => [...prev, breadToMove]);
            }
        }
    };

    const handleRemoveFromPack = (breadId: string) => {
        if (isPacked) return;
        setBreadsToPack(prev => prev.filter(b => b.id !== breadId));
    };

    const renderCoffeeStation = () => {
        switch (coffeeStep) {
            case CoffeeStep.Idle: return <div className="text-center p-4"><button onClick={() => setCoffeeStep(CoffeeStep.Grind)} className="px-6 py-3 bg-stone-600 text-white font-bold rounded-lg shadow-lg hover:bg-stone-700 transition-colors w-full"><span className="text-2xl mr-2">🫘</span> Grind Beans</button></div>;
            case CoffeeStep.Grind: return <div className="text-center p-4"><h3 className="font-bold mb-2">Grind the Beans!</h3><p className="text-sm mb-2">Click the grinder!</p><div onClick={handleGrind} className="w-24 h-24 bg-stone-300 rounded-full mx-auto flex items-center justify-center cursor-pointer active:scale-95 transition-transform text-5xl">⚙️</div><div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden"><div className="bg-stone-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (grindCount / GRIND_TARGET) * 100)}%` }}></div></div>{grindCount >= GRIND_TARGET && <p className="mt-2 text-sm font-bold text-green-600 animate-pulse">Ready to mix!</p>}</div>;
            case CoffeeStep.Mix: return <div className="p-4"><h3 className="font-bold text-center mb-2">Mix your Coffee</h3><div className="min-h-[60px] bg-stone-200 rounded-lg p-2 mb-2 flex items-center justify-center gap-2 text-3xl"><span title="Ground Coffee">🫘</span>{coffeeMix.map((ing, i) => <span key={i} title={ing}>{INGREDIENT_EMOJIS[ing]}</span>)}</div><div className="grid grid-cols-2 gap-2 mb-4">{([IngredientType.Milk, IngredientType.Chocolate] as const).map(ing => (<button key={ing} onClick={() => setCoffeeMix(prev => [...prev, ing])} disabled={(inventoryIngredients[ing] || 0) <= coffeeMix.filter(i => i === ing).length} className="p-2 bg-amber-100 rounded-lg flex items-center justify-center gap-2 text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-200">{INGREDIENT_EMOJIS[ing]} <span>x{(inventoryIngredients[ing] || 0) - coffeeMix.filter(i => i === ing).length}</span></button>))}</div><button onClick={handleStartBrewing} className="w-full px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700">Brew!</button></div>;
            case CoffeeStep.Brew: const recipeBeingBrewed = COFFEE_RECIPES.find(r => r.name === currentCoffeeRecipe); return <div className="text-center p-4"><h3 className="font-bold mb-2">Brewing {currentCoffeeRecipe}</h3><div className="w-24 h-24 bg-stone-300 rounded-full mx-auto flex items-center justify-center text-5xl mb-4">{recipeBeingBrewed?.icon}</div><div className="w-full bg-gray-200 rounded-full h-2.5 mt-4"><div className="bg-amber-800 h-2.5 rounded-full" style={{ width: `${(brewProgress / BREW_TIME_MS) * 100}%` }}></div></div></div>;
            case CoffeeStep.Ready: const readyRecipe = COFFEE_RECIPES.find(r => r.name === currentCoffeeRecipe); if (!readyRecipe) return null; return <div draggable onDragStart={(e) => handleCoffeeDragStart(e, readyRecipe.name)} onDragEnd={handleDragEnd} className="p-4 bg-amber-50 rounded-lg text-center shadow-md cursor-grab active:cursor-grabbing transform hover:scale-105 transition-transform"><span className="text-5xl">{readyRecipe.icon}</span><p className="font-bold">{readyRecipe.name}</p></div>;
        }
    };
    
    const ViewSwitcher = () => (
        <div className="absolute top-6 left-6 z-10" title="Switch View">
            <div className="relative flex w-64 items-center rounded-full bg-stone-200/80 p-1 shadow-inner">
                {/* Clickable Areas */}
                <div
                    onClick={() => setActiveTab('bakery')}
                    className="relative z-10 w-1/2 cursor-pointer rounded-full py-2 text-center"
                >
                    <span className={`font-bold transition-colors duration-500 ${activeTab === 'bakery' ? 'text-amber-900' : 'text-stone-500'}`}>
                        🥖 Bakery
                    </span>
                </div>
                <div
                    onClick={() => setActiveTab('coffee')}
                    className="relative z-10 w-1/2 cursor-pointer rounded-full py-2 text-center"
                >
                     <span className={`font-bold transition-colors duration-500 ${activeTab === 'coffee' ? 'text-amber-900' : 'text-stone-500'}`}>
                        ☕ Cafe
                    </span>
                </div>
    
                {/* Sliding Indicator */}
                <div
                    className={`absolute left-1 top-1 h-[calc(100%-0.5rem)] w-1/2 rounded-full bg-white shadow-md transition-transform duration-500 ease-in-out
                    ${activeTab === 'bakery' ? 'translate-x-0' : 'translate-x-full'}`}
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-amber-100 relative overflow-hidden" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/brushed-alum.png")'}}>

            <div className={`transition-all duration-500 ease-in-out ${activePanel ? 'w-full lg:w-1/3' : 'w-full'}`}>
                <div className="p-4 sm:p-8 flex flex-col h-screen">
                    <header className="flex justify-between items-center mb-4 p-4 bg-white/50 rounded-lg shadow-md shrink-0">
                        <div>
                             <h1 className="text-4xl font-bold text-amber-900">Gemini's Bakery</h1>
                            <p className="text-xl text-amber-800">{formatDate(gameDate)}</p>
                        </div>
                        <div className="flex items-center gap-4 text-2xl">
                            <span className="font-bold">🪙 {gold}</span>
                            <button onClick={onEndDay} className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">End Day</button>
                        </div>
                    </header>

                    <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                        <main className="flex-grow relative">
                           <ViewSwitcher />
                           <div className="h-full w-full overflow-hidden rounded-2xl shadow-lg">
                               <div
                                    className="flex h-full w-[200%] transition-transform duration-500 ease-in-out"
                                    style={{ transform: activeTab === 'bakery' ? 'translateX(0%)' : 'translateX(-50%)' }}
                                >
                                    {/* Bakery Panel */}
                                    <div className="w-1/2 h-full">
                                        <div className="bg-white/70 p-6 flex flex-col h-full overflow-y-auto">
                                            <div className="pt-24 flex-grow flex flex-col">
                                                {isGeneratingCustomer && <div className="flex-grow flex items-center justify-center text-center"><p className="text-2xl animate-pulse">A new customer is arriving...</p></div>}
                                                {!isGeneratingCustomer && currentCustomer && (
                                                    <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8">
                                                        <div onDrop={handleCustomerDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className="p-2 border-4 border-dashed border-transparent rounded-lg transition-all duration-300 h-full flex items-center justify-center">
                                                            <img src={currentCustomer.avatarUrl} alt={currentCustomer.name} className="max-h-[300px] md:max-h-[450px] w-auto object-contain drop-shadow-lg" />
                                                        </div>
                                                        <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center">
                                                            <h2 className="text-3xl font-bold">{currentCustomer.name}</h2>
                                                            {currentCustomer.desiredBread && (
                                                                <div className="mt-2 mb-2 bg-white border-2 border-amber-400 rounded-full px-4 py-2 shadow-sm text-center">
                                                                    <p className="font-bold text-amber-900">"I'd love a <span className="text-red-600">🍞 {currentCustomer.desiredBread}</span>!"</p>
                                                                </div>
                                                            )}
                                                            <div className="relative mt-4 bg-amber-50 p-4 rounded-lg shadow-md w-full"><div className="absolute top-1/2 -translate-y-1/2 left-[-15px] w-0 h-0 border-t-8 border-b-8 border-r-[16px] border-t-transparent border-b-transparent border-r-amber-50 hidden md:block"></div><p className="text-lg italic">"{currentCustomer.dialogue}"</p></div>
                                                            {currentCustomer.favorability >= 1 && (
                                                                <div className="mt-6 w-full max-w-lg bg-stone-100 rounded-lg shadow-inner p-4 flex flex-col">
                                                                    <h3 className="text-lg font-bold text-stone-700 mb-2 text-center">Chat with {currentCustomer.name}</h3>
                                                                    <div ref={chatHistoryRef} className="flex-grow h-48 overflow-y-auto mb-2 p-2 bg-white rounded">{currentCustomer.conversation.map((msg, index) => (<div key={index} className={`chat ${msg.role === 'player' ? 'chat-end' : 'chat-start'}`}><div className={`chat-bubble text-white ${msg.role === 'player' ? 'bg-blue-500' : 'bg-green-600'}`}>{msg.text}</div></div>))}{isReplying && <div className="chat chat-start"><div className="chat-bubble bg-green-600/70 animate-pulse">...</div></div>}</div>
                                                                    <form onSubmit={handleChatSubmit} className="flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Say something..." disabled={isReplying} className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"/><button type="submit" disabled={isReplying || !chatInput.trim()} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-stone-400">Send</button></form>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {!isGeneratingCustomer && !currentCustomer && <div className="flex-grow flex items-center justify-center text-center"><p className="text-2xl text-stone-600">Waiting for a customer...</p></div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coffee Panel */}
                                    <div className="w-1/2 h-full">
                                        <div className="bg-amber-200/60 p-6 flex flex-col items-center justify-center relative bg-cover bg-center h-full overflow-y-auto" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")'}}>
                                            <div className="absolute top-4 right-4 text-2xl">{purchasedDecorations.includes('umbrella_1') && '⛱️'} {purchasedDecorations.includes('decor_1') && '✨'}</div><div className="absolute bottom-4 right-4 text-xl font-bold bg-white/70 px-3 py-1 rounded-full shadow-md">💖 Comfort: {cafeComfort}</div><div className="absolute bottom-4 left-4 text-5xl">{purchasedDecorations.includes('plant_1') && '🪴'}</div>
                                            <div className="flex flex-wrap gap-8 justify-center items-end pt-24">
                                                {Array.from({ length: maxSeats }).map((_, i) => { const customer = seatedCustomers[i]; if (customer) { return (<div key={customer.id} onDrop={(e) => handleCafeDrop(e, customer.id)} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className="text-center p-4 border-4 border-dashed border-transparent rounded-lg transition-all duration-300"><div style={{ backgroundImage: `url(${customer.avatarUrl})` }} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-amber-700 shadow-xl bg-cover bg-top cursor-pointer hover:scale-110 transition-transform" onClick={() => onStartDayChat(customer.id)}></div><h3 className="text-xl font-bold">{customer.name}</h3><div className="relative mt-2 bg-white/80 p-3 rounded-lg shadow-md max-w-xs mx-auto"><div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/80"></div><p className="text-md italic">"{customer.coffeeDialogue}"</p></div></div>); } return (<div key={`seat-${i}`} className="text-center p-4"><div className="w-24 h-24 rounded-full mx-auto mb-4 bg-black/10 flex items-center justify-center text-4xl text-stone-600">🪑</div><p className="font-bold text-stone-700">Empty Seat</p></div>); })}
                                            </div>
                                            {seatedCustomers.length === 0 && maxSeats === 0 && <p className="text-xl text-stone-700 pt-16">Buy some seats to have customers stay!</p>}
                                        </div>
                                    </div>
                                </div>
                           </div>
                        </main>
                    </div>
                </div>
            </div>

            <div className="fixed top-1/2 -translate-y-1/2 right-0 z-40">
                {activeTab === 'bakery' && (
                    <button
                        onClick={() => setActivePanel(p => p === 'bread' ? null : 'bread')}
                        className="bg-amber-800 text-white p-2 sm:p-4 rounded-l-xl shadow-lg cursor-pointer hover:bg-amber-900 transition-colors"
                        aria-label="Toggle Bread Showcase"
                    >
                        <span className="text-2xl sm:text-4xl">🍞</span>
                    </button>
                )}
                 {activeTab === 'coffee' && (
                    <button
                        onClick={() => setActivePanel(p => p === 'coffee' ? null : 'coffee')}
                        className="bg-stone-800 text-white p-2 sm:p-4 rounded-l-xl shadow-lg cursor-pointer hover:bg-stone-900 transition-colors"
                        aria-label="Toggle Coffee Station"
                    >
                        <span className="text-2xl sm:text-4xl">☕</span>
                    </button>
                 )}
            </div>
            
            <aside 
                className={`fixed top-0 right-0 h-full bg-amber-200/80 backdrop-blur-sm shadow-2xl z-30 transition-transform duration-500 ease-in-out flex flex-col w-full lg:w-2/3 ${activePanel === 'bread' ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}
                aria-hidden={activePanel !== 'bread'}
            >
                <header className="p-2 sm:p-4 bg-amber-900/50 flex items-center justify-between shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Bakery Showcase</h2>
                    <button onClick={() => setActivePanel(null)} className="text-2xl sm:text-3xl text-white font-bold hover:text-red-400 transition-colors" aria-label="Close panel">&times;</button>
                </header>
                <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                    <div className="flex flex-col h-full">
                        <div className="flex-grow">
                            <div className="space-y-6">
                                {Object.values(groupedAvailableBreads).length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {Object.values(groupedAvailableBreads).map(group => (
                                            <div key={group.ids[0]} onClick={() => handleClickBreadGroup(group)} className="p-4 bg-amber-50 rounded-lg text-center shadow-md cursor-pointer transform hover:scale-105 transition-transform relative border-2 border-amber-700/50">
                                                <span className="text-5xl">🍞</span><p className="font-bold">{group.bread.name}</p><p className="text-sm">🪙 {group.bread.price}</p>
                                                {group.count > 1 && (<span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-1 shadow-md">x{group.count}</span>)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="col-span-full text-center text-stone-700 mt-4 p-4 bg-black/10 rounded-lg">No bread to sell! Go bake some tonight.</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-auto pt-4 border-t-4 border-dashed border-amber-600 shrink-0">
                            <h3 className="font-bold text-xl text-center mb-2 text-amber-900">Packing Area</h3>
                            {isPacked ? (
                                    <div draggable onDragStart={handlePackedBagDragStart} onDragEnd={handleDragEnd} className="p-4 bg-green-200 border-2 border-green-500 rounded-lg text-center shadow-md cursor-grab active:cursor-grabbing">
                                    <span className="text-5xl">🛍️</span><p className="font-bold">Packed Bag ({breadsToPack.length} items)</p>
                                </div>
                            ) : (
                                <div className="min-h-[100px] bg-stone-100/70 rounded-lg p-2 flex flex-wrap gap-2 items-center justify-center">
                                    {breadsToPack.length === 0 ? <p className="text-stone-500">Click bread above to add it here</p> : breadsToPack.map(bread => (
                                        <div key={bread.id} className="p-2 bg-amber-50 rounded text-center text-xs relative group"><span className="text-3xl">🍞</span><p>{bread.name}</p><button onClick={() => handleRemoveFromPack(bread.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove ${bread.name}`}>&times;</button></div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-center gap-2 mt-2">
                                {isPacked ? (<button onClick={() => setIsPacked(false)} className="px-4 py-1 bg-yellow-500 text-white rounded-lg text-sm">Unpack</button>) : (breadsToPack.length > 0 && <button onClick={() => setIsPacked(true)} className="px-4 py-1 bg-green-600 text-white rounded-lg">Pack</button>)}
                                {breadsToPack.length > 0 && !isPacked && <button onClick={() => setBreadsToPack([])} className="px-4 py-1 bg-red-500 text-white rounded-lg text-sm">Clear</button>}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            
            <aside 
                className={`fixed top-0 right-0 h-full bg-stone-200/80 backdrop-blur-sm shadow-2xl z-30 transition-transform duration-500 ease-in-out flex flex-col w-full lg:w-2/3 ${activePanel === 'coffee' ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}
                aria-hidden={activePanel !== 'coffee'}
            >
                <header className="p-2 sm:p-4 bg-stone-900/50 flex items-center justify-between shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Coffee Station</h2>
                    <button onClick={() => setActivePanel(null)} className="text-2xl sm:text-3xl text-white font-bold hover:text-red-400 transition-colors" aria-label="Close panel">&times;</button>
                </header>
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
                    <div className="w-full max-w-md bg-white/50 rounded-lg p-4 shadow-inner">
                        {renderCoffeeStation()}
                    </div>
                </div>
            </aside>

            <ContactList townsfolk={townsfolk} />
            {dayChatCustomer && (
                <ChatModal customer={dayChatCustomer} isReplying={isReplying} onClose={onEndDayChat} onSendMessage={onDayChatSendMessage} />
            )}
        </div>
    );
};

export default DayScene;