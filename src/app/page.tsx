
'use client';

import { LexicalExtractor } from '@/components/lexical-extractor';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';
import { signOutUser } from '@/domain/auth-manager';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
      <header className="py-6 px-2 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Icons.logo className="h-8 w-8 text-primary-foreground bg-primary rounded-lg p-1" />
            <h1 className="text-3xl font-bold font-headline tracking-tight text-gray-800 dark:text-gray-100">
              Lexical Extractor
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/history">History</Link>
            </Button>
            <ThemeToggle />
            {user && (
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow pb-16 px-2 sm:px-6 lg:px-8">
        <LexicalExtractor />
      </main>
      <footer className="py-6 px-2 sm:px-6 lg:px-8 border-t">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>Built with Next.js and GenAI. A tool for language learners.</p>
        </div>
      </footer>
    </div>
  );
}
