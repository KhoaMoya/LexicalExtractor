'use client';

import type { MutableRefObject } from 'react';

/**
 * Plays the pronunciation of a word, either from a URL or using speech synthesis.
 * @param text The word to pronounce.
 * @param url The URL of the audio file.
 * @param lang The language for speech synthesis.
 * @param audioRef Optional ref to an audio element for playback.
 */
export function playPronunciation(
    text: string,
    url: string | null | undefined,
    lang: 'en-US' | 'en-GB',
    audioRef?: MutableRefObject<HTMLAudioElement | null>
) {
    if (url) {
        const audio = audioRef?.current ?? new Audio();
        if (audioRef && !audioRef.current) {
            audioRef.current = audio;
        }
        
        // If the src is the same, just play again. Otherwise, set new src.
        if (audio.src !== url) {
            audio.src = url;
        }
        audio.pause();
        audio.currentTime = 0;
        audio.play().catch(e => console.error("Audio playback failed", e));

    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
        // Fallback to speech synthesis if no URL is provided
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find((voice) => voice.lang === lang);

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else {
            utterance.lang = lang;
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
}
