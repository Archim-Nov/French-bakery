import React, { useState } from 'react';
import type { Customer } from '../types';

interface ContactListProps {
    townsfolk: Customer[];
}

const ContactList: React.FC<ContactListProps> = ({ townsfolk }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Sort by favorability (desc) and then by name (asc)
    const sortedTownsfolk = [...townsfolk].sort((a, b) => {
        if (b.favorability !== a.favorability) {
            return b.favorability - a.favorability;
        }
        return a.name.localeCompare(b.name);
    });

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-4 right-4 bg-amber-800 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl z-20 hover:bg-amber-900 transition-transform transform hover:scale-110">
                👥
            </button>
            <div className={`fixed top-0 right-0 h-full bg-amber-200/95 backdrop-blur-sm shadow-2xl z-10 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{width: 'min(300px, 80vw)'}}>
                <div className="p-4 flex justify-between items-center border-b border-amber-400">
                    <h2 className="text-2xl font-bold text-amber-900">Townsfolk</h2>
                    <button onClick={() => setIsOpen(false)} className="text-2xl font-bold text-amber-900">&times;</button>
                </div>
                <ul className="p-2 overflow-y-auto h-[calc(100%-60px)]">
                    {sortedTownsfolk.length === 0 ? (
                        <p className="p-4 text-center text-amber-800">The town seems empty...</p>
                    ) : (
                        sortedTownsfolk.map(character => (
                            <li key={character.id} className={`flex items-center gap-4 p-2 mb-2 bg-white/50 rounded-lg transition-opacity ${character.favorability === 0 ? 'opacity-70' : ''}`}>
                                <img src={character.avatarUrl} alt={character.name} className="w-12 h-12 rounded-full border-2 border-amber-600" />
                                <div>
                                    <p className="font-bold">{character.name}</p>
                                    <div className="mt-1 text-red-500" title={`Favorability: ${character.favorability}`}>
                                        {character.favorability > 0 ? '❤️'.repeat(character.favorability) : '🤍'}
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </>
    );
};

export default ContactList;
