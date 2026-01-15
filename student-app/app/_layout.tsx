import { Stack } from 'expo-router';
import { AuthProvider } from '../lib/auth';
import { ThemeProvider } from '../lib/theme-context';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="login" />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </AuthProvider>
        </ThemeProvider>
    );
}
