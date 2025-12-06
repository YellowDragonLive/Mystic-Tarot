import React, { useEffect, useState } from 'react';
import { X, Clock, Trash2, MessageSquare } from 'lucide-react';
import { ReadingHistoryItem } from '../types';
import { getReadings, clearHistory } from '../utils/history';
import { SPREADS } from '../constants';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestore: (reading: ReadingHistoryItem) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onRestore }) => {
    const [history, setHistory] = useState<ReadingHistoryItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            setHistory(getReadings());
        }
    }, [isOpen]);

    const handleClear = () => {
        if (confirm('Are you sure you want to clear all history?')) {
            clearHistory();
            setHistory([]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-amber-500/50 rounded-xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-amber-500/20 bg-slate-950">
                    <h2 className="text-xl font-serif text-amber-100 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-400" />
                        Reading History
                    </h2>
                    <div className="flex items-center gap-2">
                        {history.length > 0 && (
                            <button
                                onClick={handleClear}
                                className="p-2 hover:bg-red-900/20 text-slate-400 hover:text-red-400 rounded-full transition-colors"
                                title="Clear History"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-6 h-6 text-amber-100" />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                    {history.length === 0 ? (
                        <div className="text-center text-slate-500 py-10">
                            No readings recorded yet.
                        </div>
                    ) : (
                        history.map((item) => {
                            const spreadName = SPREADS.find(s => s.id === item.spreadId)?.name || 'Unknown Spread';
                            const date = new Date(item.timestamp).toLocaleString();
                            const firstQuestion = item.chatHistory.find(m => m.role === 'user' && !m.content.includes('Please interpret'))?.content;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onRestore(item)}
                                    className="w-full text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg p-4 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-serif text-amber-200 font-medium">{spreadName}</span>
                                        <span className="text-xs text-slate-500">{date}</span>
                                    </div>

                                    <div className="flex gap-2 mb-3 overflow-hidden">
                                        {item.drawnCards.slice(0, 5).map((dc, i) => (
                                            <div key={i} className="text-xs px-2 py-1 bg-slate-900 rounded text-slate-400 border border-slate-700">
                                                {dc.card.name_cn}
                                            </div>
                                        ))}
                                        {item.drawnCards.length > 5 && (
                                            <div className="text-xs px-2 py-1 text-slate-500">...</div>
                                        )}
                                    </div>

                                    {firstQuestion && (
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-700/50">
                                            <MessageSquare className="w-3 h-3" />
                                            <span className="truncate">Last asked: {firstQuestion}</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
};

export default HistoryModal;
