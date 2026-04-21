import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ActivityIndicator,
    Linking,
    ScrollView,
    Dimensions,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { getHistory } from '../../lib/storage';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualUrl, setManualUrl] = useState('');
    const [stats, setStats] = useState({ total: 0, today: 0 });

    useEffect(() => {
        requestCameraPermission();
        loadStats();
    }, []);

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const loadStats = async () => {
        const history = await getHistory();
        const today = new Date().toDateString();
        const todayCount = history.filter(item => new Date(item.timestamp).toDateString() === today).length;
        setStats({
            total: history.length,
            today: todayCount
        });
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        processUrl(data);
    };

    const processUrl = (url: string) => {
        try {
            // Support both /verify/UUID and /verify?id=UUID formats
            const match = url.match(/\/verify(?:\/|\?id=)([a-f0-9-]{36})/i);
            if (match && match[1]) {
                const credentialId = match[1];
                setShowScanner(false);
                setScanned(false);
                router.push(`/verification/${credentialId}`);
            } else {
                Alert.alert(
                    'Invalid QR Code',
                    'This QR code does not contain a valid verification URL.',
                    [{ text: 'OK', onPress: () => setScanned(false) }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to process QR code.');
            setScanned(false);
        }
    };

    const username = user?.email?.split('@')[0] || 'User';
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);

    if (showScanner) {
        if (hasPermission === false) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="camera-off-outline" size={64} color="#FF3B30" />
                    <Text style={styles.permissionText}>Camera access denied</Text>
                    <TouchableOpacity style={styles.settingsButton} onPress={() => Linking.openSettings()}>
                        <Text style={styles.settingsButtonText}>Enable in Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanner(false)}>
                        <Text style={styles.closeButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.scannerContainer}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                >
                    <View style={styles.scannerOverlay}>
                        <View style={styles.scannerHeader}>
                            <TouchableOpacity onPress={() => setShowScanner(false)} style={styles.backButton}>
                                <Ionicons name="close-circle" size={40} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.scannerHeaderText}>Scan Credential</Text>
                        </View>
                        <View style={styles.viewfinderContainer}>
                            <View style={styles.viewfinder}>
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />
                            </View>
                        </View>
                        <Text style={styles.scannerInstructions}>
                            Position QR code within the frame
                        </Text>
                    </View>
                </CameraView>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header / Hero Section */}
            <View style={styles.heroSection}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greetingText}>Welcome back,</Text>
                        <Text style={styles.nameText}>{displayName}</Text>
                    </View>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarLetter}>{displayName.charAt(0)}</Text>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsValue}>{stats.today}</Text>
                        <Text style={styles.statsLabel}>Verified Today</Text>
                    </View>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsValue}>{stats.total}</Text>
                        <Text style={styles.statsLabel}>Total Scans</Text>
                    </View>
                </View>
            </View>

            {/* Main Actions */}
            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Verification Center</Text>
                
                <TouchableOpacity 
                    style={styles.mainScanButton}
                    onPress={() => setShowScanner(true)}
                >
                    <View style={styles.scanIconContainer}>
                        <Ionicons name="qr-code" size={48} color="#fff" />
                    </View>
                    <Text style={styles.scanButtonTitle}>Scan QR Credential</Text>
                    <Text style={styles.scanButtonSubtitle}>Instantly verify using blockchain</Text>
                </TouchableOpacity>

                <View style={styles.secondaryActions}>
                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => setShowManualInput(true)}
                    >
                        <Ionicons name="link-outline" size={24} color="#fff" />
                        <Text style={styles.secondaryButtonText}>Manual URL</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => router.push('/history')}
                    >
                        <Ionicons name="time-outline" size={24} color="#fff" />
                        <Text style={styles.secondaryButtonText}>History</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Manual Input Modal-like view */}
            {showManualInput && (
                <View style={styles.manualInputOverlay}>
                    <View style={styles.manualCard}>
                        <Text style={styles.manualTitle}>Manual Verification</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Paste verification link..."
                            placeholderTextColor="#8E8E93"
                            value={manualUrl}
                            onChangeText={setManualUrl}
                            autoCapitalize="none"
                        />
                        <View style={styles.manualButtons}>
                            <TouchableOpacity 
                                style={[styles.btn, styles.btnCancel]}
                                onPress={() => { setShowManualInput(false); setManualUrl(''); }}
                            >
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.btn, styles.btnVerify]}
                                onPress={() => {
                                    processUrl(manualUrl);
                                    setManualUrl('');
                                    setShowManualInput(false);
                                }}
                            >
                                <Text style={[styles.btnText, { color: '#000' }]}>Verify</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Branding Footer */}
            <View style={styles.footer}>
                <Ionicons name="shield-checkmark" size={24} color="rgba(255,215,0,0.3)" />
                <Text style={styles.footerText}>Secured by EduChain Blockchain</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    contentContainer: {
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 24,
    },
    heroSection: {
        backgroundColor: '#000', // Black
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    greetingText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
    },
    nameText: {
        color: '#fff', // White
        fontSize: 28,
        fontWeight: 'bold',
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    avatarLetter: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statsCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statsValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statsLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 4,
    },
    actionsSection: {
        padding: 24,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    mainScanButton: {
        backgroundColor: '#1a1a1a',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 20,
    },
    scanIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    scanButtonTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scanButtonSubtitle: {
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 8,
    },
    secondaryActions: {
        flexDirection: 'row',
        gap: 16,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    footerText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
    },
    scannerContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    scannerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'space-between',
        paddingVertical: 60,
    },
    scannerHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    backButton: {
        position: 'absolute',
        left: 24,
        top: 0,
    },
    scannerHeaderText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    viewfinderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewfinder: {
        width: 250,
        height: 250,
        borderWidth: 0,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#fff',
    },
    topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
    topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
    scannerInstructions: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        paddingHorizontal: 40,
    },
    manualInputOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 24,
        zIndex: 100,
    },
    manualCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    manualTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#000',
        color: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    manualButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    btn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnCancel: {
        backgroundColor: '#333',
    },
    btnVerify: {
        backgroundColor: '#fff',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    permissionText: { color: '#fff', fontSize: 18, marginBottom: 20 },
    settingsButton: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
    settingsButtonText: { color: '#000', fontWeight: 'bold' },
    closeButton: { padding: 10 },
    closeButtonText: { color: '#8E8E93' },
});
