'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth-context';

interface StudentHeaderProps {
    title: string;
    subtitle?: string;
}

export function StudentHeader({ title, subtitle }: StudentHeaderProps) {
    const { user } = useAuth();

    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    })();

    return (
        <header className="flex items-center justify-between py-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                )}
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{greeting}</p>
                    <p className="text-xs text-muted-foreground">{user?.email?.split('@')[0]}</p>
                </div>
                <ThemeToggle />
            </div>
        </header>
    );
}
