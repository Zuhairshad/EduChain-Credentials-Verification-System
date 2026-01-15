import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Linking,
    Platform,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { getStudentCredentials, type Student } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../lib/theme-context';

export default function CredentialScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const [credentials, setCredentials] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCredentials();
    }, [user]);

    const loadCredentials = async () => {
        if (!user?.email) return;

        try {
            const data = await getStudentCredentials(user.email);
            setCredentials(data);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async (credentialId: string) => {
        const verificationUrl = `${process.env.EXPO_PUBLIC_VERIFIER_URL}/verify/${credentialId}`;
        await Clipboard.setStringAsync(verificationUrl);
        Alert.alert('Copied!', 'Verification link copied to clipboard');
    };

    const handleViewTransaction = (txHash: string) => {
        const url = `https://amoy.polygonscan.com/tx/${txHash}`;
        Linking.openURL(url);
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (credentials.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No credentials found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Credentials</Text>
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{credentials.length}</Text>
                </View>
            </View>

            {credentials.map((credential, index) => (
                <CredentialCard
                    key={credential.id}
                    credential={credential}
                    index={index}
                    colors={colors}
                    isDark={isDark}
                    onCopyLink={handleCopyLink}
                    onViewTransaction={handleViewTransaction}
                />
            ))}
        </ScrollView>
    );
}

function CredentialCard({
    credential,
    index,
    colors,
    isDark,
    onCopyLink,
    onViewTransaction
}: {
    credential: Student;
    index: number;
    colors: any;
    isDark: boolean;
    onCopyLink: (id: string) => void;
    onViewTransaction: (txHash: string) => void;
}) {
    return (
        <View style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.cardShadow }]}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <Text style={[styles.degree, { color: colors.text }]}>{credential.degree_level}</Text>
                    <View style={[styles.statusBadge, credential.status === 'issued' ? styles.badgeActive : styles.badgeRevoked]}>
                        <Text style={styles.statusBadgeText}>
                            {credential.status === 'issued' ? '✓ Verified' : 'Revoked'}
                        </Text>
                    </View>
                </View>
                {index === 0 && (
                    <View style={[styles.latestBadge, { backgroundColor: colors.success }]}>
                        <Text style={styles.latestText}>Latest</Text>
                    </View>
                )}
            </View>

            <Text style={[styles.department, { color: colors.textSecondary }]}>{credential.department}</Text>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
                <InfoRow label="Name" value={credential.student_name} colors={colors} />
                <InfoRow label="Student ID" value={credential.student_id_number} mono colors={colors} />
                <InfoRow label="Email" value={credential.student_email} colors={colors} />
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Academic Details</Text>
                <InfoRow label="CGPA" value={`${credential.cgpa} (${credential.internal_grade})`} colors={colors} />
                <InfoRow
                    label="Graduation"
                    value={new Date(credential.graduation_end_date).toLocaleDateString()}
                    colors={colors}
                />
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Blockchain Proof</Text>
                <InfoRow label="Merkle Root" value={credential.merkle_root.slice(0, 16) + '...'} mono colors={colors} />
                <TouchableOpacity
                    onPress={() => onViewTransaction(credential.transaction_hash)}
                    style={styles.linkRow}
                >
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Transaction:</Text>
                    <View style={styles.link}>
                        <Text style={[styles.linkText, { color: colors.primary }]}>{credential.transaction_hash?.slice(0, 12)}...</Text>
                        <Ionicons name="open-outline" size={16} color={colors.primary} />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}
                    onPress={() => onCopyLink(credential.id)}
                >
                    <Ionicons name="link" size={20} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Copy Verification Link</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function InfoRow({ label, value, mono = false, colors }: { label: string; value: string; mono?: boolean, colors: any }) {
    return (
        <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}:</Text>
            <Text style={[styles.value, { color: colors.text }, mono && styles.mono]}>{value}</Text>
        </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    badge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 32,
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 8,
        marginBottom: 8,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        gap: 8,
    },
    degree: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeActive: {
        backgroundColor: '#34C759',
    },
    badgeRevoked: {
        backgroundColor: '#FF3B30',
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    latestBadge: {
        backgroundColor: '#34C759',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    latestText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    department: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 16,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        color: '#666',
        width: 100,
    },
    value: {
        fontSize: 13,
        color: '#1a1a1a',
        flex: 1,
    },
    mono: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 11,
    },
    linkRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    linkText: {
        fontSize: 11,
        color: '#007AFF',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    actions: {
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    actionText: {
        fontSize: 15,
        color: '#007AFF',
        fontWeight: '600',
    },
});
