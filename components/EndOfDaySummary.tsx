import React from 'react';
import type { GameDate, FavorabilityChange } from '../types';
import { Season } from '../types';

interface EndOfDaySummaryProps {
    date: GameDate;
    earnings: number;
    favorabilityChanges: FavorabilityChange[];
    onClose: () => void;
}

const getNextDate = (currentDate: GameDate): GameDate => {
    let { year, season, day } = currentDate;
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
};

const getWeekday = (day: number): string => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return weekdays[(day - 1) % 7];
};

const EndOfDaySummary: React.FC<EndOfDaySummaryProps> = ({ date, earnings, favorabilityChanges, onClose }) => {
    const nextDate = getNextDate(date);
    const dateString = `${date.season} ${date.day}, Year ${date.year} (${getWeekday(date.day)})`;
    const nextDateString = `${nextDate.season} ${nextDate.day}, Year ${nextDate.year} (${getWeekday(nextDate.day)})`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-amber-100 rounded-lg shadow-xl w-full max-w-xl flex flex-col text-stone-800 animate-fade-in-up" style={{border: '8px solid #a16207'}}>
                <header className="p-4 text-center border-b-4 border-amber-800">
                    <h2 className="text-3xl font-bold text-amber-900">End of Day Summary</h2>
                    <p className="text-lg text-amber-800">{dateString} → {nextDateString}</p>
                </header>
                <main className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="bg-green-100 p-4 rounded-lg text-center mb-6">
                        <h3 className="text-xl font-bold text-green-800">Total Earnings</h3>
                        <p className="text-4xl font-bold text-green-700">🪙 {earnings}</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-amber-900 mb-2">Friendship Grew With...</h3>
                        {favorabilityChanges.length > 0 ? (
                            <ul className="space-y-2">
                                {favorabilityChanges.map(change => (
                                    <li key={change.customerId} className="flex items-center gap-4 p-2 bg-white/70 rounded-lg">
                                        <img src={change.avatarUrl} alt={change.customerName} className="w-12 h-12 rounded-full border-2 border-amber-600" />
                                        <div className="flex-grow">
                                            <p className="font-bold text-lg">{change.customerName}</p>
                                        </div>
                                        <div className="text-red-500 text-2xl">{'❤️'.repeat(change.newLevel)}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-stone-600 p-4 bg-stone-200/50 rounded-lg">No new friendships grew today.</p>
                        )}
                    </div>
                </main>
                <footer className="p-4">
                    <button onClick={onClose} className="w-full py-3 bg-amber-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-amber-700 transition-transform transform hover:scale-105">
                        Start the Night 🌙
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default EndOfDaySummary;
