'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    LayoutDashboard,
    GraduationCap,
    Shield,
    LogOut,
    ChevronLeft,
    Menu,
    X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vault', label: 'My Credentials', icon: GraduationCap },
];

export function StudentSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const initials = user?.email
        ? user.email.split('@')[0].split('-').map(p => p[0]?.toUpperCase()).join('').slice(0, 2)
        : '??';

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden bg-sidebar text-sidebar-foreground p-2 rounded-lg shadow-lg"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-all duration-300',
                    collapsed ? 'w-[68px]' : 'w-[260px]',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
            >
                {/* Header / Branding */}
                <div className={cn(
                    'flex items-center gap-3 px-4 pt-6 pb-4',
                    collapsed && 'justify-center px-2'
                )}>
                    <div className="bg-sidebar-primary p-2 rounded-lg flex-shrink-0">
                        <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <h1 className="font-bold text-base leading-tight truncate">LGU Digital Vault</h1>
                            <p className="text-xs text-sidebar-foreground/60 truncate">Student Portal</p>
                        </div>
                    )}

                    {/* Mobile close */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="ml-auto md:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <Separator className="bg-sidebar-border mx-3 w-auto" />

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                                <div
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                                        collapsed && 'justify-center px-2'
                                    )}
                                >
                                    <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-sidebar-primary')} />
                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse toggle (desktop only) */}
                <div className="hidden md:flex px-3 pb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsed(!collapsed)}
                        className={cn(
                            'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full',
                            collapsed && 'px-2'
                        )}
                    >
                        <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
                        {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
                    </Button>
                </div>

                <Separator className="bg-sidebar-border mx-3 w-auto" />

                {/* User section */}
                <div className={cn('p-4', collapsed && 'px-2')}>
                    <div className={cn(
                        'flex items-center gap-3',
                        collapsed && 'justify-center'
                    )}>
                        <div className="bg-sidebar-primary/20 text-sidebar-primary h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {initials}
                        </div>
                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{user?.email?.split('@')[0]}</p>
                                <p className="text-xs text-sidebar-foreground/50 truncate">Student</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className={cn(
                                'flex-1 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                                collapsed && 'px-2'
                            )}
                        >
                            <LogOut className="h-4 w-4" />
                            {!collapsed && <span className="ml-2">Sign Out</span>}
                        </Button>
                        {!collapsed && (
                            <div className="flex items-center justify-center border-l border-sidebar-border pl-2">
                                <ThemeToggle />
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
