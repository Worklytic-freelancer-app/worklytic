import midtransClient from 'midtrans-client';

// Konfigurasi Midtrans
const isProduction = process.env.NODE_ENV === 'production';

// Buat instance Snap untuk payment gateway
export const snap = new midtransClient.Snap({
    isProduction,
    serverKey: process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY || 'SB-Mid-client-9H7mfNNmWezLfAxL',
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-server-cqmJ4UGEj-5Ks3Zo5f30pKXj'
});

// Buat instance Core API untuk operasi lanjutan
export const coreApi = new midtransClient.CoreApi({
    isProduction,
    serverKey: process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY || 'SB-Mid-server-cqmJ4UGEj-5Ks3Zo5f30pKXj',
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-9H7mfNNmWezLfAxL'
});

// Helper function untuk membuat transaction token
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
        const parameter = {
            transaction_details: transactionDetails,
            customer_details: customerDetails,
            item_details: itemDetails
        };

        const token = await snap.createTransaction(parameter);
        return token;
    } catch (error) {
        console.error('Error creating transaction token:', error);
        throw error;
    }
};

// Helper function untuk mendapatkan status transaksi
export const getTransactionStatus = async (orderId: string) => {
    try {
        const status = await coreApi.transaction.status(orderId);
        return status;
    } catch (error) {
        console.error('Error getting transaction status:', error);
        throw error;
    }
};