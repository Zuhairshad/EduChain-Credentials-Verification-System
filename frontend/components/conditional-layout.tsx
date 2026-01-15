'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    // Login page - no sidebar/header
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Protected pages - with sidebar/header
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 flex flex-col w-full">
                <AppHeader />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}
