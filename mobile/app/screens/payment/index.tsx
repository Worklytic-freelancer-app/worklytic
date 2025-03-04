import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, CreditCard } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigators';
import { useUser } from '@/hooks/tanstack/useUser';
import { usePayment } from '@/hooks/tanstack/usePayment';
import { COLORS } from '@/constant/color';

type PaymentRouteProps = RouteProp<RootStackParamList, 'Payment'>;
type PaymentNavigationProps = StackNavigationProp<RootStackParamList>;

export default function Payment() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<PaymentNavigationProps>();
    const route = useRoute<PaymentRouteProps>();
    const { projectId } = route.params;
    const { data: user, isLoading: userLoading } = useUser();
    
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [webViewLoading, setWebViewLoading] = useState(false);
    const [paymentProcessed, setPaymentProcessed] = useState(false);
    
    const webViewRef = useRef<WebView>(null);
    
    // Gunakan hook usePayment
    const { 
        createPayment,
        isCreatingPayment,
        checkPaymentStatus,
        isCheckingPaymentStatus,
        getPaymentStatus
    } = usePayment();

    // Gunakan getPaymentStatus untuk auto-refresh status pembayaran
    const { data: paymentStatusData, isLoading: isLoadingStatus } = 
        getPaymentStatus(orderId || '', !!orderId);

    // Efek untuk memantau perubahan status pembayaran
    useEffect(() => {
        if (paymentStatusData && orderId && !paymentProcessed) {
            const status = paymentStatusData.status;
            
            if (status === 'success') {
                setPaymentProcessed(true);
                Alert.alert(
                    'Pembayaran Berhasil',
                    'Pembayaran Anda telah berhasil diproses.',
                    [
                        { 
                            text: 'OK', 
                            onPress: () => navigation.reset({
                                index: 0,
                                routes: [{ name: 'BottomTab', params: { screen: 'Workspace' } }],
                            })
                        }
                    ]
                );
            } else if (status === 'failed' || status === 'expired') {
                setPaymentProcessed(true);
                Alert.alert(
                    'Pembayaran Gagal',
                    `Pembayaran Anda ${status === 'failed' ? 'gagal' : 'kedaluwarsa'}. Silakan coba lagi.`,
                    [
                        { 
                            text: 'OK', 
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            }
        }
    }, [paymentStatusData, orderId, paymentProcessed]);

    useEffect(() => {
        if (userLoading) return; // Tunggu sampai data user selesai dimuat
        
        if (!projectId) {
            handlePaymentError(new Error('Project ID is required'));
            return;
        }
        
        if (!user) {
            handlePaymentError(new Error('User data not found. Please try logging in again.'));
            return;
        }
        
        initiatePayment();
    }, [projectId, user, userLoading]);

    const initiatePayment = () => {
        try {
            if (!user?._id) {
                handlePaymentError(new Error('User data not found'));
                return;
            }
            
            console.log('Creating payment for project:', projectId);
            console.log('User ID:', user._id);
            
            // Gunakan createPayment dari hook usePayment
            createPayment(
                {
                    userId: user._id,
                    projectId
                },
                {
                    onSuccess: (data) => {
                        setPaymentUrl(data.redirect_url || data.paymentUrl || null);
                        setOrderId(data.orderId);
                        setInitialLoading(false);
                    },
                    onError: (err) => {
                        handlePaymentError(err);
                    }
                }
            );
        } catch (err) {
            handlePaymentError(err);
        }
    };

    const handleCheckPaymentStatus = () => {
        if (!orderId || paymentProcessed) return;
        
        setWebViewLoading(true);
        
        // Gunakan checkPaymentStatus dari hook usePayment
        checkPaymentStatus(
            { orderId },
            {
                onSuccess: (result) => {
                    setWebViewLoading(false);
                    const paymentStatus = result.status;
                    
                    if (paymentStatus === 'success' && !paymentProcessed) {
                        setPaymentProcessed(true);
                        Alert.alert(
                            'Pembayaran Berhasil',
                            'Pembayaran Anda telah berhasil diproses.',
                            [
                                { 
                                    text: 'OK', 
                                    onPress: () => navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'BottomTab', params: { screen: 'Workspace' } }],
                                    })
                                }
                            ]
                        );
                    } else if ((paymentStatus === 'failed' || paymentStatus === 'expired') && !paymentProcessed) {
                        setPaymentProcessed(true);
                        Alert.alert(
                            'Pembayaran Gagal',
                            `Pembayaran Anda ${paymentStatus === 'failed' ? 'gagal' : 'kedaluwarsa'}. Silakan coba lagi.`,
                            [
                                { 
                                    text: 'OK', 
                                    onPress: () => navigation.goBack()
                                }
                            ]
                        );
                    } else if (!paymentProcessed) {
                        // Untuk status pending atau lainnya
                        Alert.alert(
                            'Status Pembayaran',
                            `Status pembayaran Anda: ${paymentStatus}`,
                            [
                                { 
                                    text: 'OK', 
                                    onPress: () => {}
                                }
                            ]
                        );
                    }
                },
                onError: (err) => {
                    handlePaymentError(err);
                    setWebViewLoading(false);
                }
            }
        );
    };

    const handleNavigationStateChange = (navState: any) => {
        // Deteksi ketika pengguna kembali dari halaman pembayaran
        if (navState.url.includes('payment-success') || 
            navState.url.includes('payment-failed') || 
            navState.url.includes('payment-pending')) {
            
            // Cek status pembayaran
            handleCheckPaymentStatus();
        }
    };

    // Fungsi untuk menangani error dengan lebih baik
    const handlePaymentError = (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        
        // Log error untuk debugging
        console.error('Payment error:', error);
        
        // Kategorikan error
        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
            setError('Koneksi internet terputus. Silakan periksa koneksi Anda dan coba lagi.');
        } else if (errorMessage.includes('token') || errorMessage.includes('authentication')) {
            setError('Sesi login Anda telah berakhir. Silakan login kembali.');
            // Mungkin redirect ke halaman login
        } else {
            setError(`Gagal memproses pembayaran: ${errorMessage}`);
        }
        
        setInitialLoading(false);
        setWebViewLoading(false);
    };

    // Render loading screen saat inisialisasi
    if (initialLoading || userLoading || isCreatingPayment) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pembayaran</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Memuat halaman pembayaran...</Text>
                </View>
            </View>
        );
    }

    // Render error screen
    if (error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pembayaran</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <CreditCard size={48} color={COLORS.error} />
                    </View>
                    <Text style={styles.errorTitle}>Gagal Memuat Pembayaran</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={initiatePayment}
                    >
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Render no payment URL screen
    if (!paymentUrl) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pembayaran</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <CreditCard size={48} color={COLORS.error} />
                    </View>
                    <Text style={styles.errorTitle}>Gagal Memuat Pembayaran</Text>
                    <Text style={styles.errorText}>Tidak dapat memuat halaman pembayaran. Silakan coba lagi.</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={initiatePayment}
                    >
                        <Text style={styles.retryButtonText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Render WebView for payment
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pembayaran</Text>
                <View style={{ width: 40 }} />
            </View>

            <WebView
                ref={webViewRef}
                source={{ uri: paymentUrl }}
                style={styles.webView}
                onNavigationStateChange={handleNavigationStateChange}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                onLoadStart={() => setWebViewLoading(true)}
                onLoadEnd={() => setWebViewLoading(false)}
            />
            
            {(webViewLoading || isCheckingPaymentStatus || isLoadingStatus) && (
                <View style={styles.webViewLoading}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: COLORS.darkGray,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 12,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: COLORS.darkGray,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    retryButtonText: {
        color: COLORS.background,
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
});