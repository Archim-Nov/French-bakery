import React, { useState, useEffect, useRef } from 'react';
import type { Customer } from '../types';

interface ChatModalProps {
    customer: Customer;
    isReplying: boolean;
    onClose: () => void;
    onSendMessage: (message: string) => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ customer, isReplying, onClose, onSendMessage }) => {
    const [chatInput, setChatInput] = useState('');
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatHistoryRef.current) {
            // Scroll to the bottom of the chat history
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [customer?.conversation, isReplying]);

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim() && !isReplying) {
            onSendMessage(chatInput.trim());
            setChatInput('');
        }
    };

    const lastMessage = customer.conversation[customer.conversation.length - 1];
    const liveCustomerMessage = lastMessage?.role === 'customer' ? lastMessage : null;
    const conversationToDisplay = liveCustomerMessage ? customer.conversation.slice(0, -1) : customer.conversation;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-amber-50 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-row text-stone-800 overflow-hidden border border-amber-100">
                {/* Left Panel: Character Portrait */}
                <div className="w-2/5 bg-stone-200 h-full relative flex items-center justify-center p-4" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")'}}>
                    <img src={customer.avatarUrl} alt={customer.name} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
                    
                    {liveCustomerMessage && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl animate-fade-in-up border border-stone-200">
                             <p className="text-lg italic text-stone-800 text-center font-serif">"{liveCustomerMessage.text}"</p>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-white/90"></div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Chat Interface */}
                <div className="w-3/5 flex flex-col bg-stone-50">
                    <header className="p-4 flex justify-between items-center border-b border-amber-200 bg-white shadow-sm shrink-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-200 bg-cover bg-top border border-amber-300" style={{backgroundImage: `url(${customer.avatarUrl})`}}></div>
                            <div>
                                <h2 className="text-xl font-bold text-stone-800">{customer.name}</h2>
                                <p className="text-xs text-stone-500">Online</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-2 rounded-full hover:bg-stone-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </header>
                    
                    <main ref={chatHistoryRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-stone-50" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")'}}>
                        {conversationToDisplay.map((msg, index) => {
                            const isPlayer = msg.role === 'player';
                            return (
                                <div key={index} className={`flex w-full ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-[80%] md:max-w-[70%] flex-col ${isPlayer ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-4 py-2 shadow-sm text-sm md:text-base break-words ${
                                            isPlayer 
                                            ? 'bg-amber-600 text-white rounded-2xl rounded-br-sm' 
                                            : 'bg-white text-stone-800 border border-stone-200 rounded-2xl rounded-bl-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isReplying && (
                            <div className="flex w-full justify-start">
                                <div className="bg-white text-stone-800 border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                    
                    <footer className="p-4 bg-white border-t border-amber-200 shrink-0">
                        <form onSubmit={handleChatSubmit} className="flex gap-3 items-center">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type a message..."
                                disabled={isReplying}
                                className="flex-grow p-3 bg-stone-100 border-none rounded-full focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-800 placeholder-stone-400"
                                autoFocus
                            />
                            <button 
                                type="submit" 
                                disabled={isReplying || !chatInput.trim()} 
                                className="p-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-transform transform active:scale-95 shadow-md flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            </button>
                        </form>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;