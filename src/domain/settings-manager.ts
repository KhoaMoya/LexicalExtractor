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
    const localStorage = getLocalStorage();
    if (!localStorage) return true;
    const value = localStorage.getItem(SHOW_WORD_KEY);
    return value ? JSON.parse(value) : true;
}

export function setShowWord(show: boolean): void {
    const localStorage = getLocalStorage();
    if (!localStorage) return;
    localStorage.setItem(SHOW_WORD_KEY, JSON.stringify(show));
}

export function getShowVietnamese(): boolean {
    const localStorage = getLocalStorage();
    if (!localStorage) return true;
    const value = localStorage.getItem(SHOW_VIETNAMESE_KEY);
    return value ? JSON.parse(value) : true;
}

export function setShowVietnamese(show: boolean): void {
    const localStorage = getLocalStorage();
    if (!localStorage) return;
    localStorage.setItem(SHOW_VIETNAMESE_KEY, JSON.stringify(show));
}
