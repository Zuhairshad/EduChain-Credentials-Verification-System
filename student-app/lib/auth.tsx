import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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

    const signIn = async (email: string, password: string) => {
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
    };

    const signOut = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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
