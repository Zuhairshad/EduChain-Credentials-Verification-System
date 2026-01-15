import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Switch,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme-context';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { theme, setTheme, colors, isDark } = useTheme();

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    const getThemeLabel = () => {
        if (theme === 'system') return 'System';
        return theme === 'dark' ? 'Dark' : 'Light';
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={48} color={colors.primary} />
                </View>
                <Text style={[styles.email, { color: colors.text }]}>{user?.email}</Text>
            </View>

            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>

                <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                        Alert.alert(
                            'Theme',
                            'Choose your preferred theme',
                            [
                                {
                                    text: 'Light',
                                    onPress: () => setTheme('light'),
                                },
                                {
                                    text: 'Dark',
                                    onPress: () => setTheme('dark'),
                                },
                                {
                                    text: 'System',
                                    onPress: () => setTheme('system'),
                                },
                                {
                                    text: 'Cancel',
                                    style: 'cancel',
                                },
                            ]
                        );
                    }}
                >
                    <Ionicons name="color-palette-outline" size={24} color={colors.textSecondary} />
                    <Text style={[styles.optionText, { color: colors.text }]}>Theme</Text>
                    <Text style={[styles.optionValue, { color: colors.textSecondary }]}>{getThemeLabel()}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.border} />
                </TouchableOpacity>

                <View style={[styles.option, styles.switchRow]}>
                    <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={colors.textSecondary} />
                    <Text style={[styles.optionText, { color: colors.text }]}>Dark Mode</Text>
                    <Switch
                        value={isDark}
                        onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SETTINGS</Text>

                <TouchableOpacity style={styles.option}>
                    <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
                    <Text style={[styles.optionText, { color: colors.text }]}>Notifications</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.border} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <Ionicons name="shield-checkmark-outline" size={24} color={colors.textSecondary} />
                    <Text style={[styles.optionText, { color: colors.text }]}>Privacy</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.border} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.option}>
                    <Ionicons name="help-circle-outline" size={24} color={colors.textSecondary} />
                    <Text style={[styles.optionText, { color: colors.text }]}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.border} />
                </TouchableOpacity>
            </View>

            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>

                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Version</Text>
                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>1.0.0</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Blockchain</Text>
                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>Polygon Amoy</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.signOutButton, { backgroundColor: colors.cardBackground, borderColor: colors.error }]}
                onPress={handleSignOut}
            >
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
                <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={[styles.footer, { color: colors.textSecondary }]}>
                Powered by blockchain technology
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        padding: 24,
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    email: {
        fontSize: 16,
    },
    section: {
        marginBottom: 16,
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 16,
        paddingVertical: 8,
        textTransform: 'uppercase',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    switchRow: {
        justifyContent: 'space-between',
    },
    optionText: {
        flex: 1,
        fontSize: 16,
    },
    optionValue: {
        fontSize: 16,
        marginRight: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 16,
    },
    infoValue: {
        fontSize: 16,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 24,
        marginBottom: 32,
    },
});
