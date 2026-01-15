import AsyncStorage from '@react-native-async-storage/async-storage';
import { VerificationResult } from './verification';

const HISTORY_KEY = '@verification_history';

export interface VerificationHistoryItem {
    id: string;
    credentialId: string;
    studentName: string;
    studentId: string;
    degree: string;
    status: 'verified' | 'invalid' | 'revoked' | 'error';
    timestamp: string;
    result: VerificationResult;
}

/**
 * Save verification to history
 */
export async function saveToHistory(
    credentialId: string,
    result: VerificationResult
): Promise<void> {
    try {
        const history = await getHistory();

        const historyItem: VerificationHistoryItem = {
            id: Date.now().toString(),
            credentialId,
            studentName: result.credential?.student_name || 'Unknown',
            studentId: result.credential?.student_id_number || 'N/A',
            degree: result.credential?.degree_level || 'N/A',
            status: result.status,
            timestamp: new Date().toISOString(),
            result
        };

        // Add to beginning of array
        history.unshift(historyItem);

        // Keep only last 50 verifications
        const trimmedHistory = history.slice(0, 50);

        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

/**
 * Get verification history
 */
export async function getHistory(): Promise<VerificationHistoryItem[]> {
    try {
        const data = await AsyncStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting history:', error);
        return [];
    }
}

/**
 * Clear all history
 */
export async function clearHistory(): Promise<void> {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Error clearing history:', error);
    }
}

/**
 * Delete specific history item
 */
export async function deleteHistoryItem(id: string): Promise<void> {
    try {
        const history = await getHistory();
        const filtered = history.filter(item => item.id !== id);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting history item:', error);
    }
}
