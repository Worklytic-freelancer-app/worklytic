import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react-native';
import { COLORS } from '@/constant/color';

interface ConfirmationProps {
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'confirm';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    loading?: boolean;
}

const Confirmation = ({
    visible,
    title,
    message,
    type,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    onConfirm,
    onCancel,
    loading = false
}: ConfirmationProps) => {
    
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={40} color={COLORS.success} />;
            case 'error':
                return <XCircle size={40} color={COLORS.error} />;
            case 'warning':
            case 'confirm':
                return <AlertTriangle size={40} color={COLORS.warning} />;
            default:
                return null;
        }
    };
    
    const getButtonStyle = () => {
        switch (type) {
            case 'success':
                return { backgroundColor: COLORS.success };
            case 'error':
                return { backgroundColor: COLORS.error };
            case 'warning':
                return { backgroundColor: COLORS.warning };
            case 'confirm':
                return { backgroundColor: COLORS.primary };
            default:
                return { backgroundColor: COLORS.primary };
        }
    };
    
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={onCancel}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <X size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                    
                    <View style={styles.iconContainer}>
                        {getIcon()}
                    </View>
                    
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    
                    <View style={styles.buttonContainer}>
                        {(type === 'confirm' || type === 'warning') && (
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={onCancel}
                                disabled={loading}
                            >
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity 
                            style={[styles.confirmButton, getButtonStyle()]}
                            onPress={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.confirmButtonText}>{confirmText}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    confirmButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    confirmButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        flex: 1,
    },
    cancelButtonText: {
        color: COLORS.darkGray,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Confirmation;