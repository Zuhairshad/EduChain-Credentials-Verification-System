import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { clearHistory } from '../../lib/storage';
import { useAuth } from '../../lib/auth';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();

    const handleClearHistory = () => {
        Alert.alert(
            'Clear History',
            'Are you sure you want to clear all verification history?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await clearHistory();
                        Alert.alert('Success', 'History cleared successfully');
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out of the portal?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                    },
                },
            ]
        );
    };

    const handleOpenPolygonScan = () => {
        Linking.openURL('https://amoy.polygonscan.com/');
    };

    const handleOpenSupport = () => {
        Linking.openURL('mailto:support@lgu.edu.pk?subject=Verifier App Support');
    };

    const displayName = user?.email?.split('@')[0] || 'User';

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.userName}>{user?.email}</Text>
                <Text style={styles.userRole}>Authorized Verifier</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.settingButton}
                        onPress={handleLogout}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                            <Text style={[styles.settingLabel, { color: '#ff4444' }]}>
                                Sign Out
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>System</Text>
                <View style={styles.card}>
                    <SettingItem
                        icon="information-circle-outline"
                        label="Version"
                        value={Constants.expoConfig?.version || '1.0.0'}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        label="Network"
                        value="Polygon Amoy"
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data Management</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.settingButton}
                        onPress={handleClearHistory}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="trash-outline" size={24} color="#FFD700" />
                            <Text style={styles.settingLabel}>
                                Clear Local History
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resources</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.settingButton}
                        onPress={handleOpenPolygonScan}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="link-outline" size={24} color="#FFD700" />
                            <Text style={styles.settingLabel}>Open PolygonScan</Text>
                        </View>
                        <Ionicons name="open-outline" size={20} color="#8E8E93" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.settingButton}
                        onPress={handleOpenSupport}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="help-circle-outline" size={24} color="#FFD700" />
                            <Text style={styles.settingLabel}>Technical Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    🔐 Blockchain-Secured Verifier Portal
                </Text>
                <Text style={styles.footerSubtext}>
                    Lahore Garrison University
                </Text>
            </View>
        </ScrollView>
    );
}

function SettingItem({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <Ionicons name={icon as any} size={24} color="#FFD700" />
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <Text style={styles.settingValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,215,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
        marginBottom: 16,
    },
    avatarLetter: {
        color: '#FFD700',
        fontSize: 32,
        fontWeight: 'bold',
    },
    userName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userRole: {
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 4,
    },
    section: {
        marginTop: 24,
        marginHorizontal: 16,
    },
    sectionTitle: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingLabel: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 12,
    },
    settingValue: {
        color: '#8E8E93',
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginLeft: 52,
    },
    footer: {
        alignItems: 'center',
        padding: 32,
        marginTop: 32,
    },
    footerText: {
        color: '#8E8E93',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 4,
    },
    footerSubtext: {
        color: '#555',
        fontSize: 12,
        textAlign: 'center',
    },
});
