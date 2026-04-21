import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@app_theme';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

interface ThemeColors {
    background: string;
    cardBackground: string;
    primary: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    border: string;
    cardShadow: string;
}

const lightColors: ThemeColors = {
    background: '#f8fafc',
    cardBackground: '#ffffff',
    primary: '#2563eb',
    text: '#0f172a',
    textSecondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#e2e8f0',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
};

const darkColors: ThemeColors = {
    background: '#020617',
    cardBackground: '#0f172a',
    primary: '#3b82f6',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#1e293b',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
};

interface ThemeContextType {
    theme: Theme;
    colorScheme: ColorScheme;
    colors: ThemeColors;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<Theme>('system');
    const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme || 'light');

    useEffect(() => {
        loadTheme();
    }, []);

    useEffect(() => {
        if (theme === 'system') {
            setColorScheme(systemColorScheme || 'light');
        } else {
            setColorScheme(theme as ColorScheme);
        }
    }, [theme, systemColorScheme]);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_KEY);
            if (savedTheme) {
                setThemeState(savedTheme as Theme);
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        }
    };

    const setTheme = async (newTheme: Theme) => {
        try {
            await AsyncStorage.setItem(THEME_KEY, newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const colors = colorScheme === 'dark' ? darkColors : lightColors;
    const isDark = colorScheme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, colorScheme, colors, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
