import { Resend } from 'resend';

export interface EmailResponse {
    id: string;
    status: string;
    message: string;
    createdAt: string;
    updatedAt: string;
}

// Inisialisasi Resend dengan API key
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

// Helper function untuk logging
const logEmailSending = (email: string, name: string, amount: number, formattedAmount: string): void => {
    console.log(`🚀 Memulai proses pengiriman email ke: ${email} untuk pembayaran sebesar ${amount}`);
    console.log(`📧 Mengirim email notifikasi pembayaran kepada ${name} (${email}) dengan jumlah ${formattedAmount}`);
};

const logEmailSuccess = (response: EmailResponse): void => {
    console.log(`✅ Email berhasil dikirim!`);
    console.log(`📊 Detail respons dari Resend:`, JSON.stringify(response));
};

const logEmailError = (email: string, error: Error): void => {
    console.error(`❌ Gagal mengirim email ke ${email}:`, error);
};

export {
    resend,
    logEmailSending,
    logEmailSuccess,
    logEmailError
};