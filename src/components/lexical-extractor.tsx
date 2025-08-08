"use client";

import React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import * as HistoryManager from '@/domain/history-manager';
import * as SettingsManager from '@/domain/settings-manager';
import { handleExtractAndTranslate } from "@/app/actions";
import type { ExtractAndTranslateResult, Word } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PronunciationButton } from "@/components/pronunciation-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


const useActionState = React.useActionState || useFormState;

const initialState: ExtractAndTranslateResult = {
  words: null,
  error: null,
  input: ""
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Extracting...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Extract & Translate
        </>
      )}
    </Button>
  );
}

interface ResultsSectionProps {
  state: ExtractAndTranslateResult;
}

function ResultsSection({ state }: ResultsSectionProps) {
  const { pending } = useFormStatus();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((state.words || state.error) && !pending) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state, pending]);

  if (pending) return <div ref={resultsRef} className="mt-8"><LoadingSkeleton /></div>;
  if (state.error) return <div ref={resultsRef} className="mt-8"><Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert></div>;
  
  if (state.words && state.words.length > 0) {
    return (
      <div ref={resultsRef} className="mt-8">
        <ResultsTable words={state.words!} />
      </div>
    );
  }

  if (state.words && state.words.length === 0) {
    return <div ref={resultsRef} className="mt-8"><Alert><AlertTitle>No Words Found</AlertTitle><AlertDescription>No distinct words could be extracted. Please try different text.</AlertDescription></Alert></div>;
  }

  return null
}


export function LexicalExtractor() {
    const [state, formAction] = useActionState(handleExtractAndTranslate, initialState);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
    useEffect(() => {
      if (state.words || state.error) {
        if (textAreaRef.current) {
          textAreaRef.current.value = state.input;
        }
      }
      if (state.words && state.words.length > 0) {
        let history = HistoryManager.loadHistory();
        history = HistoryManager.addToHistory(history, state.input, state.words || []);
        HistoryManager.saveHistory(history);
      }
    }, [state]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form action={formAction}>
        <Card className="shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="bg-card">
            <CardTitle className="text-2xl font-headline">Text Input</CardTitle>
            <CardDescription>Paste your text below to extract and translate distinct words.</CardDescription>
          </CardHeader>
          <CardContent className="bg-card">
            <Textarea
              ref={textAreaRef}
              name="text"
              placeholder="Enter any English text here"
              rows={8}
              className="resize-y min-h-[150px] text-base"
              required
              minLength={1}
              defaultValue={state.input}
            />
          </CardContent>
          <CardFooter className="flex justify-end bg-slate-50 dark:bg-card/50 border-t p-4">
            <SubmitButton />
          </CardFooter>
        </Card>

        <ResultsSection state={state} />
      </form>
    </div>
  );
}

function ResultsTable({ words }: { words: Word[] }) {
  const [showWord, setShowWord] = useState(true);
  const [showVietnamese, setShowVietnamese] = useState(true);

  useEffect(() => {
    setShowWord(SettingsManager.getShowWord());
    setShowVietnamese(SettingsManager.getShowVietnamese());
  }, []);

  const handleShowWordChange = (checked: boolean) => {
    setShowWord(checked);
    SettingsManager.setShowWord(checked);
  };

  const handleShowVietnameseChange = (checked: boolean) => {
    setShowVietnamese(checked);
    SettingsManager.setShowVietnamese(checked);
  };

  return (
    <Card className="shadow-lg border-slate-200 dark:border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <CardTitle className="text-2xl font-headline">Extracted Words</CardTitle>
                <CardDescription>
                Found {words.length} unique word{words.length > 1 ? 's' : ''}.
                </CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="show-word-toggle" checked={showWord} onCheckedChange={handleShowWordChange} />
                  <Label htmlFor="show-word-toggle">Show Word</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="show-vietnamese-toggle" checked={showVietnamese} onCheckedChange={handleShowVietnameseChange} />
                  <Label htmlFor="show-vietnamese-toggle">Show Vietnamese</Label>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Word</TableHead>
                <TableHead className="font-bold">Vietnamese</TableHead>
                <TableHead className="font-bold">Phonetics</TableHead>
                <TableHead className="text-center font-bold">Pronounce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {words.map((item) => (
                <TableRow key={item.word}>
                  <TableCell className="font-medium">{showWord ? item.word : '***'}</TableCell>
                  <TableCell>
                      {showVietnamese ? (
                        <div className="flex flex-col gap-1">
                          {item.vietnameseMeaning.map((meaning, index) => (
                            <span key={index} className="text-sm text-muted-foreground">
                              <b>{meaning.type}</b>: <span className="text-foreground">{meaning.meaning.slice(0, 2).join('; ')}</span>
                            </span>
                          ))}
                        </div>
                      ) : '***'}
                  </TableCell>
                  <TableCell className="font-code text-sm">
                    <div className="flex flex-col gap-1">
                      <span>{item.phoneticTranscriptionUK}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-1 sm:gap-2">
                      <PronunciationButton word={item.word} lang="en-GB" label="UK" url={item.ukSoundUrl} />
                      <PronunciationButton word={item.word} lang="en-US" label="US" url={item.usSoundUrl} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="shadow-lg border-slate-200 dark:border-slate-800">
      <CardHeader>
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-4 w-64 mt-2 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableHead key={i}><Skeleton className="h-5 w-24 rounded-md" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-md" /></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-36 rounded-md" />
                      <Skeleton className="h-4 w-36 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
