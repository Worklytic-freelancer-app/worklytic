import { Repository as Payment } from "./payment.repository";
import type { CreatePayment, UpdatePayment, Payments, PaymentStatus } from "./payment.schema";
import { 
    CreatePaymentValidate, 
    UpdatePaymentValidate 
} from "./payment.schema";
import type { Result } from "./payment.repository";
import { createTransactionToken, getTransactionStatus } from "../../config/midtrans";
import { nanoid } from "nanoid";
import { ObjectId } from "mongodb";

// Definisikan interface untuk notifikasi Midtrans
interface MidtransNotification {
    transaction_time: string;
    transaction_status: string;
    transaction_id: string;
    status_code: string;
    signature_key: string;
    payment_type: string;
    order_id: string;
    merchant_id: string;
    gross_amount: string;
    fraud_status?: string;
    currency: string;
    [key: string]: unknown;
}

// Definisikan interface untuk response Midtrans Snap
interface MidtransResponse {
    token?: string;
    redirect_url?: string;
    transaction_id?: string;
    order_id?: string;
    status_code?: string;
    status_message?: string;
    // Properti dari Snap API
    token_id?: string;
    payment_type?: string;
    transaction_time?: string;
    gross_amount?: string;
    currency?: string;
    [key: string]: unknown;
}

class PaymentService {
    async create(data: CreatePayment): Promise<Result<Payments>> {
        const validated = CreatePaymentValidate.parse(data);
        return await Payment.create(validated);
    }
    
    async getAll(): Promise<Result<Payments[]>> {
        return await Payment.findAll();
    }
    
    async getById(id: string): Promise<Result<Payments>> {
        return await Payment.findById({ id });
    }
    
    async update(id: string, data: UpdatePayment): Promise<Result<Payments>> {
        const validated = UpdatePaymentValidate.parse(data);
        return await Payment.update({ id }, validated);
    }
    
    async delete(id: string): Promise<Result<Payments>> {
        return await Payment.delete({ id });
    }

    async createPaymentForProject(
        projectId: string, 
        userId: string, 
        amount: number,
        customerDetails: {
            first_name: string;
            email: string;
            phone?: string;
        },
        projectDetails: {
            title: string;
        }
    ): Promise<Result<Payments & { token?: string, redirect_url?: string }>> {
        try {
            // Buat order ID unik yang lebih sederhana (hanya alphanumeric)
            const orderId = `ORDER${nanoid(10).replace(/[^A-Za-z0-9]/g, '')}`;
            
            console.log(`Creating payment for project ${projectId} with order ID ${orderId}`);
            
            // Pastikan amount adalah integer (Midtrans tidak menerima desimal)
            const grossAmount = Math.round(amount);
            
            // Buat transaction token dari Midtrans dengan error handling yang lebih baik
            let transaction: MidtransResponse;
            try {
                transaction = await createTransactionToken(
                    {
                        order_id: orderId,
                        gross_amount: grossAmount
                    },
                    customerDetails,
                    [{
                        id: projectId,
                        price: grossAmount,
                        quantity: 1,
                        name: projectDetails.title.substring(0, 50) // Batasi panjang nama
                    }]
                ) as MidtransResponse;
                
                // Log seluruh respons untuk debugging
                console.log('Full Midtrans response:', JSON.stringify(transaction, null, 2));
                
                // Periksa struktur respons
                if (!transaction.token) {
                    console.warn('Warning: Transaction token is missing in Midtrans response');
                }
                
                // Snap API tidak mengembalikan transaction_id, jadi kita gunakan order_id sebagai fallback
                const transactionId = transaction.transaction_id || orderId;
                console.log(`Transaction created with ID: ${transactionId}`);
                
                // Simpan data payment ke database
                const paymentData: CreatePayment = {
                    projectId: new ObjectId(projectId),
                    userId: new ObjectId(userId),
                    amount: grossAmount,
                    status: "pending",
                    transactionId: transactionId,
                    orderId,
                    snapToken: transaction.token || "",
                    paymentUrl: transaction.redirect_url || "",
                    currency: "IDR"
                };
                
                console.log('Saving payment data to database:', paymentData);
                
                const result = await this.create(paymentData);
                
                if (!result.success || !result.data) {
                    throw new Error("Failed to create payment record");
                }
                
                return {
                    ...result,
                    data: {
                        ...result.data,
                        token: transaction.token,
                        redirect_url: transaction.redirect_url
                    }
                };
            } catch (error) {
                console.error('Failed to create Midtrans transaction:', error);
                throw new Error('Gagal membuat transaksi pembayaran. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Payment creation error:', error);
            throw new Error(error instanceof Error ? error.message : "Failed to create payment");
        }
    }
    
    async handleCallback(notificationData: MidtransNotification): Promise<Result<Payments>> {
        try {
            const orderId = notificationData.order_id;
            const transactionStatus = notificationData.transaction_status;
            const fraudStatus = notificationData.fraud_status;
            
            // Cek status transaksi dari Midtrans untuk verifikasi
            const transactionStatusResult = await getTransactionStatus(orderId) as MidtransNotification;
            
            // Tentukan status payment berdasarkan response Midtrans
            let paymentStatus: PaymentStatus = "pending";
            
            if (transactionStatus === "capture") {
                if (fraudStatus === "challenge") {
                    paymentStatus = "pending";
                } else if (fraudStatus === "accept") {
                    paymentStatus = "success";
                }
            } else if (transactionStatus === "settlement") {
                paymentStatus = "success";
            } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "failure") {
                paymentStatus = "failed";
            } else if (transactionStatus === "expire") {
                paymentStatus = "expired";
            } else if (transactionStatus === "refund") {
                paymentStatus = "refunded";
            }
            
            // Update status payment di database
            const updateData: UpdatePayment = {
                status: paymentStatus,
                metadata: {
                    midtransResponse: transactionStatusResult
                }
            };
            
            return await Payment.updateByOrderId(orderId, updateData);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to handle payment callback");
        }
    }
    
