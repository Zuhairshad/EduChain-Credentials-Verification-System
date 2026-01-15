import { Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function NotFoundScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>404 - Not Found</Text>
            <Link href="/" style={styles.link}>
                <Text style={styles.linkText}>Go to home screen</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    link: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    linkText: {
        fontSize: 16,
        color: '#007AFF',
    },
});
