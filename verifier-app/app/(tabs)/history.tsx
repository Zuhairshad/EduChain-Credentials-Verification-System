import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getHistory, clearHistory, VerificationHistoryItem } from '../../lib/storage';

export default function HistoryScreen() {
    const router = useRouter();
    const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = async () => {
        const items = await getHistory();
        setHistory(items);
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

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
                        setHistory([]);
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
                return '#FFD700'; // Gold
            case 'revoked':
                return '#ff3b30';
            case 'invalid':
                return '#ff9500';
            case 'error':
                return '#555';
            default:
                return '#8E8E93';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return 'checkmark-circle';
            case 'revoked':
                return 'close-circle';
            case 'invalid':
                return 'alert-circle';
            case 'error':
                return 'warning';
            default:
                return 'help-circle';
        }
    };

    const renderItem = ({ item }: { item: VerificationHistoryItem }) => (
        <TouchableOpacity
            style={styles.historyItem}
            onPress={() => router.push(`/verification/${item.credentialId}`)}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.statusIconBg, { backgroundColor: 'rgba(255,215,0,0.05)' }]}>
                    <Ionicons
                        name={getStatusIcon(item.status) as any}
                        size={28}
                        color={getStatusColor(item.status)}
                    />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.studentName}</Text>
                    <Text style={styles.itemDegree} numberOfLines={1}>
                        {item.degree}
                    </Text>
                    <Text style={styles.itemTime}>
                        {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#333" />
        </TouchableOpacity>
    );

    if (history.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                    <Ionicons name="time-outline" size={48} color="#FFD700" />
                </View>
                <Text style={styles.emptyText}>No Verifications Yet</Text>
                <Text style={styles.emptySubtext}>
                    Activity from the portal will appear here
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FFD700"
                    />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Recent Activity</Text>
                        <TouchableOpacity onPress={handleClearHistory}>
                            <Text style={styles.clearButton}>Clear Logs</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    listContent: {
        paddingBottom: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    emptyText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    emptySubtext: {
        color: '#8E8E93',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 32,
    },
    headerTitle: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    clearButton: {
        color: '#ff4444',
        fontSize: 12,
        fontWeight: 'bold',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1a1a1a',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusIconBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    itemInfo: {
        marginLeft: 16,
        flex: 1,
    },
    itemName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    itemDegree: {
        color: '#FFD700',
        fontSize: 12,
        opacity: 0.8,
        marginBottom: 4,
    },
    itemTime: {
        color: '#555',
        fontSize: 10,
    },
});