    async checkPaymentStatus(orderId: string): Promise<Result<Payments>> {
        try {
            // Cek apakah payment dengan orderId tersebut ada di database
            const existingPayment = await Payment.findByOrderId(orderId);
            
            if (!existingPayment.success || !existingPayment.data) {
                return {
                    success: false,
                    message: "Payment not found",
                    data: null
                };
            }
            
            try {
                // Cek status transaksi dari Midtrans
                const transactionStatus = await getTransactionStatus(orderId) as MidtransNotification;
                
                // Jika status transaksi adalah error atau not_found, kembalikan data yang ada
                if (transactionStatus.transaction_status === 'error' || 
                    transactionStatus.transaction_status === 'not_found') {
                    
                    // Untuk Snap, transaksi tidak ada sampai pengguna menyelesaikan pembayaran
                    // Jadi kita kembalikan status pending
                    return {
                        success: true,
                        message: "Payment is waiting for completion by user",
                        data: {
                            ...existingPayment.data,
                            status: "pending"
                        }
                    };
                }
                
                // Tentukan status payment berdasarkan response Midtrans
                let paymentStatus: PaymentStatus = "pending";
                
                if (transactionStatus.transaction_status === "capture" || 
                    transactionStatus.transaction_status === "settlement") {
                    paymentStatus = "success";
                } else if (transactionStatus.transaction_status === "cancel" || 
                           transactionStatus.transaction_status === "deny" || 
                           transactionStatus.transaction_status === "failure") {
                    paymentStatus = "failed";
                } else if (transactionStatus.transaction_status === "expire") {
                    paymentStatus = "expired";
                } else if (transactionStatus.transaction_status === "refund") {
                    paymentStatus = "refunded";
                }
                
                // Update status payment di database
                const updateData: UpdatePayment = {
                    status: paymentStatus,
                    metadata: {
                        midtransResponse: transactionStatus
                    }
                };
                
                return await Payment.updateByOrderId(orderId, updateData);
            } catch (error) {
                // Jika error dari Midtrans, log error dan kembalikan data yang ada
                console.error("Error checking payment with Midtrans:", error);
                
                // Untuk Snap, transaksi tidak ada sampai pengguna menyelesaikan pembayaran
                // Jadi kita kembalikan status pending dengan pesan yang lebih informatif
                return {
                    success: true,
                    message: "Payment is waiting for user to complete payment process",
                    data: {
                        ...existingPayment.data,
                        status: "pending"
                    }
                };
            }
        } catch (error) {
            console.error("Error in payment service:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to check payment status",
                data: null
            };
        }
    }
}

export const Service = new PaymentService();