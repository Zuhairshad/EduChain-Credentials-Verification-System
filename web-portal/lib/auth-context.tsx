'use client';

import { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: { email: string } | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ email: string } | null>(null);
    const router = useRouter();

    const login = async (email: string, password: string) => {
        if (!supabase) throw new Error('Supabase not configured');

        // Validate LGU email
        if (!email.endsWith('@cs.lgu.edu.pk')) {
            throw new Error('Only LGU student emails are allowed');
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        setUser({ email });
        router.push('/vault');
    };

    const logout = () => {
        if (supabase) {
            supabase.auth.signOut();
        }
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
