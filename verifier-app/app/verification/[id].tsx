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
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { verifyCredential, VerificationResult } from '../../lib/verification';
import { saveToHistory } from '../../lib/storage';

const { width } = Dimensions.get('window');

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
        if (!result) return { icon: 'help-circle', color: '#8E8E93', bg: '#2c2c2e', text: 'Unknown' };

        switch (result.status) {
            case 'verified':
                return { icon: 'checkmark-circle', color: '#fff', bg: '#000', text: 'VERIFIED' };
            case 'revoked':
                return { icon: 'close-circle', color: '#fff', bg: '#333', text: 'REVOKED' };
            case 'invalid':
                return { icon: 'alert-circle', color: '#fff', bg: '#333', text: 'INVALID' };
            case 'error':
                return { icon: 'warning', color: '#fff', bg: '#555', text: 'ERROR' };
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
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Verifying on Blockchain...</Text>
                <Text style={styles.loadingSubtext}>Establishing cryptographic proof</Text>
            </View>
        );
    }

    if (!result) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
                <Text style={styles.errorText}>Failed to retrieve credential</Text>
                <TouchableOpacity style={styles.retryButton} onPress={performVerification}>
                    <Text style={styles.retryButtonText}>Retry Verification</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusInfo = getStatusInfo();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Status Hero Card */}
            <View style={[styles.statusHero, { backgroundColor: statusInfo.bg }]}>
                <View style={styles.statusIconContainer}>
                    <Ionicons name={statusInfo.icon as any} size={80} color={statusInfo.color} />
                </View>
                <Text style={[styles.statusTitle, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                <Text style={styles.statusSubtitle}>
                    {result.status === 'verified' && "Authentic Academic Credential"}
                    {result.status === 'revoked' && "Credential Invalidated by Issue"}
                    {result.status === 'invalid' && "Cryptographic Proof Mismatch"}
                    {result.status === 'error' && "System Configuration Error"}
                </Text>
            </View>

            {/* Verification Checklist */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="shield-checkmark" size={20} color="#fff" />
                    <Text style={styles.sectionTitle}>Verification Checks</Text>
                </View>
                <View style={styles.checksGrid}>
                    <CheckCard label="Data Fetch" passed={result.checks.dataFetched} />
                    <CheckCard label="Merkle Proof" passed={result.checks.merkleProofValid} />
                    <CheckCard label="Blockchain" passed={result.checks.blockchainAnchored} />
                    <CheckCard label="Status" passed={result.checks.notRevoked} />
                </View>
            </View>

            {/* Student Details Card */}
            {result.credential && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person" size={20} color="#fff" />
                        <Text style={styles.sectionTitle}>Student Details</Text>
                    </View>
                    <View style={styles.detailsCard}>
                        <DetailRow label="Full Name" value={result.credential.student_name} />
                        <DetailRow label="Student ID" value={result.credential.student_id_number} />
                        <DetailRow label="Email" value={result.credential.student_email} />
                        <DetailRow label="Program" value={result.credential.degree_level} />
                        <DetailRow label="Department" value={result.credential.department} />
                        <View style={styles.divider} />
                        <DetailRow 
                            label="Final Result" 
                            value={`${result.credential.cgpa} OGPA (${result.credential.internal_grade})`} 
                            highlight 
                        />
                    </View>
                </View>
            )}

            {/* Blockchain Evidence */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="link" size={20} color="#fff" />
                    <Text style={styles.sectionTitle}>Blockchain Evidence</Text>
                </View>
                <View style={styles.evidenceCard}>
                    <EvidenceRow 
                        label="Merkle Root" 
                        value={result.credential?.merkle_root || 'N/A'} 
                    />
                    <EvidenceRow 
                        label="Anchor Point" 
                        value={result.blockchainInfo?.timestamp ? new Date(result.blockchainInfo.timestamp * 1000).toLocaleString() : 'N/A'} 
                    />
                    <TouchableOpacity style={styles.txButton} onPress={handleViewTransaction}>
                        <Text style={styles.txButtonText}>View PolygonScan Transaction</Text>
                        <Ionicons name="open-outline" size={16} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Footer Action */}
            <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/(tabs)')}>
                <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function CheckCard({ label, passed }: { label: string; passed: boolean }) {
    return (
        <View style={[styles.checkCard, !passed && styles.checkCardFailed]}>
            <Ionicons 
                name={passed ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color={passed ? "#fff" : "#ff4444"} 
            />
            <Text style={styles.checkCardLabel}>{label}</Text>
        </View>
    );
}

function DetailRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>{value}</Text>
        </View>
    );
}

function EvidenceRow({ label, value }: { label: string, value: string }) {
    return (
        <View style={styles.evidenceRow}>
            <Text style={styles.evidenceLabel}>{label}</Text>
            <Text numberOfLines={1} ellipsizeMode="middle" style={styles.evidenceValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: '#FFD700',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    loadingSubtext: {
        color: '#8E8E93',
        marginTop: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 40,
    },
    errorText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#FFD700',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginTop: 30,
    },
    retryButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    statusHero: {
        padding: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    statusIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    statusTitle: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 2,
    },
    statusSubtitle: {
        color: '#fff',
        fontSize: 14,
        marginTop: 8,
        opacity: 0.8,
    },
    section: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    checksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    checkCard: {
        width: (width - 60) / 2,
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    checkCardFailed: {
        borderColor: '#ff4444',
    },
    checkCardLabel: {
        color: '#fff',
        fontSize: 12,
        marginTop: 8,
        fontWeight: '600',
    },
    detailsCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    detailLabel: {
        color: '#8E8E93',
        fontSize: 14,
    },
    detailValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    detailValueHighlight: {
        color: '#fff',
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 12,
    },
    evidenceCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    evidenceRow: {
        marginBottom: 16,
    },
    evidenceLabel: {
        color: '#8E8E93',
        fontSize: 12,
        marginBottom: 4,
    },
    evidenceValue: {
        color: '#fff',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    txButton: {
        backgroundColor: '#fff',
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
    txButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    doneButton: {
        margin: 24,
        marginTop: 40,
        height: 60,
        borderRadius: 16,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
