import { useMutation } from '@tanstack/react-query';
import { baseUrl } from '@/constant/baseUrl';
import { SecureStoreUtils } from '@/utils/SecureStore';

// Interface untuk response pre-payment
interface PrePaymentResponse {
    success: boolean;
    message: string;
    data: {
        orderId: string;
        redirect_url?: string;
        paymentUrl?: string;
        status?: 'pending' | 'success' | 'failed' | 'expired';
    };
}

// Interface untuk request pre-payment
interface CreatePrePaymentRequest {
    userId: string;
    amount: number;
    title: string;
}

export const usePrePayment = () => {
    // Mutation untuk membuat pre-payment
    const createPrePaymentMutation = useMutation<PrePaymentResponse['data'], Error, CreatePrePaymentRequest>({
        mutationFn: async ({ userId, amount, title }) => {
            try {
                const token = await SecureStoreUtils.getToken();
                if (!token) {
                    throw new Error('Authentication token not found');
                }
                
                const response = await fetch(`${baseUrl}/api/payments/pre-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ userId, amount, title })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }
                
                const result = await response.json() as PrePaymentResponse;
                
                if (!result.success || !result.data) {
                    throw new Error(result.message || 'Failed to create pre-payment');
                }
                
                return result.data;
            } catch (error) {
                console.error('Pre-payment creation error:', error);
                throw error;
            }
        }
    });

    return {
        createPrePayment: createPrePaymentMutation.mutate,
        createPrePaymentAsync: createPrePaymentMutation.mutateAsync,
        isCreatingPrePayment: createPrePaymentMutation.isPending,
        createPrePaymentError: createPrePaymentMutation.error,
    };
}; 