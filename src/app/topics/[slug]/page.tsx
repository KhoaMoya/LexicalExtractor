'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LogOut, PlayCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';
import { signOutUser } from '@/domain/auth-manager';
import { getTopicBySlug, getWordsForTopic } from '@/domain/topics';
import { getStatusFor, setStatusFor, syncFromRemote } from '@/domain/learning-manager';
import { StudySession } from '@/components/study-session';
import { PronunciationButton } from '@/components/pronunciation-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type TopicDetailPageProps = {
  params: {
    slug: string;
  };
};

export default function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { user } = useAuth();
  const router = useRouter();

  const topic = getTopicBySlug(params.slug);
  const words = useMemo(() => getWordsForTopic(params.slug), [params.slug]);
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [studyOpen, setStudyOpen] = useState(false);
  const [studyStarted, setStudyStarted] = useState(false);

  const toggleSelect = (name: string) => {
    setSelectedWords(prev => {
      const s = new Set(prev);
      if (s.has(name)) s.delete(name);
      else s.add(name);
      return s;
    });
  };

  const clearSelect = () => setSelectedWords(new Set());

  const selectedStudyWords = useMemo(() => {
    if (!words) return [];
    if (selectedWords.size === 0) return words;
    return words.filter(w => {
      const key = (w as any).word ?? (w as any).name;
      return key && selectedWords.has(key);
    });
  }, [words, selectedWords]);

  useEffect(() => {
    if (!topic) return;
    const list = topic.vocabularies.map((v: any) => ({
      ...v,
      status: getStatusFor(topic.slug, v.name),
    }));
    setVocabList(list);
  }, [topic]);

  // when user is authenticated, fetch remote records and merge to local view
  useEffect(() => {
    if (!topic || !user) return;
    (async () => {
      const updated = await Promise.all(
        topic.vocabularies.map(async (v: any) => {
          const remote = await syncFromRemote(topic.slug, v.name);
          if (remote && remote.status) {
            return { ...v, status: remote.status };
          }
          return { ...v, status: getStatusFor(topic.slug, v.name) };
        })
      );
      setVocabList(updated);
    })();
  }, [topic, user]);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  if (!topic || !words || words.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
        <header className="py-4 px-3 sm:px-6 lg:px-8 border-b">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                asChild
              >
                <Link href="/topics">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Topics
                </Link>
              </Button>
              <h1 className="text-xl font-bold font-headline tracking-tight">
                Topic not found
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-4xl mx-auto pt-8 text-sm text-muted-foreground">
            Chủ đề không tồn tại hoặc chưa có từ vựng.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
      <header className="py-4 px-3 sm:px-6 lg:px-8 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              asChild
            >
              <Link href="/topics">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              asChild
            >
              <Link href="/topics">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Topics
              </Link>
            </Button>
            <h1 className="text-base sm:text-xl font-bold font-headline tracking-tight line-clamp-1">
              {topic.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-[70rem] mx-auto pt-4 sm:pt-6 space-y-4">
          <Card className="shadow-lg border-slate-200 dark:border-slate-800">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl font-headline">
                    {topic.name}
                  </CardTitle>
                  <CardDescription>
                    {topic.vocabularies.length} từ vựng trong chủ đề này
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={studyOpen} onOpenChange={(open) => {
                    setStudyOpen(open);
                    if (!open) {
                      setStudyStarted(false);
                      clearSelect();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-3 py-1 text-xs sm:text-sm"
                        onClick={() => setStudyOpen(true)}
                      >
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Study
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl w-[95%] sm:w-full">
                      <DialogHeader className="mb-2">
                        <DialogTitle className="text-base sm:text-lg">
                          Study · {topic?.name}
                        </DialogTitle>
                      </DialogHeader>

                      {!studyStarted && (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                          <p className="text-sm text-muted-foreground">Chọn từ bạn muốn học rồi nhấn "Start" (để trống = tất cả)</p>
                          <div className="grid gap-2">
                            {vocabList.map((v: any) => (
                              <label key={v.name} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedWords.has(v.name)}
                                  onChange={() => toggleSelect(v.name)}
                                  className="h-4 w-4"
                                />
                                <span className="font-medium">{v.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">{v.phonetics}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => { setStudyOpen(false); }}>
                              Cancel
                            </Button>
                            <Button onClick={() => setStudyStarted(true)}>
                              Start
                            </Button>
                          </div>
                        </div>
                      )}

                      {studyStarted && (
                        <div className="max-h-[70vh] overflow-y-auto">
                          <StudySession words={selectedStudyWords} />
                          <div className="flex items-center justify-end gap-2 mt-3">
                            <Button variant="outline" onClick={() => { setStudyStarted(false); }}>
                              Back
                            </Button>
                            <Button onClick={() => { setStudyOpen(false); setStudyStarted(false); clearSelect(); }}>
                              Close
                            </Button>
                          </div>
                        </div>
                      )}

                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile view: cards */}
              <div className="sm:hidden space-y-2">
                {vocabList.map((vocab, idx) => {
                  return (
                    <Card
                      key={vocab.name}
                      className="p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">
                              {vocab.name}
                            </p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <span>
                                  <Badge variant={
                                    vocab.status === 'Đã thuộc'
                                      ? 'default'
                                      : vocab.status === 'Đang học'
                                        ? 'secondary'
                                        : vocab.status === 'Bỏ qua'
                                          ? 'destructive'
                                          : 'outline'
                                  } className="cursor-pointer">
                                    {vocab.status}
                                  </Badge>
                                </span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => {
                                  setStatusFor(topic.slug, vocab.name, 'Chưa học');
                                  setVocabList(prev => prev.map(p => p.name === vocab.name ? { ...p, status: 'Chưa học' } : p));
                                }}>Chưa học</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => {
                                  setStatusFor(topic.slug, vocab.name, 'Đang học');
                                  setVocabList(prev => prev.map(p => p.name === vocab.name ? { ...p, status: 'Đang học' } : p));
                                }}>Đang học</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => {
                                  setStatusFor(topic.slug, vocab.name, 'Đã thuộc');
                                  setVocabList(prev => prev.map(p => p.name === vocab.name ? { ...p, status: 'Đã thuộc' } : p));
                                }}>Đã thuộc</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => {
                                  setStatusFor(topic.slug, vocab.name, 'Bỏ qua');
                                  setVocabList(prev => prev.map(p => p.name === vocab.name ? { ...p, status: 'Bỏ qua' } : p));
                                }}>Bỏ qua</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {vocab.phonetics}
                            <span className="mx-1"> ({vocab.type ?? ''})</span>
                          </p>
                          <p className="text-base mt-1">
                            {vocab.meaning}
                          </p>
                        </div>
                        {vocab.soundUrl && (
                          <PronunciationButton
                            word={vocab.name}
                            lang="en-GB"
                            label="UK"
                            url={vocab.soundUrl}
                          />
                        )}
                      </div>
                    </Card>
                  )
                })
                }
              </div>

              {/* Desktop view: table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">STT</TableHead>
                      <TableHead className="font-bold">Word</TableHead>
                      <TableHead className="font-bold">Phonetics</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Sound</TableHead>
                      <TableHead className="font-bold">Meaning</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vocabList.map((vocab, idx) => {
                      const showStt = idx === 0 || vocab.stt !== vocabList[idx - 1]?.stt;
                      return (
                        <TableRow key={vocab.name}>
                          <TableCell className="align-middle text-sm sm:text-base">
                            {showStt ? vocab.stt : ''}
                          </TableCell>
                          <TableCell className="align-middle">
                            <div className="flex flex-col">
                              <span className="font-semibold text-base">{vocab.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="align-middle font-code text-sm sm:text-base">
                            {vocab.phonetics}
                          </TableCell>
                          <TableCell className="align-middle text-sm sm:text-base">
                            {vocab.type ?? ''}
                          </TableCell>
                          <TableCell className="align-middle text-center">
                            {vocab.soundUrl && (
                              <PronunciationButton
                                word={vocab.name}
                                lang="en-GB"
                                label="US"
                                url={vocab.soundUrl}
                              />
                            )}
                          </TableCell>
                          <TableCell className="align-middle text-sm sm:text-base">
                            {vocab.meaning}
                          </TableCell>
                          <TableCell className="align-middle text-sm sm:text-base">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <span>
                                  <Badge variant={
                                    vocab.status === 'Đã thuộc'
                                      ? 'default'
                                      : vocab.status === 'Đang học'
                                        ? 'secondary'
                                        : vocab.status === 'Bỏ qua'
                                          ? 'destructive'
                                          : 'outline'
                                  } className="cursor-pointer">
                                    {vocab.status}
                                  </Badge>
                                </span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => {
                                  setStatusFor(topic.slug, vocab.name, 'Chưa học');
                                  setVocabList(prev => prev.map(p => p.name === vocab.name ? { ...p, status: 'Chưa học' } : p));
                                }}>Chưa học</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => {
                                  setStatusFor(topic.slug, vocab.name, 'Đang học');
                                  setVocabList(prev => prev.map(p => p.name === vocab.name ? { ...p, status: 'Đang học' } : p));
                                }}>Đang học</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => {
                                  setStatusFor(topic.slug, vocab.name, 'Đã thuộc');
                                  setVocabList(prev => prev.map(p => p.name === vocab.name ? { ...p, status: 'Đã thuộc' } : p));
                                }}>Đã thuộc</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => {
                                  setStatusFor(topic.slug, vocab.name, 'Bỏ qua');
                                  setVocabList(prev => prev.map(p => p.name === vocab.name ? { ...p, status: 'Bỏ qua' } : p));
                                }}>Bỏ qua</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

