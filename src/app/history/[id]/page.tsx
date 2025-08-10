
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExtractionRecord, Word } from '@/domain/types';
import * as HistoryManager from '@/domain/history-manager';
import * as SettingsManager from '@/domain/settings-manager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, BookOpen, LogOut } from 'lucide-react';
import { PronunciationButton } from '@/components/pronunciation-button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StudySession } from '@/components/study-session';
import { useAuth } from '@/components/auth-provider';
import { signOutUser } from '@/domain/auth-manager';

export default function HistoryDetailPage() {
    const [record, setRecord] = useState<ExtractionRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [showWord, setShowWord] = useState(true);
    const [showVietnamese, setShowVietnamese] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    const params = useParams();
    const id = params.id as string;

    const fetchRecord = useCallback(async () => {
        if (id && user) {
            setLoading(true);
            const foundRecord = await HistoryManager.loadHistoryRecord(id);
            setRecord(foundRecord);
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

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

    const handleSignOut = async () => {
        await signOutUser();
        router.push('/login');
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading...</p>
            </div>
        )
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
                        <Button asChild variant="outline">
                            <Link href="/history">History</Link>
                        </Button>
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
                    <div className="mb-4">
                        <Button asChild variant="outline">
                            <Link href="/history" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to History
                            </Link>
                        </Button>
                    </div>
                    {record ? (
                        <div className="space-y-8">
                            <Card className="shadow-lg border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-headline">Original Text</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{record.input}</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-slate-200 dark:border-slate-800">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <CardTitle className="text-2xl font-headline">Extracted Words</CardTitle>
                                            <CardDescription>
                                                Found {record.words.length} unique word{record.words.length !== 1 ? 's' : ''}.
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" disabled={record.words.length === 0}>
                                                        <BookOpen className="mr-2 h-4 w-4" />
                                                        Start Study Session
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Study Session</DialogTitle>
                                                    </DialogHeader>
                                                    <StudySession words={record.words} />
                                                </DialogContent>
                                            </Dialog>
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
                                        {/* Mobile View */}
                                        <div className="sm:hidden">
                                            <div className="space-y-4">
                                                {record.words.map((item) => (
                                                    <div key={item.word} className="border rounded-lg p-4 space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <p className="font-medium text-lg">{showWord ? item.word : '***'}</p>
                                                            <div className="flex items-center">
                                                                <PronunciationButton word={item.word} lang="en-GB" label="UK" url={item.ukSoundUrl} />
                                                                <PronunciationButton word={item.word} lang="en-US" label="US" url={item.usSoundUrl} />
                                                            </div>
                                                        </div>
                                                        <p className="font-code text-sm text-muted-foreground">{item.phoneticTranscriptionUK}</p>
                                                        <div>
                                                            {showVietnamese ? (
                                                                <div className="flex flex-col gap-1">
                                                                    {item.vietnameseMeaning.map((meaning, index) => (
                                                                        <span key={index} className="text-sm">
                                                                            <b>{meaning.type}</b>: <span className="text-foreground/80">{meaning.meaning.slice(0, 2).join('; ')}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : '***'}
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
                                                        <TableHead className="font-bold">Word</TableHead>
                                                        <TableHead className="font-bold">Phonetics</TableHead>
                                                        <TableHead className="text-center font-bold">Pronounce</TableHead>
                                                        <TableHead className="font-bold">Vietnamese</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {record.words.map((item) => (
                                                        <TableRow key={item.word}>
                                                            <TableCell className="font-medium">{showWord ? item.word : '***'}</TableCell>
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
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                 </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
                            <CardContent>
                                <p className="text-muted-foreground text-center py-8">History record not found.</p>
                            </CardContent>
                        </Card>
                    )}
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
