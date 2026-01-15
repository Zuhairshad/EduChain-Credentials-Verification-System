'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { WalletConnect } from '@/components/wallet-connect';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/mode-toggle';

export function AppHeader() {
    return (
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
                <SidebarTrigger />

                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students, credentials..."
                            className="pl-10 h-9"
                        />
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <ModeToggle />
                    <WalletConnect />
                </div>
            </div>
        </header>
    );
}
