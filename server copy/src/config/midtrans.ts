import midtransClient, { MidtransError } from 'midtrans-client';

// Konfigurasi Midtrans dengan penanganan error yang lebih baik
const isProduction = process.env.NODE_ENV === 'production';

// Pastikan server key dan client key tidak kosong
const serverKey = process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY || '';
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

console.log('Midtrans Configuration:');
console.log(`- Environment: ${isProduction ? 'Production' : 'Sandbox'}`);
console.log(`- Server Key configured: ${serverKey ? 'Yes' : 'No'}`);
console.log(`- Client Key configured: ${clientKey ? 'Yes' : 'No'}`);

if (!serverKey || !clientKey) {
    console.error('Midtrans keys are not properly configured!');
}

// Buat instance Snap untuk payment gateway dengan penanganan error
export const snap = new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey
});

// Buat instance Core API untuk operasi lanjutan
export const coreApi = new midtransClient.CoreApi({
    isProduction,
    serverKey,
    clientKey
});

// Helper function untuk membuat transaction token dengan penanganan error yang lebih baik
export const createTransactionToken = async (
    transactionDetails: {
        order_id: string;
        gross_amount: number;
    },
    customerDetails?: {
        first_name: string;
        email: string;
        phone?: string;
    },
    itemDetails?: Array<{
        id: string;
        price: number;
        quantity: number;
        name: string;
    }>
) => {
    try {
        // Log untuk debugging
        console.log('Creating transaction with details:', JSON.stringify({
            transaction_details: transactionDetails,
            customer_details: customerDetails,
            item_details: itemDetails
        }, null, 2));
        
        const parameter = {
            transaction_details: transactionDetails,
            customer_details: customerDetails,
            item_details: itemDetails
        };

        const token = await snap.createTransaction(parameter);
        console.log('Transaction token created successfully:', token);
        return token;
    } catch (error) {
        console.error('Error creating transaction token:', error);
        
        // Berikan informasi error yang lebih detail
        if (error instanceof Error) {
            const midtransError = error as MidtransError;
            if (midtransError.ApiResponse) {
                console.error('Midtrans API Response:', midtransError.ApiResponse);
            }
        }
        
        throw error;
    }
};

// Helper function untuk mendapatkan status transaksi dengan penanganan error yang lebih baik
export const getTransactionStatus = async (orderId: string) => {
    try {
        console.log(`Checking transaction status for order ID: ${orderId}`);
        const status = await coreApi.transaction.status(orderId);
        console.log(`Transaction status for ${orderId}:`, status);
        return status;
    } catch (error) {
        console.error(`Error getting transaction status for ${orderId}:`, error);
        
        // Berikan informasi error yang lebih detail
        if (error instanceof Error) {
            const midtransError = error as MidtransError;
            if (midtransError.ApiResponse) {
                console.error('Midtrans API Response:', midtransError.ApiResponse);
                
                // Jika transaksi tidak ditemukan, kembalikan status yang sesuai
                if (midtransError.httpStatusCode === 404) {
                    return {
                        transaction_status: 'not_found',
                        status_code: '404',
                        status_message: 'Transaction not found'
                    };
                }
                
                // Jika server error, kembalikan status yang sesuai
                if (midtransError.httpStatusCode === 500) {
                    return {
                        transaction_status: 'error',
                        status_code: '500',
                        status_message: 'Midtrans server error'
                    };
                }
            }
        }
        
        throw error;
    }
};