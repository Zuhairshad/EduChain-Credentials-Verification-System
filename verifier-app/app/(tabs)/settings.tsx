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

export default function SettingsScreen() {
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

    const handleOpenPolygonScan = () => {
        Linking.openURL('https://amoy.polygonscan.com/');
    };

    const handleOpenSupport = () => {
        // You can customize this email
        Linking.openURL('mailto:support@lgu.edu.pk?subject=Verifier App Support');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.card}>
                    <SettingItem
                        icon="information-circle-outline"
                        label="Version"
                        value={Constants.expoConfig?.version || '1.0.0'}
                    />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        label="Blockchain"
                        value="Polygon Amoy"
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.settingButton}
                        onPress={handleClearHistory}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                            <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>
                                Clear History
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
                            <Ionicons name="link-outline" size={24} color="#007AFF" />
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
                            <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
                            <Text style={styles.settingLabel}>Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    🔐 All verifications are secured by blockchain technology
                </Text>
                <Text style={styles.footerSubtext}>
                    Powered by Polygon Amoy Network
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
                <Ionicons name={icon as any} size={24} color="#007AFF" />
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <Text style={styles.settingValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    section: {
        marginTop: 24,
        marginHorizontal: 16,
    },
    sectionTitle: {
        color: '#8E8E93',
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#2c2c2e',
        borderRadius: 12,
        overflow: 'hidden',
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
        backgroundColor: '#3a3a3c',
        marginLeft: 52,
    },
    footer: {
        alignItems: 'center',
        padding: 24,
        marginTop: 32,
    },
    footerText: {
        color: '#8E8E93',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    footerSubtext: {
        color: '#5e5e60',
        fontSize: 12,
        textAlign: 'center',
    },
});
