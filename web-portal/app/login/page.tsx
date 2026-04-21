'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background transition-colors duration-300">
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-10 animate-slide-up">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">EDU Chain</h1>
                    <p className="text-muted-foreground text-sm mt-1">Student Portal</p>
                </div>

                <Card className="shadow-none border animate-slide-up-delay-1 rounded-sm">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <CardTitle className="text-lg font-medium">Sign In</CardTitle>
                        <CardDescription>
                            Use your LGU credentials
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <Alert variant="destructive" className="rounded-sm">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">LGU Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="sp-xxxx-bscs-xxx@cs.lgu.edu.pk"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="rounded-sm h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="CNIC"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="rounded-sm h-10"
                                />
                            </div>

                            <Button type="submit" className="w-full h-10 font-medium rounded-sm mt-4" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest mt-8 animate-slide-up-delay-2">
                    Secured by Polygon
                </p>
            </div>
        </div>
    );
}
