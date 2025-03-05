import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { WifiOff, Settings, RefreshCw } from 'lucide-react-native';
import { COLORS } from '@/constant/color';

interface ErrorScreenProps {
    onRetry?: () => void;
    message?: string;
}

export default function ErrorScreen({ onRetry, message }: ErrorScreenProps) {
    const openSettings = () => {
        Linking.openSettings();
    };

    return (
        <View style={styles.container}>
            <WifiOff size={64} color={COLORS.error} strokeWidth={1.5} />
            
            <Text style={styles.title}>Koneksi Terputus</Text>
            
            <Text style={styles.message}>
                {message || 'Sepertinya ada masalah dengan koneksi internet kamu. Yuk coba sambungkan ulang!'}
            </Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.button, styles.retryButton]} 
                    onPress={onRetry}
                >
                    <RefreshCw size={20} color={COLORS.background} />
                    <Text style={styles.buttonText}>Sambungkan Ulang</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, styles.settingsButton]} 
                    onPress={openSettings}
                >
                    <Settings size={20} color={COLORS.primary} />
                    <Text style={[styles.buttonText, styles.settingsText]}>
                        Buka Pengaturan
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
        marginTop: 24,
        marginBottom: 12,
    },
    message: {
        fontSize: 15,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    settingsButton: {
        backgroundColor: COLORS.background,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.background,
    },
    settingsText: {
        color: COLORS.primary,
    },
}); 