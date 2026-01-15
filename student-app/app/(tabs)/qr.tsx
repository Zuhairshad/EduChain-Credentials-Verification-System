import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { getStudentCredential, type Student } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../lib/theme-context';

export default function QRScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const [credential, setCredential] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCredential();
    }, [user]);

    const loadCredential = async () => {
        if (!user?.email) return;

        try {
            const data = await getStudentCredential(user.email);
            setCredential(data);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load credential');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (!credential) return;
        const verificationUrl = `${process.env.EXPO_PUBLIC_VERIFIER_URL}/verify/${credential.id}`;
        await Clipboard.setStringAsync(verificationUrl);
        Alert.alert('Copied!', 'Verification link copied to clipboard');
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!credential) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="qr-code-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No credential found</Text>
            </View>
        );
    }

    const verificationUrl = `${process.env.EXPO_PUBLIC_VERIFIER_URL}/verify/${credential.id}`;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>Verification QR Code</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Scan this code to verify your credential
                </Text>

                <View style={[styles.qrContainer, { backgroundColor: '#fff', shadowColor: colors.cardShadow }]}>
                    <QRCode
                        value={verificationUrl}
                        size={280}
                        backgroundColor="white"
                        color="black"
                    />
                </View>

                <View style={styles.info}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{credential.student_name}</Text>
                    <Text style={[styles.studentId, { color: colors.textSecondary }]}>{credential.student_id_number}</Text>
                </View>

                <TouchableOpacity style={[styles.button, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]} onPress={handleCopyLink}>
                    <Ionicons name="copy-outline" size={20} color={colors.primary} />
                    <Text style={[styles.buttonText, { color: colors.primary }]}>Copy Verification Link</Text>
                </TouchableOpacity>
            </View>
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
    },
    qrContainer: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 32,
    },
    info: {
        alignItems: 'center',
        marginBottom: 32,
    },
    studentName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    studentId: {
        fontSize: 14,
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    buttonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
});
