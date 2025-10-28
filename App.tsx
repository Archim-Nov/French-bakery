import React, { useState, useEffect, useCallback } from 'react';
import NightScene from './components/NightScene';
import DayScene from './components/DayScene';
import EndOfDaySummary from './components/EndOfDaySummary';
import { generateDailyDialogue, continueConversation } from './services/geminiService';
import type { GamePhase, Ingredients, Bread, Customer, Decoration, Mood, CoffeeType, GameDate, FavorabilityChange } from './types';
import { IngredientType, Season } from './types';
import { COFFEE_RECIPES, COMFORT_PRICE_BONUS_PER_POINT, DECORATIONS } from './constants';
import { TOWNSFOLK } from './characters';

const App: React.FC = () => {
    const [gamePhase, setGamePhase] = useState<GamePhase>('night');
    const [gameDate, setGameDate] = useState<GameDate>({ year: 1, season: Season.Spring, day: 1 });
    const [gold, setGold] = useState<number>(50);
    const [inventory, setInventory] = useState<{ ingredients: Ingredients; breads: Bread[] }>({
        // FIX: Initialize all ingredient types to satisfy the 'Ingredients' record type.
        ingredients: {
            [IngredientType.Flour]: 5,
            [IngredientType.Water]: 10,
            [IngredientType.Yeast]: 3,
            [IngredientType.Salt]: 3,
            [IngredientType.Sugar]: 2,
            [IngredientType.RyeFlour]: 0,
            [IngredientType.WholeWheatFlour]: 0,
            [IngredientType.StoneGroundFlour]: 0,
            [IngredientType.NaturalYeast]: 0,
            [IngredientType.SourdoughYeast]: 0,
            [IngredientType.Egg]: 0,
            [IngredientType.Butter]: 0,
            [IngredientType.Milk]: 0,
            [IngredientType.Chocolate]: 0,
            [IngredientType.ApplePuree]: 0,
            [IngredientType.Cinnamon]: 0,
            [IngredientType.Cream]: 0,
            [IngredientType.Raisins]: 0,
            [IngredientType.OliveOil]: 0,
            [IngredientType.Herbs]: 0,
            [IngredientType.ChoppedOlives]: 0,
            [IngredientType.ChocolateChips]: 0,
            [IngredientType.ChoppedWalnuts]: 0,
            [IngredientType.Sesame]: 0,
            [IngredientType.Honey]: 0,
            [IngredientType.SunDriedTomatoes]: 0,
            [IngredientType.BuckwheatFlour]: 0,
            [IngredientType.Oats]: 0,
            [IngredientType.SunflowerSeeds]: 0,
            [IngredientType.FlaxSeeds]: 0,
        },
        breads: [],
    });
    const [townsfolk, setTownsfolk] = useState<Customer[]>(TOWNSFOLK);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [seatedCustomers, setSeatedCustomers] = useState<Customer[]>([]);
    const [maxSeats, setMaxSeats] = useState<number>(2);
    const [purchasedDecorations, setPurchasedDecorations] = useState<string[]>([]);
    const [isGeneratingCustomer, setIsGeneratingCustomer] = useState<boolean>(false);
    const [isReplying, setIsReplying] = useState<boolean>(false);
    const [nightChatCustomer, setNightChatCustomer] = useState<Customer | null>(null);
    const [dayChatCustomer, setDayChatCustomer] = useState<Customer | null>(null);
    
    // Daily tracking states
    const [dailyEarnings, setDailyEarnings] = useState(0);
    const [dailyFavorabilityChanges, setDailyFavorabilityChanges] = useState<FavorabilityChange[]>([]);


    const cafeComfort = purchasedDecorations.reduce((total, decorId) => {
        const decor = DECORATIONS.find(d => d.id === decorId);
        return total + (decor?.comfortValue || 0);
    }, 0);

    const updateGold = (amount: number) => {
        if (amount > 0) {
            setDailyEarnings(prev => prev + amount);
        }
        setGold(prev => Math.max(0, prev + amount));
    };

    const updateInventory = (newInventory: { ingredients: Ingredients; breads: Bread[] }) => {
        setInventory(newInventory);
    };

    const handleFavorabilityIncrease = (customerId: string, customerName: string, avatarUrl: string, newLevel: number) => {
        setDailyFavorabilityChanges(prev => {
            const changesMap = new Map(prev.map(c => [c.customerId, c]));
            changesMap.set(customerId, { customerId, customerName, newLevel, avatarUrl });
            return Array.from(changesMap.values());
        });
    };

    const handleSellBread = (breadId: string) => {
        setInventory(prev => ({
            ...prev,
            breads: prev.breads.filter(b => b.id !== breadId)
        }));
        
        if (currentCustomer) {
            let updatedFavorability = currentCustomer.favorability;

            setTownsfolk(prevTownsfolk => {
                const updatedTownsfolk = prevTownsfolk.map(person => {
                    if (person.id === currentCustomer.id) {
                        updatedFavorability = person.favorability + 1;
                        handleFavorabilityIncrease(person.id, person.name, person.avatarUrl, updatedFavorability);
                        return { ...person, favorability: updatedFavorability, conversation: currentCustomer.conversation };
                    }
                    return person;
                });
                return updatedTownsfolk;
            });
            
            let stayProbability = 0;
            switch (updatedFavorability) {
                case 1: stayProbability = 0.15; break;
                case 2: stayProbability = 0.30; break;
                case 3: stayProbability = 0.45; break;
                case 4: stayProbability = 0.60; break;
                default:
                    if (updatedFavorability >= 5) {
                        stayProbability = 0.75;
                    }
                    break;
            }

            const willStay = Math.random() < stayProbability;
            if (willStay && seatedCustomers.length < maxSeats) {
                setSeatedCustomers(prev => [...prev, currentCustomer]);
            }
            setCurrentCustomer(null);
        }
    };

    const handleServeCoffee = (customerId: string, coffeeType: CoffeeType) => {
        const customer = seatedCustomers.find(c => c.id === customerId);
        const recipe = COFFEE_RECIPES.find(r => r.name === coffeeType);
        if (!customer || !recipe) return;
        
        // Consume ingredients
        const newIngredients = { ...inventory.ingredients };
        let canAffordIngredients = true;
        for (const [ing, amount] of Object.entries(recipe.ingredients)) {
            if ((newIngredients[ing as IngredientType] || 0) < amount) {
                canAffordIngredients = false;
                break;
            }
            newIngredients[ing as IngredientType] -= amount;
        }

        if (!canAffordIngredients) {
            alert("You don't have the ingredients for this coffee!");
            return;
        }

        const finalPrice = Math.round(recipe.basePrice + (cafeComfort * COMFORT_PRICE_BONUS_PER_POINT));
        updateGold(finalPrice);
        
        setInventory({ ...inventory, ingredients: newIngredients });
        
        setTownsfolk(prev => prev.map(c => {
            if (c.id === customerId) {
                const newFavorability = c.favorability + 1;
                handleFavorabilityIncrease(c.id, c.name, c.avatarUrl, newFavorability);
                return { ...c, favorability: newFavorability };
            }
            return c;
        }));

        setSeatedCustomers(prev => prev.filter(c => c.id !== customerId));
    };
    
    const prepareNextCustomer = useCallback(async () => {
        if (isGeneratingCustomer || currentCustomer) return;

        const availableTownsfolk = townsfolk.filter(
            p => p.id !== currentCustomer?.id && !seatedCustomers.some(sc => sc.id === p.id)
        );

        if (availableTownsfolk.length === 0) {
            return; // No one left to visit
        }
        
        const nextVisitor = availableTownsfolk[Math.floor(Math.random() * availableTownsfolk.length)];

        setIsGeneratingCustomer(true);
        try {
            const moods: Mood[] = ['happy', 'stressed', 'thoughtful', 'grumpy', 'energetic'];
            const randomMood = moods[Math.floor(Math.random() * moods.length)];

            const { dialogue, coffeeDialogue } = await generateDailyDialogue(nextVisitor.personality, nextVisitor.name, randomMood);
            
            setCurrentCustomer({ 
                ...nextVisitor, 
                dialogue,
                coffeeDialogue,
                mood: randomMood,
                conversation: [], // Reset conversation for new visit
            });
        } catch (error) {
            console.error("Failed to prepare next customer:", error);
        } finally {
            setIsGeneratingCustomer(false);
        }
    }, [isGeneratingCustomer, currentCustomer, townsfolk, seatedCustomers]);

    const handleDaySendMessage = async (message: string) => {
        if (!currentCustomer) return;
        const activeCustomer = currentCustomer;
        
        setIsReplying(true);
        const playerMessage = { role: 'player' as const, text: message };
        const updatedConversation = [...activeCustomer.conversation, playerMessage];
        setCurrentCustomer({ ...activeCustomer, conversation: updatedConversation });

        try {
            const aiResponseText = await continueConversation(activeCustomer.personality, updatedConversation);
            const customerMessage = { role: 'customer' as const, text: aiResponseText };
            setCurrentCustomer(prev => prev ? { ...prev, conversation: [...updatedConversation, customerMessage] } : null);
        } catch (error) {
            console.error("Error in conversation:", error);
        } finally {
            setIsReplying(false);
        }
    };
    
    const handleNightSendMessage = async (message: string) => {
        if (!nightChatCustomer) return;
        const activeCustomer = nightChatCustomer;

        setIsReplying(true);
        const playerMessage = { role: 'player' as const, text: message };
        const updatedConversation = [...activeCustomer.conversation, playerMessage];
        setNightChatCustomer({ ...activeCustomer, conversation: updatedConversation });
        
        try {
            const aiResponseText = await continueConversation(activeCustomer.personality, updatedConversation);
            const customerMessage = { role: 'customer' as const, text: aiResponseText };
            
            const finalConversation = [...updatedConversation, customerMessage];
            setNightChatCustomer(prev => prev ? { ...prev, conversation: finalConversation } : null);
            setTownsfolk(prev => prev.map(c => c.id === activeCustomer.id ? { ...c, conversation: finalConversation } : c));
        } catch (error) {
            console.error("Error in conversation:", error);
        } finally {
            setIsReplying(false);
        }
    };

    const handleDayChatSendMessage = async (message: string) => {
        if (!dayChatCustomer) return;
        const activeCustomer = dayChatCustomer;

        setIsReplying(true);
        const playerMessage = { role: 'player' as const, text: message };
        const updatedConversation = [...activeCustomer.conversation, playerMessage];
        setDayChatCustomer({ ...activeCustomer, conversation: updatedConversation });
        
        try {
            const aiResponseText = await continueConversation(activeCustomer.personality, updatedConversation);
            const customerMessage = { role: 'customer' as const, text: aiResponseText };
            
            const finalConversation = [...updatedConversation, customerMessage];
            setDayChatCustomer(prev => prev ? { ...prev, conversation: finalConversation } : null);
            setTownsfolk(prev => prev.map(c => c.id === activeCustomer.id ? { ...c, conversation: finalConversation } : c));
        } catch (error) {
            console.error("Error in day chat conversation:", error);
        } finally {
            setIsReplying(false);
        }
    };
    
    const handleBuyDecoration = (decoration: Decoration) => {
        const count = purchasedDecorations.filter(id => id === decoration.id).length;
        if (gold >= decoration.price && count < decoration.limit) {
            updateGold(-decoration.price);
            setPurchasedDecorations(prev => [...prev, decoration.id]);
            if (decoration.type === 'seat') {
                setMaxSeats(prev => prev + 1);
            }
        }
    };

    useEffect(() => {
        if (gamePhase === 'day' && !currentCustomer && !isGeneratingCustomer) {
             if (inventory.breads.length === 0 && seatedCustomers.length === 0) {
                // Day is effectively over if no bread and no one is seated
                return;
             }
            const timer = setTimeout(() => {
                prepareNextCustomer();
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [gamePhase, currentCustomer, isGeneratingCustomer, prepareNextCustomer, inventory.breads, seatedCustomers]);
    
    const handleStartNightChat = (customer: Customer) => {
        const fullCustomer = townsfolk.find(c => c.id === customer.id);
        if(fullCustomer) setNightChatCustomer(fullCustomer);
    }
    const handleEndNightChat = () => {
        setNightChatCustomer(null);
    }

    const handleStartDayChat = (customerId: string) => {
        const customer = townsfolk.find(c => c.id === customerId);
        if (customer) {
            setDayChatCustomer(customer);
        }
    };

    const handleEndDayChat = () => {
        setDayChatCustomer(null);
    };
    
    const handleEndDay = () => {
        setGamePhase('summary');
    }

    const handleCloseSummary = () => {
        // Advance date
        setGameDate(prevDate => {
            let { year, season, day } = prevDate;
            day++;
            if (day > 30) {
                day = 1;
                switch (season) {
                    case Season.Spring: season = Season.Summer; break;
                    case Season.Summer: season = Season.Autumn; break;
                    case Season.Autumn: season = Season.Winter; break;
                    case Season.Winter:
                        season = Season.Spring;
                        year++;
                        break;
                }
            }
            return { year, season, day };
        });

        // Transition to night
        setGamePhase('night');

        // Reset daily states
        setCurrentCustomer(null);
        setSeatedCustomers([]);
        setDailyEarnings(0);
        setDailyFavorabilityChanges([]);
    };

    if (gamePhase === 'night') {
        return (
            <NightScene 
                gold={gold}
                inventory={inventory}
                townsfolk={townsfolk}
                purchasedDecorations={purchasedDecorations}
                nightChatCustomer={nightChatCustomer}
                isReplying={isReplying}
                gameDate={gameDate}
                updateGold={updateGold}
                updateInventory={updateInventory}
                onEndNight={() => setGamePhase('day')}
                onBuyDecoration={handleBuyDecoration}
                onStartNightChat={handleStartNightChat}
                onEndNightChat={handleEndNightChat}
                onSendMessage={handleNightSendMessage}
            />
        );
    }
    
    if (gamePhase === 'summary') {
        return (
            <EndOfDaySummary
                date={gameDate}
                earnings={dailyEarnings}
                favorabilityChanges={dailyFavorabilityChanges}
                onClose={handleCloseSummary}
            />
        );
    }

    return (
        <DayScene
            gold={gold}
            breads={inventory.breads}
            townsfolk={townsfolk}
            inventoryIngredients={inventory.ingredients}
            currentCustomer={currentCustomer}
            seatedCustomers={seatedCustomers}
            maxSeats={maxSeats}
            cafeComfort={cafeComfort}
            purchasedDecorations={purchasedDecorations}
            isGeneratingCustomer={isGeneratingCustomer}
            isReplying={isReplying}
            gameDate={gameDate}
            dayChatCustomer={dayChatCustomer}
            updateGold={updateGold}
            onSellBread={handleSellBread}
            onServeCoffee={handleServeCoffee}
            onEndDay={handleEndDay}
            onSendMessage={handleDaySendMessage}
            onStartDayChat={handleStartDayChat}
            onEndDayChat={handleEndDayChat}
            onDayChatSendMessage={handleDayChatSendMessage}
        />
    );
};

export default App;