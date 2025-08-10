'use client';

function getLocalStorage(): Storage | undefined {
    if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
    }
    return undefined;
}

const SHOW_WORD_KEY = 'showWord';
const SHOW_VIETNAMESE_KEY = 'showVietnamese';

export function getShowWord(): boolean {
    return true;
}

export function setShowWord(show: boolean): void {
    // No-op
}

export function getShowVietnamese(): boolean {
    return true;
}

export function setShowVietnamese(show: boolean): void {
    // No-op
}
