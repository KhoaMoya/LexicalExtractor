
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ExtractionRecord } from '@/domain/types';
import * as HistoryManager from '@/domain/history-manager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogOut, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/components/auth-provider';
import { signOutUser } from '@/domain/auth-manager';


function formatTimestamp(timestamp: any): string {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }
    return date.toLocaleDateString();
}


export default function HistoryPage() {
    const [history, setHistory] = useState<ExtractionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user } = useAuth();

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const historyData = await HistoryManager.loadHistory();
        setHistory(historyData);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleClearHistory = async () => {
        await HistoryManager.clearHistory();
        fetchHistory();
    };
    
    const handleRemoveRecord = async (recordToRemove: ExtractionRecord) => {
        if (recordToRemove.id) {
            await HistoryManager.removeRecordFromHistory(recordToRemove.id);
            fetchHistory();
        }
    };

    const handleRowClick = (e: React.MouseEvent, record: ExtractionRecord) => {
        // Prevent row click when clicking on a button inside the row
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        router.push(`/history/${record.id}`);
    };
    
    const handleSignOut = async () => {
        await signOutUser();
        router.push('/login');
    }

    return (
        <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
            <header className="py-6 px-2 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-4">
                            <Icons.logo className="h-8 w-8 text-primary-foreground bg-primary rounded-lg p-1" />
                            <h1 className="text-3xl font-bold font-headline tracking-tight text-gray-800 dark:text-gray-100">
                                Lexical Extractor
                            </h1>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                          <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                            <LogOut className="h-5 w-5" />
                          </Button>
                        )}
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <main className="flex-grow pb-16 px-2 sm:px-6 lg:px-8">
                <div className="w-full max-w-4xl mx-auto">
                    <Card className="shadow-lg border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-headline">Extraction History</CardTitle>
                                    <CardDescription>
                                        Here are your past extractions. Click a row to see details.
                                    </CardDescription>
                                </div>
                                <Button onClick={handleClearHistory} variant="destructive" disabled={history.length === 0 || loading}>
                                    Clear History
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-muted-foreground text-center py-8">Loading history...</p>
                            ) : history.length > 0 ? (
                                <>
                                    {/* Mobile View */}
                                    <div className="sm:hidden">
                                        <div className="space-y-4">
                                            {history.map((record) => (
                                                <div
                                                    key={record.id}
                                                    onClick={(e) => handleRowClick(e, record)}
                                                    className="cursor-pointer border rounded-lg p-4 space-y-2"
                                                >
                                                    <div>
                                                        <span className="font-bold text-sm text-muted-foreground">Input Text</span>
                                                        <p className="truncate">{record.input}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="font-bold text-sm text-muted-foreground">Word Count</span>
                                                            <p>{(record.words && record.words.length > 0) ? record.words.length : 0}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-sm text-muted-foreground">Date</span>
                                                            <p>{formatTimestamp(record.time.toNumber())}</p>
                                                        </div>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete this history record.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleRemoveRecord(record)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Desktop View */}
                                    <div className="hidden sm:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Input Text</TableHead>
                                                    <TableHead className="text-center">Word Count</TableHead>
                                                    <TableHead className="text-center">Date</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {history.map((record) => (
                                                    <TableRow
                                                        key={record.id}
                                                        onClick={(e) => handleRowClick(e, record)}
                                                        className="cursor-pointer"
                                                    >
                                                        <TableCell>
                                                            <p className="truncate max-w-md">{record.input}</p>
                                                        </TableCell>
                                                        <TableCell className="text-center">{(record.words && record.words.length > 0) ? record.words.length : 0}</TableCell>
                                                        <TableCell className="text-center">{formatTimestamp(record.time.toNumber())}</TableCell>
                                                        <TableCell className="text-right">
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete this history record.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleRemoveRecord(record)}>
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No history yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <footer className="py-6 px-2 sm:px-6 lg:px-8 border-t">
                <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
                    <p>Built with Next.js and GenAI. A tool for language learners.</p>
                </div>
            </footer>
        </div>
    );
}
