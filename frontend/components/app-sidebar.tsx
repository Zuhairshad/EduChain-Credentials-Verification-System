'use client';

import {
    LayoutDashboard,
    FileEdit,
    Database,
    Settings,
    GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

const menuItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Issue Credential',
        url: '/issue',
        icon: FileEdit,
    },
    {
        title: 'Student Database',
        url: '/database',
        icon: Database,
    },
    {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm">LGU Admin</h2>
                        <p className="text-xs text-muted-foreground">Credential System</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
