
'use client';

import React, { useEffect, useState } from 'react';
import { ExtractionRecord } from '@/domain/types';
import * as HistoryManager from '@/domain/history-manager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Icons } from '@/components/icons';

function formatTimestamp(timestamp: any): string {
    if (timestamp && typeof timestamp.low === 'number' && typeof timestamp.high === 'number') {
        const millis = new Date(timestamp.low); // BSON Long can be approximated like this for recent dates
        return millis.toLocaleString();
    }
    // Fallback for standard Date objects or numbers
    return new Date(timestamp).toLocaleString();
}


export default function HistoryPage() {
    const [history, setHistory] = useState<ExtractionRecord[]>([]);

    useEffect(() => {
        setHistory(HistoryManager.loadHistory());
    }, []);

    const handleClearHistory = () => {
        const newHistory = HistoryManager.clearHistory();
        HistoryManager.saveHistory(newHistory);
        setHistory(newHistory);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
            <header className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-4">
                            <Icons.logo className="h-8 w-8 text-primary-foreground bg-primary rounded-lg p-1" />
                            <h1 className="text-3xl font-bold font-headline tracking-tight text-gray-800 dark:text-gray-100">
                                Lexical Extractor
                            </h1>
                        </Link>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/history">History</Link>
                    </Button>
                </div>
            </header>
            <main className="flex-grow pb-16 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-4xl mx-auto">
                    <Card className="shadow-lg border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl font-headline">Extraction History</CardTitle>
                                    <CardDescription>
                                        Here are your past extractions.
                                    </CardDescription>
                                </div>
                                <Button onClick={handleClearHistory} variant="destructive" disabled={history.length === 0}>
                                    Clear History
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {history.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Input Text</TableHead>
                                            <TableHead className="text-right">Word Count</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...history].reverse().map((record) => (
                                            <TableRow key={record.time.toString()}>
                                                <TableCell>{formatTimestamp(record.time)}</TableCell>
                                                <TableCell>
                                                    <p className="truncate max-w-xs">{record.input}</p>
                                                </TableCell>
                                                <TableCell className="text-right">{(record.words && record.words.length > 0) ? record.words.length : 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No history yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t">
                <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
                    <p>Built with Next.js and GenAI. A tool for language learners.</p>
                </div>
            </footer>
        </div>
    );
}
