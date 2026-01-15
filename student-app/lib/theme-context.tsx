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
    background: '#f8f9fa',
    cardBackground: '#ffffff',
    primary: '#007AFF',
    text: '#1a1a1a',
    textSecondary: '#666666',
    success: '#34C759',
    warning: '#FFD700',
    error: '#FF3B30',
    border: '#e0e0e0',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
};

const darkColors: ThemeColors = {
    background: '#000000',
    cardBackground: '#1c1c1e',
    primary: '#0a84ff',
    text: '#ffffff',
    textSecondary: '#8e8e93',
    success: '#30d158',
    warning: '#ffd60a',
    error: '#ff453a',
    border: '#38383a',
    cardShadow: 'rgba(0, 0, 0, 0.5)',
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
