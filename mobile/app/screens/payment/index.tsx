import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigators';
import { baseUrl } from '@/constant/baseUrl';
import { SecureStoreUtils } from '@/utils/SecureStore';
import { useUser } from '@/hooks/useUser';

type PaymentRouteProps = RouteProp<RootStackParamList, 'Payment'>;
type PaymentNavigationProps = StackNavigationProp<RootStackParamList>;

export default function Payment() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<PaymentNavigationProps>();
    const route = useRoute<PaymentRouteProps>();
    const { projectId } = route.params;
    const { user, loading: userLoading } = useUser();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    
    const webViewRef = useRef<WebView>(null);

    useEffect(() => {
        if (userLoading) return; // Tunggu sampai data user selesai dimuat
        
        if (!projectId) {
            setError('Project ID is required');
            setLoading(false);
            return;
        }
        
        if (!user) {
            setError('User data not found. Please try logging in again.');
            setLoading(false);
            return;
        }
        
        createPayment();
    }, [projectId, user, userLoading]);

    const createPayment = async () => {
        try {
            setLoading(true);
            
            const token = await SecureStoreUtils.getToken();
            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            if (!user?._id) {
                throw new Error('User data not found');
            }
            
            console.log('Creating payment for project:', projectId);
            console.log('User ID:', user._id);
            
            const response = await fetch(`${baseUrl}/api/projects/${projectId}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user._id
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Payment API error:', errorData);
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Payment API response:', result);
            
            if (!result.success || !result.data) {
                throw new Error(result.message || 'Failed to create payment');
            }
            
            setPaymentUrl(result.data.redirect_url || result.data.paymentUrl);
            setOrderId(result.data.orderId);
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            console.error('Payment creation error:', errorMessage);
            setError(errorMessage);
            Alert.alert('Payment Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async () => {
        if (!orderId) return;
        
        try {
            setLoading(true);
            
            const token = await SecureStoreUtils.getToken();
            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            const response = await fetch(`${baseUrl}/api/payments/check-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId: orderId
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                const paymentStatus = result.data.status;
                
                if (paymentStatus === 'success') {
                    Alert.alert(
                        'Payment Successful',
                        'Your payment has been processed successfully.',
                        [
                            { 
                                text: 'OK', 
                                onPress: () => navigation.navigate('Workspace')
                            }
                        ]
                    );
                } else if (paymentStatus === 'failed' || paymentStatus === 'expired') {
                    Alert.alert(
                        'Payment Failed',
                        `Your payment has ${paymentStatus}. Please try again.`,
                        [
                            { 
                                text: 'OK', 
                                onPress: () => navigation.goBack()
                            }
                        ]
                    );
                } else {
                    // Untuk status pending atau lainnya
                    Alert.alert(
                        'Payment Status',
                        `Your payment status is: ${paymentStatus}`,
                        [
                            { 
                                text: 'OK', 
                                onPress: () => navigation.goBack()
                            }
                        ]
                    );
                }
            } else {
                throw new Error(result.message || 'Failed to check payment status');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigationStateChange = (navState: any) => {
        // Deteksi ketika pengguna kembali dari halaman pembayaran
        if (navState.url.includes('payment-success') || 
            navState.url.includes('payment-failed') || 
            navState.url.includes('payment-pending')) {
            
            // Cek status pembayaran
            checkPaymentStatus();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
                <View style={{ width: 40 }} />
            </View>

            {(loading || userLoading) && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Loading payment page...</Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={createPayment}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && !error && paymentUrl && (
                <WebView
                    ref={webViewRef}
                    source={{ uri: paymentUrl }}
                    style={styles.webView}
                    onNavigationStateChange={handleNavigationStateChange}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.webViewLoading}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                        </View>
                    )}
                />
            )}

            {!loading && !error && !paymentUrl && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load payment page</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={createPayment}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#3b82f6',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#4b5563',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    webView: {
        flex: 1,
    },
    webViewLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
});