import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    Linking,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { getStudentCredentials, type Student } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../lib/theme-context';

const WELCOME_SHOWN_KEY = '@welcome_shown';

export default function HomeScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [credentials, setCredentials] = useState<Student[]>([]);
    const [credential, setCredential] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        loadCredential();
        checkWelcome();
    }, [user]);

    const checkWelcome = async () => {
        try {
            const hasSeenWelcome = await AsyncStorage.getItem(WELCOME_SHOWN_KEY);
            if (!hasSeenWelcome) {
                setShowWelcome(true);
            }
        } catch (error) {
            console.log('Error checking welcome:', error);
        }
    };

    const dismissWelcome = async () => {
        try {
            await AsyncStorage.setItem(WELCOME_SHOWN_KEY, 'true');
            setShowWelcome(false);
        } catch (error) {
            console.log('Error saving welcome:', error);
        }
    };

    const loadCredential = async () => {
        if (!user?.email) return;

        try {
            const data = await getStudentCredentials(user.email);
            setCredentials(data);
            // Set the most recent credential as the primary one
            if (data.length > 0) {
                setCredential(data[0]);
            }
        } catch (error: any) {
            console.log('Failed to load credentials');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (credentials.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No credentials found</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Welcome Header */}
                <View style={styles.header}>
                    <Text style={[styles.greeting, { color: colors.text }]}>Hi, {credential?.student_name?.split(' ')[0]}! 👋</Text>
                    <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
                        {credentials.length} credential{credentials.length !== 1 ? 's' : ''} blockchain verified
                    </Text>
                </View>

                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: colors.cardBackground, shadowColor: colors.cardShadow }]}>
                    <View style={styles.statusHeader}>
                        <Ionicons name="shield-checkmark" size={40} color={colors.success} />
                        <View style={styles.statusInfo}>
                            <Text style={[styles.statusTitle, { color: colors.text }]}>Blockchain Verified</Text>
                            <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                                Issued {new Date(credential.issued_at).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.degreeBadge, { backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0' }]}>
                        <Text style={[styles.degreeText, { color: colors.text }]}>{credential.degree_level}</Text>
                        <Text style={[styles.deptText, { color: colors.textSecondary }]}>{credential.department}</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actions}>
                    <Text style={[styles.actionsTitle, { color: colors.text }]}>Quick Actions</Text>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.cardBackground, shadowColor: colors.cardShadow }]}
                        onPress={() => router.push('/(tabs)/credential')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0' }]}>
                            <Ionicons name="document-text" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, { color: colors.text }]}>View Credential</Text>
                            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>See complete details</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.cardBackground, shadowColor: colors.cardShadow }]}
                        onPress={() => router.push('/(tabs)/qr')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0' }]}>
                            <Ionicons name="qr-code" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, { color: colors.text }]}>Generate QR Code</Text>
                            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>Share for verification</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.cardBackground, shadowColor: colors.cardShadow }]}
                        onPress={() => {
                            if (credential?.transaction_hash) {
                                const txUrl = `https://amoy.polygonscan.com/tx/${credential.transaction_hash}`;
                                Linking.openURL(txUrl);
                            }
                        }}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0' }]}>
                            <Ionicons name="cube" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, { color: colors.text }]}>View on Blockchain</Text>
                            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>PolygonScan verification</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Pride Message */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        🎓 Your achievement is permanently recorded on the blockchain
                    </Text>
                </View>
            </ScrollView>

            {/* Welcome Modal */}
            <Modal
                visible={showWelcome}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                        <View style={styles.modalIcon}>
                            <Ionicons name="trophy" size={60} color="#FFD700" />
                        </View>

                        <Text style={[styles.modalTitle, { color: colors.text }]}>Welcome to Your Digital Vault!</Text>

                        <Text style={[styles.modalText, { color: colors.textSecondary }]}>
                            Your degree is now secured on the blockchain - immutable, verifiable, and yours forever.
                        </Text>

                        <View style={styles.featureList}>
                            <View style={styles.feature}>
                                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                                <Text style={[styles.featureText, { color: colors.text }]}>Blockchain verified credentials</Text>
                            </View>
                            <View style={styles.feature}>
                                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                                <Text style={[styles.featureText, { color: colors.text }]}>Generate QR codes for sharing</Text>
                            </View>
                            <View style={styles.feature}>
                                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                                <Text style={[styles.featureText, { color: colors.text }]}>Permanent blockchain proof</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.primary }]}
                            onPress={dismissWelcome}
                        >
                            <Text style={styles.modalButtonText}>Get Started 🚀</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    subGreeting: {
        fontSize: 16,
        color: '#666',
    },
    statusCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 24,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusInfo: {
        marginLeft: 16,
        flex: 1,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    statusSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    degreeBadge: {
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 12,
    },
    degreeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    deptText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    actions: {
        paddingHorizontal: 16,
    },
    actionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    actionCard: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContent: {
        flex: 1,
        marginLeft: 16,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    actionDesc: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    footer: {
        padding: 24,
        paddingTop: 16,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Welcome Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalIcon: {
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    featureList: {
        width: '100%',
        marginBottom: 32,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureText: {
        fontSize: 16,
        color: '#1a1a1a',
        marginLeft: 12,
    },
    modalButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});
