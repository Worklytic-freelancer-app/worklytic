import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { baseUrl } from '@/constant/baseUrl';
import { SecureStoreUtils } from '@/utils/SecureStore';
import { COLORS } from '@/constant/color';

// Interface untuk response pembayaran
interface PaymentResponse {
    success: boolean;
    message: string;
    data: {
        orderId: string;
        redirect_url?: string;
        paymentUrl?: string;
        status?: 'pending' | 'success' | 'failed' | 'expired';
    };
}

// Interface untuk request pembayaran
interface CreatePaymentRequest {
    userId: string;
    projectId: string;
}

// Interface untuk request cek status pembayaran
interface CheckPaymentStatusRequest {
    orderId: string;
}

// Hook untuk operasi pembayaran
export const usePayment = () => {
    const queryClient = useQueryClient();

    // Mutation untuk membuat pembayaran baru
    const createPaymentMutation = useMutation<PaymentResponse['data'], Error, CreatePaymentRequest>({
        mutationFn: async ({ userId, projectId }) => {
            try {
                const token = await SecureStoreUtils.getToken();
                if (!token) {
                    throw new Error('Authentication token not found');
                }
                
                const response = await fetch(`${baseUrl}/api/projects/${projectId}/payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ userId })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }
                
                const result = await response.json() as PaymentResponse;
                
                if (!result.success || !result.data) {
                    throw new Error(result.message || 'Failed to create payment');
                }
                
                return result.data;
            } catch (error) {
                console.error('Payment creation error:', error);
                throw error;
            }
        }
    });

    // Mutation untuk memeriksa status pembayaran
    const checkPaymentStatusMutation = useMutation<
        { status: string; message: string }, 
        Error, 
        CheckPaymentStatusRequest
    >({
        mutationFn: async ({ orderId }) => {
            try {
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
                    body: JSON.stringify({ orderId })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Failed to check payment status');
                }
                
                return {
                    status: result.data.status,
                    message: result.message
                };
            } catch (error) {
                console.error('Check payment status error:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            // Jika pembayaran berhasil, invalidate queries yang relevan
            if (data.status === 'success') {
                queryClient.invalidateQueries({ queryKey: ['projects'] });
                queryClient.invalidateQueries({ queryKey: ['user'] });
            }
        }
    });

    // Query untuk mendapatkan riwayat pembayaran pengguna
    const getPaymentHistoryQuery = (userId?: string, enabled = !!userId) => 
        useQuery({
            queryKey: ['paymentHistory', userId],
            queryFn: async () => {
                try {
                    if (!userId) throw new Error('User ID is required');
                    
                    const token = await SecureStoreUtils.getToken();
                    if (!token) {
                        throw new Error('Authentication token not found');
                    }
                    
                    const response = await fetch(`${baseUrl}/api/payments/history/${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Error: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    
                    if (!result.success) {
                        throw new Error(result.message || 'Failed to fetch payment history');
                    }
                    
                    return result.data;
                } catch (error) {
                    console.error('Fetch payment history error:', error);
                    throw error;
                }
            },
            enabled,
            staleTime: 5 * 60 * 1000, // 5 menit
        });

    // Tambahkan query untuk mendapatkan status pembayaran dengan caching
    const getPaymentStatusQuery = (orderId?: string, enabled = !!orderId) => 
        useQuery({
            queryKey: ['paymentStatus', orderId],
            queryFn: async () => {
                if (!orderId) throw new Error('Order ID is required');
                
                const token = await SecureStoreUtils.getToken();
                if (!token) {
                    throw new Error('Authentication token not found');
                }
                
                try {
                    const response = await fetch(`${baseUrl}/api/payments/check-status`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ orderId })
                    });
                    
                    if (!response.ok) {
                        // Jika status 404, kembalikan status pending daripada error
                        if (response.status === 404) {
                            return { status: 'pending', message: 'Payment is being processed' };
                        }
                        
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Error: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    
                    if (!result.success) {
                        throw new Error(result.message || 'Failed to check payment status');
                    }
                    
                    return result.data;
                } catch (error) {
                    // Tangani error dengan lebih baik
                    console.error('Error checking payment status:', error);
                    
                    // Jika error terkait "Transaction doesn't exist", kembalikan status pending
                    if (error instanceof Error && 
                        (error.message.includes("Transaction doesn't exist") || 
                         error.message.includes("404"))) {
                        return { status: 'pending', message: 'Payment is being processed' };
                    }
                    
                    throw error;
                }
            },
            enabled,
            staleTime: 30 * 1000, // 30 detik
            refetchInterval: 10 * 1000, // Cek setiap 10 detik
            retry: 1, // Kurangi jumlah retry untuk mengurangi error logs
            retryDelay: 5000, // Tunggu 5 detik sebelum retry
        });

    // Fungsi helper untuk mendapatkan warna berdasarkan status pembayaran
    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'success':
                return COLORS.success;
            case 'pending':
                return COLORS.warning;
            case 'failed':
            case 'expired':
                return COLORS.error;
            default:
                return COLORS.gray;
        }
    };

    return {
        // Create payment
        createPayment: createPaymentMutation.mutate,
        createPaymentAsync: createPaymentMutation.mutateAsync,
        isCreatingPayment: createPaymentMutation.isPending,
        createPaymentError: createPaymentMutation.error,
        
        // Check payment status
        checkPaymentStatus: checkPaymentStatusMutation.mutate,
        checkPaymentStatusAsync: checkPaymentStatusMutation.mutateAsync,
        isCheckingPaymentStatus: checkPaymentStatusMutation.isPending,
        checkPaymentStatusError: checkPaymentStatusMutation.error,
        
        // Payment history
        getPaymentHistory: getPaymentHistoryQuery,
        
        // Payment status with auto-refresh
        getPaymentStatus: getPaymentStatusQuery,
        
        // Helper
        getStatusColor,
    };
}; 