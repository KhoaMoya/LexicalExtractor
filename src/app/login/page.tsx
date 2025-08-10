
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, signInWithEmail, createUserWithEmail } from '@/domain/auth-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [emailLogin, setEmailLogin] = useState('');
    const [passwordLogin, setPasswordLogin] = useState('');
    const [emailRegister, setEmailRegister] = useState('');
    const [passwordRegister, setPasswordRegister] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const user = await signInWithGoogle();
            if (user) {
                router.push('/');
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await signInWithEmail(emailLogin, passwordLogin);
            if (user) {
                router.push('/');
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await createUserWithEmail(emailRegister, passwordRegister);
            if (user) {
                router.push('/');
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-4">
                <div className="flex justify-center mb-6">
                    <Icons.logo className="h-10 w-10 text-primary-foreground bg-primary rounded-lg p-1" />
                </div>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <Card>
                            <CardHeader>
                                <CardTitle>Login</CardTitle>
                                <CardDescription>Sign in to your account to access your history.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleEmailLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email-login">Email</Label>
                                        <Input id="email-login" type="email" placeholder="m@example.com" required value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password-login">Password</Label>
                                        <Input id="password-login" type="password" required value={passwordLogin} onChange={(e) => setPasswordLogin(e.target.value)} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Signing In...' : 'Sign In with Email'}
                                    </Button>
                                </form>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                                    Sign In with Google
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="register">
                        <Card>
                            <CardHeader>
                                <CardTitle>Register</CardTitle>
                                <CardDescription>Create a new account to save your progress.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleEmailRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email-register">Email</Label>
                                        <Input id="email-register" type="email" placeholder="m@example.com" required value={emailRegister} onChange={(e) => setEmailRegister(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password-register">Password</Label>
                                        <Input id="password-register" type="password" required value={passwordRegister} onChange={(e) => setPasswordRegister(e.target.value)} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
