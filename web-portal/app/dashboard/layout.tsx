'use client';

import { StudentSidebar } from '@/components/student-sidebar';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Listen for sidebar collapse by observing the sidebar width
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const sidebar = document.querySelector('aside');
            if (sidebar) {
                setSidebarCollapsed(sidebar.classList.contains('w-[68px]'));
            }
        });

        const sidebar = document.querySelector('aside');
        if (sidebar) {
            observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
        }

        return () => observer.disconnect();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <StudentSidebar />
            <main className="transition-all duration-300 md:ml-[260px] min-h-screen">
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
