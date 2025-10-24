
import React, { useState, useEffect, useCallback } from 'react';
import NightScene from './components/NightScene';
import DayScene from './components/DayScene';
import { generateCustomer } from './services/geminiService';
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
        if(currentCustomer) {
            const customerExists = contacts.some(c => c.id === currentCustomer.id);
            if (!customerExists) {
                setContacts(prev => [...prev, currentCustomer]);
            }
        }
        setCurrentCustomer(null); // Trigger new customer generation
    };
    
    const fetchNewCustomer = useCallback(async () => {
        if (isGeneratingCustomer || currentCustomer) return;

        setIsGeneratingCustomer(true);
        try {
            const customerData = await generateCustomer();
            setCurrentCustomer({ ...customerData, id: `customer-${Date.now()}` });
        } catch (error) {
            console.error("Failed to fetch new customer:", error);
        } finally {
            setIsGeneratingCustomer(false);
        }
    }, [isGeneratingCustomer, currentCustomer]);

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
            updateGold={updateGold}
            onSellBread={handleSellBread}
            onEndDay={() => setGamePhase('night')}
        />
    );
};

export default App;
