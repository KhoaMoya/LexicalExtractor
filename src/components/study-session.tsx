
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Word } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PronunciationButton } from './pronunciation-button';
import { Icons } from './icons';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { playPronunciation } from '@/lib/audio-player';

interface StudySessionProps {
    words: Word[];
}

type StudyStatus = 'idle' | 'correct' | 'incorrect';

export function StudySession({ words }: StudySessionProps) {
    const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [status, setStatus] = useState<StudyStatus>('idle');
    const [score, setScore] = useState(0);
    const [sessionFinished, setSessionFinished] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playSound = (word: Word) => {
        playPronunciation(word.word, word.ukSoundUrl, 'en-GB', audioRef);
    };
    
    useEffect(() => {
        // Shuffle words on component mount
        const newShuffledWords = [...words].sort(() => Math.random() - 0.5);
        setShuffledWords(newShuffledWords);
        if (newShuffledWords.length > 0) {
            // Use a timeout to ensure the browser has had a chance to interact
            setTimeout(() => playSound(newShuffledWords[0]), 100);
        }
        inputRef.current?.focus();
    }, [words]);

    const currentWord = useMemo(() => shuffledWords[currentIndex], [shuffledWords, currentIndex]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (status !== 'idle') {
            setStatus('idle');
        }
    };

    const checkAnswer = () => {
        if (inputValue.trim().toLowerCase() === currentWord.word.toLowerCase()) {
            setStatus('correct');
            setScore(prev => prev + 1);
            setTimeout(goToNextWord, 2000);
        } else {
            setStatus('incorrect');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (status === 'correct') {
                goToNextWord();
            } else {
                checkAnswer();
            }
        }
    };

    const goToNextWord = () => {
        if (currentIndex < shuffledWords.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setInputValue('');
            setStatus('idle');
            playSound(shuffledWords[nextIndex]);
            inputRef.current?.focus();
        } else {
            setSessionFinished(true);
        }
    };
    
    const goToPreviousWord = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            setInputValue('');
            setStatus('idle');
            playSound(shuffledWords[prevIndex]);
            inputRef.current?.focus();
        }
    };

    const restartSession = () => {
        const newShuffledWords = [...words].sort(() => Math.random() - 0.5);
        setShuffledWords(newShuffledWords);
        setCurrentIndex(0);
        setScore(0);
        setInputValue('');
        setStatus('idle');
        setSessionFinished(false);
        if (newShuffledWords.length > 0) {
            playSound(newShuffledWords[0]);
        }
        inputRef.current?.focus();
    };

    const progress = (currentIndex / shuffledWords.length) * 100;

    if (shuffledWords.length === 0) {
        return <p>No words to study.</p>;
    }
    
    if (sessionFinished) {
        return (
            <div className="text-center p-4">
                <h3 className="text-2xl font-bold mb-4">Session Complete!</h3>
                <p className="text-lg mb-6">Your score: {score} / {shuffledWords.length}</p>
                <Button onClick={restartSession}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Study Again
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full p-1">
            <Progress value={progress} className="mb-4" />
            <p className="text-center text-sm text-muted-foreground mb-4">
                Word {currentIndex + 1} of {shuffledWords.length}
            </p>

            <Card className="relative">
                <CardHeader>
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <h3 className="text-lg font-semibold">Listen & Write</h3>
                        <PronunciationButton word={currentWord.word} lang="en-GB" label="UK" url={currentWord.ukSoundUrl} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center mb-4 min-h-[50px]">
                        {currentWord.vietnameseMeaning.slice(0, 2).map((meaning, index) => (
                            <p key={index} className="text-muted-foreground">
                                <b>{meaning.type}</b>: {meaning.meaning.slice(0, 1).join('; ')}
                            </p>
                        ))}
                    </div>

                    <div className="relative">
                        <Input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type the word here..."
                            className={cn(
                                "text-center text-lg h-12",
                                status === 'correct' && 'border-green-500 focus-visible:ring-green-500',
                                status === 'incorrect' && 'border-red-500 focus-visible:ring-red-500'
                            )}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                        />
                        {status === 'correct' && <Icons.check className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-green-500" />}
                        {status === 'incorrect' && <Icons.close className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-red-500" />}
                    </div>

                    {status === 'incorrect' && (
                        <div className="text-center text-red-500 mt-2">
                            <p>Correct answer: <strong className="font-bold">{currentWord.word}</strong></p>
                            <p className="font-code text-sm">{currentWord.phoneticTranscriptionUK}</p>
                        </div>
                    )}
                     {status === 'correct' && (
                        <div className="text-center text-muted-foreground mt-2">
                            <p className="font-code text-sm">{currentWord.phoneticTranscriptionUK}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
                    <Button variant="outline" onClick={goToPreviousWord} disabled={currentIndex === 0} className="w-full sm:w-auto">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Prev
                    </Button>
                    <Button onClick={checkAnswer} disabled={status === 'correct'} className="w-full sm:w-auto">
                        Check Answer
                    </Button>
                    <Button variant="outline" onClick={goToNextWord} className="w-full sm:w-auto">
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

