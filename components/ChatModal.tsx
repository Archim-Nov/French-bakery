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
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [customer?.conversation]);

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim() && !isReplying) {
            onSendMessage(chatInput.trim());
            setChatInput('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-amber-100 rounded-lg shadow-xl w-full max-w-lg h-[70vh] flex flex-col text-stone-800">
                <header className="p-4 flex justify-between items-center border-b-2 border-amber-400">
                    <h2 className="text-2xl font-bold text-amber-900">Chat with {customer.name}</h2>
                    <button onClick={onClose} className="text-3xl font-bold text-amber-900 hover:text-red-600">&times;</button>
                </header>
                <main ref={chatHistoryRef} className="flex-grow p-4 overflow-y-auto">
                     {customer.conversation.map((msg, index) => (
                        <div key={index} className={`chat ${msg.role === 'player' ? 'chat-end' : 'chat-start'}`}>
                            <div className={`chat-bubble text-white ${msg.role === 'player' ? 'bg-blue-500' : 'bg-green-600'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isReplying && <div className="chat chat-start"><div className="chat-bubble bg-green-600/70 animate-pulse">...</div></div>}
                </main>
                <footer className="p-4 border-t-2 border-amber-400">
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
    );
};

export default ChatModal;