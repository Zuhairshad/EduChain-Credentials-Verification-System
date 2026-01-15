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
                return '#34C759';
            case 'revoked':
                return '#FF9500';
            case 'invalid':
                return '#FF3B30';
            case 'error':
                return '#8E8E93';
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
                <Ionicons
                    name={getStatusIcon(item.status) as any}
                    size={32}
                    color={getStatusColor(item.status)}
                />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.studentName}</Text>
                    <Text style={styles.itemDegree} numberOfLines={1}>
                        {item.degree}
                    </Text>
                    <Text style={styles.itemTime}>
                        {new Date(item.timestamp).toLocaleString()}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>
    );

    if (history.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={64} color="#8E8E93" />
                <Text style={styles.emptyText}>No verification history</Text>
                <Text style={styles.emptySubtext}>
                    Verified credentials will appear here
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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#007AFF"
                    />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerText}>
                            {history.length} verification{history.length !== 1 ? 's' : ''}
                        </Text>
                        <TouchableOpacity onPress={handleClearHistory}>
                            <Text style={styles.clearButton}>Clear All</Text>
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
        backgroundColor: '#1a1a1a',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 24,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
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
        padding: 16,
    },
    headerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    clearButton: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '600',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2c2c2e',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemInfo: {
        marginLeft: 12,
        flex: 1,
    },
    itemName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemDegree: {
        color: '#8E8E93',
        fontSize: 14,
        marginBottom: 4,
    },
    itemTime: {
        color: '#8E8E93',
        fontSize: 12,
    },
});
