import { ReadingHistoryItem } from '../types';

const HISTORY_KEY = 'mystic_tarot_history';

export const getReadings = (): ReadingHistoryItem[] => {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load history', e);
        return [];
    }
};

export const saveReading = (reading: ReadingHistoryItem) => {
    try {
        const history = getReadings();
        // Check if reading with same ID exists, update it if so
        const existingIndex = history.findIndex(h => h.id === reading.id);

        if (existingIndex >= 0) {
            history[existingIndex] = reading;
        } else {
            // Add new reading to the beginning
            history.unshift(reading);
        }

        // Limit history to 50 items to save space
        if (history.length > 50) {
            history.length = 50;
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save reading', e);
    }
};

export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};
