
import React, { useState, useEffect, useRef } from 'react';
import type { Bread, Customer, DragItem } from '../types';
import ContactList from './ContactList';

interface DaySceneProps {
    gold: number;
    breads: Bread[];
    contacts: Customer[];
    currentCustomer: Customer | null;
    isGeneratingCustomer: boolean;
    isReplying: boolean;
    updateGold: (amount: number) => void;
    onSellBread: (breadId: string) => void;
    onEndDay: () => void;
    onSendMessage: (message: string) => void;
}

const DayScene: React.FC<DaySceneProps> = ({ gold, breads, contacts, currentCustomer, isGeneratingCustomer, isReplying, updateGold, onSellBread, onEndDay, onSendMessage }) => {
    const [chatInput, setChatInput] = useState('');
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [currentCustomer?.conversation]);

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

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim() && !isReplying) {
            onSendMessage(chatInput.trim());
            setChatInput('');
        }
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
                        <div className="w-full flex flex-col items-center">
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
                            
                            {/* Chat Box */}
                            {currentCustomer.favorability >= 1 && (
                                <div className="mt-6 w-full max-w-lg bg-stone-100 rounded-lg shadow-inner p-4 flex flex-col">
                                    <h3 className="text-lg font-bold text-stone-700 mb-2 text-center">Chat with {currentCustomer.name}</h3>
                                    <div ref={chatHistoryRef} className="flex-grow h-48 overflow-y-auto mb-2 p-2 bg-white rounded">
                                        {currentCustomer.conversation.map((msg, index) => (
                                            <div key={index} className={`chat ${msg.role === 'player' ? 'chat-end' : 'chat-start'}`}>
                                                <div className={`chat-bubble text-white ${msg.role === 'player' ? 'bg-blue-500' : 'bg-green-600'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        {isReplying && <div className="chat chat-start"><div className="chat-bubble bg-green-600/70 animate-pulse">...</div></div>}
                                    </div>
                                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                                        <input 
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Say something..."
                                            disabled={isReplying}
                                            className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        />
                                        <button type="submit" disabled={isReplying || !chatInput.trim()} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-stone-400">
                                            Send
                                        </button>
                                    </form>
                                </div>
                            )}
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