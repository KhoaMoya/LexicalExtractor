'use client';

import { Long } from 'bson';
import type { ExtractAndTranslateWordsOutput, ExtractionRecord } from './types';

export class HistoryManager {
    private records: ExtractionRecord[] = [];

    async addToHistory(input: string, output: ExtractAndTranslateWordsOutput): Promise<void> {
        const entry: ExtractionRecord = {
            time: Long.fromNumber(Date.now()),
            input: input,
            output: output
        };
        this.records.push(entry);
    }

    loadHistory(): void {
        const historyData = localStorage.getItem('extractionHistory');
        if (historyData) {
            this.records = JSON.parse(historyData);
        }
    }

    async saveHistory(): Promise<void> {
        localStorage.setItem('extractionHistory', JSON.stringify(this.records));
    }

    getAll(): ExtractionRecord[] {
        return this.records;
    }

    clearHistory(): void {
        this.records = [];
    }
}