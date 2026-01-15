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
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ScannerScreen() {
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualUrl, setManualUrl] = useState('');

    useEffect(() => {
        requestCameraPermission();
    }, []);

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        processUrl(data);
    };

    const processUrl = (url: string) => {
        try {
            // Extract credential ID from URL
            // Format: {URL}/verify/{uuid}
            const match = url.match(/\/verify\/([a-f0-9-]{36})/i);

            if (match && match[1]) {
                const credentialId = match[1];
                router.push(`/verification/${credentialId}`);
            } else {
                Alert.alert(
                    'Invalid QR Code',
                    'This QR code does not contain a valid verification URL.',
                    [{ text: 'OK', onPress: () => setScanned(false) }]
                );
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to process QR code.',
                [{ text: 'OK', onPress: () => setScanned(false) }]
            );
        }
    };

    const handleManualSubmit = () => {
        if (!manualUrl.trim()) {
            Alert.alert('Error', 'Please enter a verification URL');
            return;
        }
        processUrl(manualUrl);
        setManualUrl('');
        setShowManualInput(false);
    };

    if (hasPermission === null) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Requesting camera permission...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="camera-off-outline" size={64} color="#FF3B30" />
                <Text style={styles.permissionText}>Camera permission denied</Text>
                <Text style={styles.permissionSubtext}>
                    Please enable camera access in your device settings to scan QR codes.
                </Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => Linking.openSettings()}
                >
                    <Text style={styles.settingsButtonText}>Open Settings</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {showManualInput ? (
                <View style={styles.manualContainer}>
                    <Text style={styles.manualTitle}>Enter Verification URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Paste verification link here"
                        placeholderTextColor="#8E8E93"
                        value={manualUrl}
                        onChangeText={setManualUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <View style={styles.manualButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => {
                                setShowManualInput(false);
                                setManualUrl('');
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleManualSubmit}
                        >
                            <Text style={styles.submitButtonText}>Verify</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr'],
                        }}
                    >
                        <View style={styles.overlay}>
                            <View style={styles.unfocusedContainer}></View>
                            <View style={styles.middleContainer}>
                                <View style={styles.unfocusedContainer}></View>
                                <View style={styles.focusedContainer}>
                                    <View style={[styles.corner, styles.topLeft]} />
                                    <View style={[styles.corner, styles.topRight]} />
                                    <View style={[styles.corner, styles.bottomLeft]} />
                                    <View style={[styles.corner, styles.bottomRight]} />
                                </View>
                                <View style={styles.unfocusedContainer}></View>
                            </View>
                            <View style={styles.unfocusedContainer}></View>
                        </View>
                    </CameraView>

                    <View style={styles.instructions}>
                        <Text style={styles.instructionsText}>
                            Position QR code within the frame
                        </Text>
                    </View>

                    <View style={styles.controls}>
                        {scanned && (
                            <TouchableOpacity
                                style={styles.rescanButton}
                                onPress={() => setScanned(false)}
                            >
                                <Ionicons name="refresh" size={24} color="#fff" />
                                <Text style={styles.rescanText}>Tap to Scan Again</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.manualButton}
                            onPress={() => setShowManualInput(true)}
                        >
                            <Ionicons name="link-outline" size={20} color="#007AFF" />
                            <Text style={styles.manualButtonText}>Enter URL Manually</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 24,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 16,
    },
    permissionText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    permissionSubtext: {
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    settingsButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 24,
    },
    settingsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 300,
    },
    focusedContainer: {
        width: 300,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#007AFF',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    instructions: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    instructionsText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    rescanButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 16,
    },
    rescanText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    manualButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    manualButtonText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    manualContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 24,
        justifyContent: 'center',
    },
    manualTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#2c2c2e',
        color: '#fff',
        fontSize: 16,
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    manualButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#2c2c2e',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#007AFF',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
