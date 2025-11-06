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
            <div className="bg-amber-100 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-row text-stone-800 overflow-hidden">
                {/* Left Panel: Character Portrait */}
                <div className="w-2/5 bg-stone-200 h-full relative flex items-center justify-center p-4">
                    <img src={customer.avatarUrl} alt={customer.name} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
                    
                    {liveCustomerMessage && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[90%] bg-white p-4 rounded-lg shadow-xl animate-fade-in-up">
                             <p className="text-lg italic text-stone-800 text-center">"{liveCustomerMessage.text}"</p>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-white"></div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Chat Interface */}
                <div className="w-3/5 flex flex-col">
                    <header className="p-4 flex justify-between items-center border-b-2 border-amber-400 shrink-0">
                        <h2 className="text-2xl font-bold text-amber-900">Chat with {customer.name}</h2>
                        <button onClick={onClose} className="text-3xl font-bold text-amber-900 hover:text-red-600">&times;</button>
                    </header>
                    <main ref={chatHistoryRef} className="flex-grow p-4 overflow-y-auto bg-white/50 space-y-4">
                        {conversationToDisplay.map((msg, index) => (
                            <div key={index} className={`chat ${msg.role === 'player' ? 'chat-end' : 'chat-start'}`}>
                                <div className="chat-image avatar">
                                    <div className="w-10 h-10 rounded-full bg-cover" style={{backgroundImage: msg.role === 'player' ? `url('https://em-content.zobj.net/source/microsoft/379/person-cook_1f469-200d-1f373.png')` : `url(${customer.avatarUrl})`}}>
                                    </div>
                                </div>
                                <div className={`chat-bubble text-white ${msg.role === 'player' ? 'bg-blue-500' : 'bg-green-600'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isReplying && (
                            <div className="chat chat-start">
                                <div className="chat-image avatar">
                                     <div className="w-10 h-10 rounded-full bg-cover" style={{backgroundImage: `url(${customer.avatarUrl})`}}></div>
                                </div>
                                <div className="chat-bubble bg-green-600/70 animate-pulse">...</div>
                            </div>
                        )}
                    </main>
                    <footer className="p-4 border-t-2 border-amber-400 shrink-0">
                        <form onSubmit={handleChatSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Say something..."
                                disabled={isReplying}
                                className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-800"
                                autoFocus
                            />
                            <button type="submit" disabled={isReplying || !chatInput.trim()} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-stone-400">
                                Send
                            </button>
                        </form>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;