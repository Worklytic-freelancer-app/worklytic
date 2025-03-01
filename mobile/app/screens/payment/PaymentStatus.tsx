import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export function PaymentSuccess() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Icon name="check-circle" size={64} color="green" />
            <Text style={styles.title}>Pembayaran Berhasil!</Text>
            <Text style={styles.subtitle}>Project Anda telah dipublish</Text>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.navigate('Projects')}
            >
                <Text style={styles.buttonText}>Lihat Project</Text>
            </TouchableOpacity>
        </View>
    );
} 