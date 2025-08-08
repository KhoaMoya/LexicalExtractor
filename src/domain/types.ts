
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

export type ExtractAndTranslateWordsOutput = Word[];

export type ExtractAndTranslateResult = {
    data: ExtractAndTranslateWordsOutput | null;
    error: string | null;
    inputText: string;
};

export type ExtractionRecord = {
    time: Long;
    input: string;
    output: ExtractAndTranslateWordsOutput;
};

export type DataPage = {
    record: ExtractionRecord;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export type AppState = {
    data: DataPage | null;
    error: string | null;
    inputText: string;
};