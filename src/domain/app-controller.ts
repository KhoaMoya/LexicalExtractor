
'use client';
import { HistoryManager } from './history-manager';
import { PageManager } from './page-manager';
import type { ExtractionRecord, AppState, DataPage, ExtractAndTranslateResult } from './types';
import { extractAndTranslateWords } from './extract-and-translate-words';

export class AppController {
    private historyManager: HistoryManager;
    private pageManager: PageManager;

    constructor() {
        this.historyManager = new HistoryManager();
        this.pageManager = new PageManager(this.historyManager);
    }

    async addRecord(result: ExtractAndTranslateResult): Promise<AppState> {
        if (result.error) {
            return {
                data: this.pageManager.getCurrentPage(),
                error: result.error,
                inputText: result.inputText
            };
        } else {
            await this.historyManager.addToHistory(result.inputText, result.data || []);
            await this.historyManager.saveHistory();
            this.pageManager.reset();
            const topPage = this.pageManager.getCurrentPage();
            return {
                data: topPage,
                error: null,
                inputText: result.inputText
            };
        }
    }

    async extractAndTranslate(input: string): Promise<AppState | null> {
        return new Promise(async (resolve, reject) => {
            try {
                const output = await extractAndTranslateWords(input);
                await this.historyManager.addToHistory(input, output);
                await this.historyManager.saveHistory();

                // Reset the page manager and set the current page to the latest record
                this.pageManager.reset();
                const topPage = this.pageManager.getCurrentPage();

                resolve({
                    data: topPage,
                    error: null,
                    inputText: input
                });
            } catch (error) {
                console.error("Error in extraction and translation:", error);
                resolve({
                    data: null,
                    error: "Failed to extract and translate words. Please try again later.",
                    inputText: input
                });
            }
        });
    }

    getHistory(): ExtractionRecord[] {
        return this.historyManager.getAll();
    }

    getCurrentPage(): DataPage | null {
        return this.pageManager.getCurrentPage();
    }

    getNextPage(): DataPage | null {
        return this.pageManager.getNextPage();
    }

    getPreviousPage(): DataPage | null {
        return this.pageManager.getPreviousPage();
    }

    hasNextPage(): boolean {
        return this.pageManager.hasNextPage();
    }

    hasPreviousPage(): boolean {
        return this.pageManager.hasPreviousPage();
    }

    clearHistory(): void {
        this.historyManager.clearHistory();
        this.pageManager.reset();
    }
}