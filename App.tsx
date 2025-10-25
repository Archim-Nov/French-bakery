import React, { useState, useEffect, useCallback } from 'react';
import NightScene from './components/NightScene';
import DayScene from './components/DayScene';
import { generateCustomer, continueConversation } from './services/geminiService';
import type { GamePhase, Ingredients, Bread, Customer } from './types';
import { IngredientType } from './types';

const App: React.FC = () => {
    const [gamePhase, setGamePhase] = useState<GamePhase>('night');
    const [gold, setGold] = useState<number>(50);
    const [inventory, setInventory] = useState<{ ingredients: Ingredients; breads: Bread[] }>({
        ingredients: {
            [IngredientType.Flour]: 5,
            [IngredientType.Water]: 10,
            [IngredientType.Yeast]: 3,
            [IngredientType.Salt]: 3,
            [IngredientType.Sugar]: 2,
        },
        breads: [],
    });
    const [contacts, setContacts] = useState<Customer[]>([]);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [isGeneratingCustomer, setIsGeneratingCustomer] = useState<boolean>(false);
    const [isReplying, setIsReplying] = useState<boolean>(false);

    const updateGold = (amount: number) => {
        setGold(prev => Math.max(0, prev + amount));
    };

    const updateInventory = (newInventory: { ingredients: Ingredients; breads: Bread[] }) => {
        setInventory(newInventory);
    };

    const handleSellBread = (breadId: string) => {
        setInventory(prev => ({
            ...prev,
            breads: prev.breads.filter(b => b.id !== breadId)
        }));
        
        if (currentCustomer) {
            setContacts(prevContacts => {
                const existingContactIndex = prevContacts.findIndex(c => c.id === currentCustomer.id);
                if (existingContactIndex !== -1) {
                    // Customer exists, update favorability and conversation
                    const updatedContacts = [...prevContacts];
                    const existingContact = updatedContacts[existingContactIndex];
                    updatedContacts[existingContactIndex] = {
                        ...currentCustomer, // This includes the latest conversation
                        favorability: existingContact.favorability + 1,
                    };
                    return updatedContacts;
                } else {
                    // New customer, add to contacts with favorability 1
                    return [...prevContacts, { ...currentCustomer, favorability: 1 }];
                }
            });
        }
        setCurrentCustomer(null); // Trigger new customer generation
    };
    
    const fetchNewCustomer = useCallback(async () => {
        if (isGeneratingCustomer || currentCustomer) return;

        // Decide if a customer should return (40% chance if there are existing contacts)
        const shouldReturn = contacts.length > 0 && Math.random() < 0.4;

        if (shouldReturn) {
            const returningCustomer = contacts[Math.floor(Math.random() * contacts.length)];
            // Reset conversation for the new day to keep it fresh
            setCurrentCustomer({ ...returningCustomer, conversation: [] });
            return;
        }

        // Otherwise, generate a new customer
        setIsGeneratingCustomer(true);
        try {
            const customerData = await generateCustomer();
            setCurrentCustomer({ 
                ...customerData, 
                id: `customer-${Date.now()}`,
                favorability: 0,
                conversation: [],
            });
        } catch (error) {
            console.error("Failed to fetch new customer:", error);
        } finally {
            setIsGeneratingCustomer(false);
        }
    }, [isGeneratingCustomer, currentCustomer, contacts]);

    const handleSendMessage = async (message: string) => {
        if (!currentCustomer) return;
        setIsReplying(true);

        const playerMessage = { role: 'player' as const, text: message };
        const updatedConversation = [...currentCustomer.conversation, playerMessage];
        
        setCurrentCustomer(prev => prev ? { ...prev, conversation: updatedConversation } : null);

        try {
            const aiResponseText = await continueConversation(currentCustomer.personality, updatedConversation);
            const customerMessage = { role: 'customer' as const, text: aiResponseText };
            
            setCurrentCustomer(prev => prev ? { ...prev, conversation: [...updatedConversation, customerMessage] } : null);

        } catch (error) {
            console.error("Error in conversation:", error);
            const errorMessage = { role: 'customer' as const, text: "I... I don't know what to say." };
            setCurrentCustomer(prev => prev ? { ...prev, conversation: [...updatedConversation, errorMessage] } : null);
        } finally {
            setIsReplying(false);
        }
    };

    useEffect(() => {
        if (gamePhase === 'day' && !currentCustomer && !isGeneratingCustomer) {
            const timer = setTimeout(() => {
                fetchNewCustomer();
            }, 1500); // Small delay before new customer arrives
            return () => clearTimeout(timer);
        }
    }, [gamePhase, currentCustomer, isGeneratingCustomer, fetchNewCustomer]);

    if (gamePhase === 'night') {
        return (
            <NightScene 
                gold={gold}
                inventory={inventory}
                updateGold={updateGold}
                updateInventory={updateInventory}
                onEndNight={() => setGamePhase('day')}
            />
        );
    }

    return (
        <DayScene
            gold={gold}
            breads={inventory.breads}
            contacts={contacts}
            currentCustomer={currentCustomer}
            isGeneratingCustomer={isGeneratingCustomer}
            isReplying={isReplying}
            updateGold={updateGold}
            onSellBread={handleSellBread}
            onEndDay={() => setGamePhase('night')}
            onSendMessage={handleSendMessage}
        />
    );
};

export default App;