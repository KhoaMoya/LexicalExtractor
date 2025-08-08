'use client';

import { Long } from 'bson';
import type { Word, ExtractionRecord } from './types';

function getLocalStorage(): Storage | undefined {
    if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
    }
    return undefined;
}

export function addToHistory(records: ExtractionRecord[], input: string, words: Word[]): ExtractionRecord[] {
    const entry: ExtractionRecord = {
        time: Long.fromNumber(Date.now()),
        input: input,
        words: words
    };
    return [...records, entry];
}

export function loadHistory(): ExtractionRecord[] {
    const localStorage = getLocalStorage();
    if (!localStorage) return [];

    const historyData = localStorage.getItem('extractionHistory');
    if (historyData) {
        try {
            const parsedData = JSON.parse(historyData);
            return parsedData.map((record: any) => ({
                ...record,
                time: new Long(record.time.low, record.time.high, record.time.unsigned)
            }));
        } catch (e) {
            console.error("Failed to parse history from localStorage", e);
            return [];
        }
    }
    return [];
}

export function saveHistory(records: ExtractionRecord[]): void {
    const localStorage = getLocalStorage();
    if (!localStorage) return;
    localStorage.setItem('extractionHistory', JSON.stringify(records));
}

export function clearHistory(): ExtractionRecord[] {
    const localStorage = getLocalStorage();
    if (localStorage) {
        localStorage.removeItem('extractionHistory');
    }
    return [];
}
