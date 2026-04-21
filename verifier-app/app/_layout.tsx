import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../lib/auth';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === 'login';

        if (!user && !inAuthGroup) {
            // Redirect to the login page if not authenticated
            router.replace('/login');
        } else if (user && inAuthGroup) {
            // Redirect to the main app if authenticated
            router.replace('/(tabs)');
        }
    }, [user, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    return <>{children}</>;
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <AuthWrapper>
                <Stack
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#1a1a1a',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }}
                >
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="login"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="verification/[id]"
                        options={{
                            title: 'Verification Result',
                            presentation: 'card'
                        }}
                    />
                </Stack>
                <StatusBar style="light" />
            </AuthWrapper>
        </AuthProvider>
    );
}
