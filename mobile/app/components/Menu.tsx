import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { COLORS } from '@/constant/color';

interface MenuProps {
    visible: boolean;
    onDismiss: () => void;
    position: { x: number; y: number };
    children: React.ReactNode;
}

interface MenuItemProps {
    onPress: () => void;
    children: React.ReactNode;
    icon?: string;
    destructive?: boolean;
}

export const Menu = ({ visible, onDismiss, position, children }: MenuProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <TouchableOpacity 
                style={styles.overlay} 
                onPress={onDismiss}
                activeOpacity={1}
            >
                <View 
                    style={[
                        styles.menuContainer,
                        {
                            top: position.y,
                            left: position.x - 150, // Menyesuaikan posisi menu
                        }
                    ]}
                >
                    {children}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export const MenuItem = ({ onPress, children, icon, destructive }: MenuItemProps) => {
    return (
        <TouchableOpacity 
            onPress={onPress}
            style={styles.menuItem}
        >
            <Text style={[
                styles.menuItemText,
                destructive && styles.destructiveText
            ]}>
                {children}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    menuContainer: {
        position: 'absolute',
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 4,
        minWidth: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuItemText: {
        fontSize: 16,
        color: COLORS.black,
    },
    destructiveText: {
        color: COLORS.error,
    },
}); 