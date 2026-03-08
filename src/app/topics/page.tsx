'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronLeft, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';
import { signOutUser } from '@/domain/auth-manager';
import { getTopics } from '@/domain/topics';

export default function TopicsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const topics = getTopics();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

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
              <Link href="/">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="hidden sm:inline-flex"
              asChild
            >
              <Link href="/">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">
              Topics
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
        <div className="max-w-4xl mx-auto pt-4 sm:pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Chọn một chủ đề để bắt đầu học từ vựng.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {topics.map((topic) => (
              <Link key={topic.slug} href={`/topics/${topic.slug}`} className="block">
                <Card className="h-full hover:bg-accent transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      {/* <BookOpen className="h-4 w-4 text-primary" /> */}
                      {topic.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {topic.vocabularies.length} từ vựng
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

