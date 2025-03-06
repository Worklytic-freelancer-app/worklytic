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
import { useMutation } from '@/hooks/tanstack/useMutation';
import { SecureStoreUtils } from '@/utils/SecureStore';
import { COLORS } from '@/constant/color';
import { baseUrl } from '@/constant/baseUrl';
import { useFetch } from '@/hooks/tanstack/useFetch';
type PaymentRouteProps = RouteProp<RootStackParamList, 'Payment'>;
type PaymentNavigationProps = StackNavigationProp<RootStackParamList>;

interface ProjectResponse {
    _id: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    location: string;
    completedDate: Date;
    status: string;
    requirements: string[];
    image: string[];
    clientId: string;
}

// Tambahkan interface untuk respons pembayaran
interface PaymentResponse {
    orderId: string;
    status: string;
    paymentUrl?: string;
    redirect_url?: string;
    success?: boolean;
    data?: {
        paymentUrl?: string;
        redirect_url?: string;
    };
}

export default function Payment() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<PaymentNavigationProps>();
    const route = useRoute<PaymentRouteProps>();
    const { projectId, orderId, fromPrePayment } = route.params;
    const { data: user, isLoading: userLoading } = useUser();
    
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(orderId || null);
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
        getPaymentStatus(currentOrderId || '', !!currentOrderId);

    // Mutation untuk membuat proyek setelah pembayaran berhasil
    const createProjectMutation = useMutation<ProjectResponse>({
        endpoint: 'projects',
        method: 'POST',
        requiresAuth: true,
    });

    // Gunakan useFetch untuk mendapatkan detail pembayaran dengan tipe yang benar
    const { data: paymentDetail, isLoading: isLoadingDetail, error: detailError } = useFetch<PaymentResponse>({
        endpoint: `payments/detail/${orderId}`,
        enabled: !!orderId,
        requiresAuth: true
    });

    // Efek untuk memantau perubahan status pembayaran
    useEffect(() => {
        if (paymentStatusData && currentOrderId && !paymentProcessed) {
            const status = paymentStatusData.status;
            
            if (status === 'success') {
                setPaymentProcessed(true);
                
                // Jika pembayaran dari pre-payment, buat proyek
                if (fromPrePayment) {
                    handleCreateProjectAfterPayment();
                } else {
                    // Alur lama
                    Alert.alert(
                        'Payment Success',
                        'Your payment has been processed.',
                        [
                            { 
                                text: 'OK', 
                                onPress: () => navigation.navigate('BottomTab', { screen: 'Workspace' })
                            }
                        ]
                    );
                }
            } else if (status === 'failed' || status === 'expired') {
                setPaymentProcessed(true);
                Alert.alert(
                    'Payment Failed',
                    `Your payment ${status === 'failed' ? 'failed' : 'expired'}. Please try again.`,
                    [
                        { 
                            text: 'OK', 
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            }
        }
    }, [paymentStatusData, currentOrderId, paymentProcessed]);

    // Effect untuk mengatur URL pembayaran dari detail
    useEffect(() => {
        if (paymentDetail && !isLoadingDetail) {
            setPaymentUrl(paymentDetail.paymentUrl || paymentDetail.redirect_url || null);
            setInitialLoading(false);
        }
    }, [paymentDetail, isLoadingDetail]);
    
    // Effect untuk menangani error detail
    useEffect(() => {
        if (detailError && orderId) {
            console.error('Error fetching payment details:', detailError);
            // Jika gagal mendapatkan detail, coba cek status
            checkPaymentStatus(
                { orderId },
                {
                    onSuccess: (result) => {
                        if (result && result.paymentUrl) {
                            setPaymentUrl(result.paymentUrl);
                        }
                        setInitialLoading(false);
                    },
                    onError: (err) => {
                        handlePaymentError(err);
                    }
                }
            );
        }
    }, [detailError, orderId]);

    useEffect(() => {
        if (userLoading) return; // Tunggu sampai data user selesai dimuat
        
        if (orderId) {
            // Jika orderId sudah ada (dari pre-payment), gunakan itu
            setCurrentOrderId(orderId);
            
            // Coba dapatkan URL pembayaran dari detail pembayaran
            const fetchPaymentDetails = async () => {
                try {
                    const token = await SecureStoreUtils.getToken();
                    if (!token) {
                        throw new Error('Authentication token not found');
                    }
                    
                    const response = await fetch(`${baseUrl}/api/payments/detail/${orderId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) {
                        if (response.status === 404) {
                            // Jika payment tidak ditemukan, coba cek status
                            checkPaymentStatus({ orderId });
                            return;
                        }
                        throw new Error(`Error ${response.status}`);
                    }
                    
                    const data = await response.json();
                    if (data.success && data.data) {
                        // Set URL pembayaran jika ada
                        setPaymentUrl(data.data.paymentUrl || data.data.redirect_url);
                    }
                    setInitialLoading(false);
                } catch (err) {
                    console.error('Error fetching payment details:', err);
                    // Jika gagal mendapatkan detail, coba cek status
                    checkPaymentStatus(
                        { orderId },
                        {
                            onSuccess: (result) => {
                                if (result && result.paymentUrl) {
                                    setPaymentUrl(result.paymentUrl);
                                }
                                setInitialLoading(false);
                            },
                            onError: (err) => {
                                handlePaymentError(err);
                            }
                        }
                    );
                }
            };
            
            fetchPaymentDetails();
        } else if (!projectId) {
            handlePaymentError(new Error('Project ID or Order ID is required'));
            return;
        } else if (!user) {
            handlePaymentError(new Error('User data not found. Please try logging in again.'));
            return;
        } else {
            // Alur lama - inisiasi pembayaran untuk proyek yang sudah ada
            initiatePayment();
        }
    }, [projectId, orderId, user, userLoading]);

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
                    projectId: projectId || ''
                },
                {
                    onSuccess: (data) => {
                        setPaymentUrl(data.redirect_url || data.paymentUrl || null);
                        setCurrentOrderId(data.orderId);
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
        if (!currentOrderId || paymentProcessed) return;
        
        setWebViewLoading(true);
        
        // Gunakan checkPaymentStatus dari hook usePayment
        checkPaymentStatus(
            { orderId: currentOrderId },
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
                            'Payment Failed',
                            `Your payment ${paymentStatus === 'failed' ? 'failed' : 'expired'}. Please try again.`,
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
                            'Payment Status',
                            `Your payment status: ${paymentStatus}`,
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
    const handlePaymentError = (err: unknown) => {
        console.error('Payment error:', err);
        
        // Tangani error jaringan dengan lebih baik
        if (err instanceof Error && err.message.includes('Network request failed')) {
            setError('Cannot connect to server. Check your internet connection and try again.');
        } else {
            setError(err instanceof Error ? err.message : 'An error occurred while processing payment');
        }
        
        setInitialLoading(false);
    };

    // Fungsi untuk membuat proyek setelah pembayaran berhasil
    const handleCreateProjectAfterPayment = async () => {
        try {
            // Ambil data proyek sementara dari SecureStore
            const tempProjectData = await SecureStoreUtils.getTempProjectData();
            
            if (!tempProjectData) {
                throw new Error('Project data not found');
            }
            
            // Buat proyek menggunakan mutation
            const result = await createProjectMutation.mutateAsync(tempProjectData);
            
            if (result?._id) {
                // Hapus data proyek sementara
                await SecureStoreUtils.clearTempProjectData();
                
                // Tampilkan alert sukses
                Alert.alert(
                    'Project Successfully Created',
                    'Your project has been successfully created and payment has been processed.',
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
            } else {
                throw new Error('Failed to create project');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            Alert.alert(
                'Error',
                `Payment successful but failed to create project: ${errorMessage}. Please contact customer support.`
            );
        }
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
                    <Text style={styles.headerTitle}>Payment</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading payment page...</Text>
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
                    <Text style={styles.errorTitle}>Failed to load payment</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={initiatePayment}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
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
                    <Text style={styles.headerTitle}>Payment</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <CreditCard size={48} color={COLORS.error} />
                    </View>
                    <Text style={styles.errorTitle}>Failed to load payment</Text>
                    <Text style={styles.errorText}>Cannot load payment page. Please try again.</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={initiatePayment}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
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
                <Text style={styles.headerTitle}>Payment</Text>
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