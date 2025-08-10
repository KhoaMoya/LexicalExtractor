import { type Long } from "bson";

export type Word = {
    word: string;
    vietnameseMeaning: Meaning[];
    phoneticTranscriptionUK: string;
    phoneticTranscriptionUS: string;
    ukSoundUrl?: string | null;
    usSoundUrl?: string | null;
};

export type Meaning = {
    type: string;
    meaning: string[];
};

export type ExtractAndTranslateResult = {
    words: Word[] | null;
    error: string | null;
    input: string;
};

export type ExtractionRecord = {
    id?: string; // Firestore document ID
    time: Long;
    input: string;
    words: Word[];
};
