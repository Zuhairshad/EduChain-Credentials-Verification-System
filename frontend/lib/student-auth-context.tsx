'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface StudentAuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check active session
        if (supabase) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user ?? null);
                setLoading(false);
            });

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

            return () => subscription.unsubscribe();
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Redirect to login if not authenticated (except on login and verify pages)
        if (!loading && !user && pathname?.startsWith('/student') && pathname !== '/student/login') {
            router.push('/student/login');
        }
    }, [user, loading, pathname, router]);

    const signIn = async (email: string, password: string) => {
        if (!supabase) throw new Error('Supabase not configured');

        // Validate LGU email
        if (!email.endsWith('@cs.lgu.edu.pk')) {
            throw new Error('Only LGU student emails (@cs.lgu.edu.pk) are allowed');
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        router.push('/student/dashboard');
    };

    const signOut = async () => {
        if (!supabase) return;

        await supabase.auth.signOut();
        router.push('/student/login');
    };

    return (
        <StudentAuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </StudentAuthContext.Provider>
    );
}

export function useStudentAuth() {
    const context = useContext(StudentAuthContext);
    if (context === undefined) {
        throw new Error('useStudentAuth must be used within a StudentAuthProvider');
    }
    return context;
}
