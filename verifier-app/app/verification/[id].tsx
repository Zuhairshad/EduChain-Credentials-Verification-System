import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Linking,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { verifyCredential, VerificationResult } from '../../lib/verification';
import { saveToHistory } from '../../lib/storage';

export default function VerificationScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<VerificationResult | null>(null);

    useEffect(() => {
        performVerification();
    }, [id]);

    const performVerification = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const verificationResult = await verifyCredential(id);
            setResult(verificationResult);

            // Save to history
            await saveToHistory(id, verificationResult);
        } catch (error) {
            console.error('Verification error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = () => {
        if (!result) return { icon: 'help-circle', color: '#8E8E93', text: 'Unknown' };

        switch (result.status) {
            case 'verified':
                return { icon: 'checkmark-circle', color: '#34C759', text: 'VERIFIED' };
            case 'revoked':
                return { icon: 'close-circle', color: '#FF9500', text: 'REVOKED' };
            case 'invalid':
                return { icon: 'alert-circle', color: '#FF3B30', text: 'INVALID' };
            case 'error':
                return { icon: 'warning', color: '#FF3B30', text: 'ERROR' };
        }
    };

    const handleViewTransaction = () => {
        if (result?.credential?.transaction_hash) {
            const url = `https://amoy.polygonscan.com/tx/${result.credential.transaction_hash}`;
            Linking.openURL(url);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Verifying credential...</Text>
                <Text style={styles.loadingSubtext}>
                    This may take a few seconds
                </Text>
            </View>
        );
    }

    if (!result) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
                <Text style={styles.errorText}>Failed to verify credential</Text>
            </View>
        );
    }

    const statusInfo = getStatusInfo();

    return (
        <ScrollView style={styles.container}>
            {/* Status Card */}
            <View style={[styles.statusCard, { backgroundColor: statusInfo.color }]}>
                <Ionicons name={statusInfo.icon as any} size={80} color="#fff" />
                <Text style={styles.statusText}>{statusInfo.text}</Text>
                {result.status === 'verified' && (
                    <Text style={styles.statusSubtext}>
                        This credential is authentic and blockchain-verified
                    </Text>
                )}
                {result.status === 'revoked' && (
                    <Text style={styles.statusSubtext}>
                        This credential has been revoked by the institution
                    </Text>
                )}
                {result.status === 'invalid' && (
                    <Text style={styles.statusSubtext}>
                        This credential could not be verified
                    </Text>
                )}
            </View>

            {/* Verification Checks */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Verification Checks</Text>
                <View style={styles.checksContainer}>
                    <CheckItem
                        label="Data Fetched"
                        passed={result.checks.dataFetched}
                    />
                    <CheckItem
                        label="Merkle Proof Valid"
                        passed={result.checks.merkleProofValid}
                    />
                    <CheckItem
                        label="Blockchain Anchored"
                        passed={result.checks.blockchainAnchored}
                    />
                    <CheckItem
                        label="Not Revoked"
                        passed={result.checks.notRevoked}
                    />
                </View>
            </View>

            {/* Student Information */}
            {result.credential && (
                <>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Student Information</Text>
                        <View style={styles.card}>
                            <InfoRow label="Name" value={result.credential.student_name} />
                            <InfoRow label="Student ID" value={result.credential.student_id_number} mono />
                            <InfoRow label="Email" value={result.credential.student_email} />
                            <InfoRow label="CNIC" value={result.credential.cnic} mono />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Academic Information</Text>
                        <View style={styles.card}>
                            <InfoRow label="Degree" value={result.credential.degree_level} />
                            <InfoRow label="Department" value={result.credential.department} />
                            <InfoRow
                                label="CGPA"
                                value={`${result.credential.cgpa} (${result.credential.internal_grade})`}
                            />
                            <InfoRow
                                label="Graduation"
                                value={new Date(result.credential.graduation_end_date).toLocaleDateString()}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Blockchain Proof</Text>
                        <View style={styles.card}>
                            <InfoRow
                                label="Merkle Root"
                                value={result.credential.merkle_root.slice(0, 16) + '...'}
                                mono
                            />
                            {result.blockchainInfo?.institutionName && (
                                <InfoRow
                                    label="Institution"
                                    value={result.blockchainInfo.institutionName}
                                />
                            )}
                            {result.blockchainInfo?.timestamp && (
                                <InfoRow
                                    label="Anchored"
                                    value={new Date(result.blockchainInfo.timestamp * 1000).toLocaleString()}
                                />
                            )}
                            <TouchableOpacity
                                onPress={handleViewTransaction}
                                style={styles.linkRow}
                            >
                                <Text style={styles.label}>Transaction:</Text>
                                <View style={styles.link}>
                                    <Text style={styles.linkText}>
                                        {result.credential.transaction_hash?.slice(0, 12)}...
                                    </Text>
                                    <Ionicons name="open-outline" size={16} color="#007AFF" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}

            {/* Error Message */}
            {result.error && (
                <View style={styles.section}>
                    <View style={[styles.card, styles.errorCard]}>
                        <Text style={styles.errorCardText}>{result.error}</Text>
                    </View>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Scan Another</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

function CheckItem({ label, passed }: { label: string; passed: boolean }) {
    return (
        <View style={styles.checkItem}>
            <Ionicons
                name={passed ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={passed ? '#34C759' : '#FF3B30'}
            />
            <Text style={styles.checkLabel}>{label}</Text>
        </View>
    );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={[styles.value, mono && styles.mono]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 24,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    loadingSubtext: {
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 24,
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 16,
        textAlign: 'center',
    },
    statusCard: {
        margin: 16,
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
    },
    statusText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
    },
    statusSubtext: {
        color: '#fff',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        opacity: 0.9,
    },
    section: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#2c2c2e',
        padding: 16,
        borderRadius: 12,
    },
    checksContainer: {
        backgroundColor: '#2c2c2e',
        padding: 16,
        borderRadius: 12,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkLabel: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 12,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    label: {
        color: '#8E8E93',
        fontSize: 14,
        width: 120,
    },
    value: {
        color: '#fff',
        fontSize: 14,
        flex: 1,
    },
    mono: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
    },
    linkRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    linkText: {
        color: '#007AFF',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    errorCard: {
        backgroundColor: '#3a2222',
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
    errorCardText: {
        color: '#FF6B6B',
        fontSize: 14,
    },
    actions: {
        padding: 16,
        paddingBottom: 32,
    },
    actionButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
