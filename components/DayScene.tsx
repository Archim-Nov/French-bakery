
import React, { useState } from 'react';
import type { Bread, Customer, DragItem } from '../types';
import ContactList from './ContactList';

interface DaySceneProps {
    gold: number;
    breads: Bread[];
    contacts: Customer[];
    currentCustomer: Customer | null;
    isGeneratingCustomer: boolean;
    updateGold: (amount: number) => void;
    onSellBread: (breadId: string) => void;
    onEndDay: () => void;
}

const DayScene: React.FC<DaySceneProps> = ({ gold, breads, contacts, currentCustomer, isGeneratingCustomer, updateGold, onSellBread, onEndDay }) => {
    const [draggedBread, setDraggedBread] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, bread: Bread) => {
        const dragItem: DragItem = { type: 'bread', id: bread.id };
        e.dataTransfer.setData('application/json', JSON.stringify(dragItem));
        e.currentTarget.style.opacity = '0.5';
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const item: DragItem = JSON.parse(data);

        if (item.type === 'bread') {
            const breadToSell = breads.find(b => b.id === item.id);
            if (breadToSell) {
                updateGold(breadToSell.price);
                onSellBread(breadToSell.id);
            }
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

    return (
        <div className="min-h-screen bg-amber-100 p-4 sm:p-8 flex flex-col" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/brushed-alum.png")'}}>
            <header className="flex justify-between items-center mb-8 p-4 bg-white/50 rounded-lg shadow-md">
                <h1 className="text-4xl font-bold text-amber-900">☀️ Day Phase: Selling</h1>
                <div className="flex items-center gap-4 text-2xl">
                    <span className="font-bold">🪙 {gold}</span>
                    <button onClick={onEndDay} className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">End Day & Bake 🌙</button>
                </div>
            </header>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Area */}
                <div className="lg:col-span-2 bg-white/70 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
                    {isGeneratingCustomer && (
                        <div className="text-center">
                            <p className="text-2xl animate-pulse">A new customer is arriving...</p>
                        </div>
                    )}
                    {!isGeneratingCustomer && currentCustomer && (
                        <div 
                            onDrop={handleDrop} 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className="text-center p-6 border-4 border-dashed border-transparent rounded-full transition-all duration-300"
                        >
                            <img src={currentCustomer.avatarUrl} alt={currentCustomer.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-amber-600 shadow-xl" />
                            <h2 className="text-3xl font-bold">{currentCustomer.name}</h2>
                            <div className="relative mt-4 bg-amber-50 p-4 rounded-lg shadow-md max-w-md mx-auto">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-amber-50"></div>
                                <p className="text-lg italic">"{currentCustomer.dialogue}"</p>
                            </div>
                        </div>
                    )}
                    {!isGeneratingCustomer && !currentCustomer && (
                        <div className="text-center">
                            <p className="text-2xl text-stone-600">Waiting for a customer...</p>
                        </div>
                    )}
                </div>

                {/* Inventory Area */}
                <div className="bg-amber-300/50 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 border-b-2 border-amber-500 pb-2">Your Baked Bread</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                        {breads.length > 0 ? breads.map(bread => (
                            <div key={bread.id} draggable onDragStart={(e) => handleDragStart(e, bread)} onDragEnd={handleDragEnd} className="p-4 bg-amber-50 rounded-lg text-center shadow-md cursor-grab active:cursor-grabbing transform hover:scale-105 transition-transform">
                                <span className="text-5xl">🍞</span>
                                <p className="font-bold">{bread.name}</p>
                                <p className="text-sm">🪙 {bread.price}</p>
                            </div>
                        )) : (
                            <p className="col-span-full text-center text-stone-700 mt-4">No bread to sell! Go bake some tonight.</p>
                        )}
                    </div>
                </div>
            </main>
            <ContactList contacts={contacts} />
        </div>
    );
};

export default DayScene;
