import { Repository as User } from "./user.repository";
import type { CreateUser, UpdateUser, Users } from "./user.schema";
import { 
    CreateUserValidate, 
    UpdateUserValidate 
} from "./user.schema";
import type { Result } from "./user.repository";
import { hashText, compareText } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";
import { uploadToCloudinary } from "../../utils/upload";
import { resend, logEmailSending, logEmailSuccess, logEmailError, EmailResponse } from "../../config/resend";

class UserService {
    async create(data: CreateUser): Promise<Result<Users>> {
        const validated = CreateUserValidate.parse(data);
        return await User.create(validated);
    }
    
    async getAll(): Promise<Result<Users[]>> {
        return await User.findAll();
    }
    
    async getById(id: string): Promise<Result<Users>> {
        return await User.findById({ id });
    }
    
    async update(id: string, data: UpdateUser): Promise<Result<Users>> {
        const validated = UpdateUserValidate.parse(data);
        return await User.update({ id }, validated);
    }
    
    async delete(id: string): Promise<Result<Users>> {
        return await User.delete({ id });
    }

    async signUp(data: CreateUser): Promise<Result<{ user: Users; token: string }>> {
        try {
            const hashedPassword = hashText(data.password);
            const validated = CreateUserValidate.parse({
                ...data,
                password: hashedPassword,
            });
            
            const result = await User.create(validated);

            // console.log(result, "result");
            
            if (!result.data) {
                throw new Error("Failed to create user");
            }

            const token = generateToken({
                id: result.data._id.toString(),
                email: result.data.email,
                User: result.data,
            });

            return {
                success: true,
                message: "User registered successfully",
                data: {
                    user: result.data,
                    token,
                },
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to register user");
        }
    }

    async signIn(email: string, password: string): Promise<Result<{ user: Users; token: string }>> {
        try {
            const result = await User.findByEmail(email);
            
            if (!result.data) {
                throw new Error("Invalid email or password");
            }

            const isPasswordValid = compareText(password, result.data.password);
            
            if (!isPasswordValid) {
                throw new Error("Invalid email or password");
            }

            const token = generateToken({
                id: result.data._id.toString(),
                email: result.data.email,
                User: result.data,
            });

            return {
                success: true,
                message: "Login successful",
                data: {
                    user: result.data,
                    token,
                },
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to login");
        }
    }

    async updateProfileImage(id: string, imageData: string): Promise<Result<Users>> {
        try {
            // Upload gambar ke Cloudinary menggunakan utility function
            const uploadResult = await uploadToCloudinary(imageData, {
                folder: 'freelancer-app/profile-images'
            });
            
            // Update profil user dengan URL gambar baru
            const result = await User.update({ id }, { profileImage: uploadResult.url });
            
            if (!result.data) {
                throw new Error("Gagal memperbarui gambar profil");
            }
            
            return {
                success: true,
                message: "Gambar profil berhasil diperbarui",
                data: result.data
            };
        } catch (error) {
            throw new Error(
                error instanceof Error 
                    ? error.message 
                    : "Gagal memperbarui gambar profil"
            );
        }
    }

    async updateBalance(id: string, balance: number): Promise<Result<Users>> {
        try {
            const currentBalance = await User.findById({ id });
            if (!currentBalance.data) {
                throw new Error("User not found");
            }

            const currentTotalProjects = await User.findById({ id });
            if (!currentTotalProjects.data) {
                throw new Error("User not found");
            }
            
            const result = await User.update({ id }, { 
                balance: currentBalance.data.balance + balance, 
                totalProjects: currentTotalProjects.data.totalProjects + 1 
            });
            
            // Kirim email notifikasi pembayaran
            if (result.success && result.data?.email) {
                try {
                    await this.sendPaymentNotificationEmail(
                        result.data.email,
                        result.data.fullName || 'Freelancer',
                        balance
                    );
                } catch (emailError) {
                    console.error('Failed to send email notification:', emailError);
                    // Tidak menghentikan proses jika pengiriman email gagal
                }
            }
            
            return result;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to update balance");
        }
    }
    
    private async sendPaymentNotificationEmail(email: string, name: string, amount: number): Promise<void> {
        try {
            const formattedAmount = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
            
            // Logging menggunakan helper function
            logEmailSending(email, name, amount, formattedAmount);
            
            const currentDate = new Date();
            const estimatedPaymentDate = new Date();
            estimatedPaymentDate.setDate(currentDate.getDate() + 7); // 7 hari kerja
            
            const formattedEstimatedDate = estimatedPaymentDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const response = await resend.emails.send({
                from: 'Worklytic <notification@robbysuganda.tech>',
                to: email,
                subject: `Pembayaran ${formattedAmount} Sedang Diproses`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #0891b2; margin-bottom: 5px;">Worklytic</h1>
                            <p style="color: #666; font-size: 14px;">Platform Freelance Terbaik di Indonesia</p>
                        </div>
                        
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                            <h2 style="color: #333; margin-top: 0;">Halo ${name},</h2>
                            <p style="color: #555; line-height: 1.5;">
                                Kami senang memberitahukan bahwa pembayaran sebesar <strong style="color: #0891b2;">${formattedAmount}</strong> sedang diproses ke akun Anda!
                            </p>
                            <p style="color: #555; line-height: 1.5;">
                                Dana akan ditransfer ke akun bank yang telah Anda daftarkan dalam waktu <strong>7 hari kerja</strong>, paling lambat pada tanggal <strong>${formattedEstimatedDate}</strong>.
                            </p>
                        </div>
                        
                        <div style="border-left: 4px solid #fbbf24; padding-left: 15px; margin-bottom: 25px;">
                            <h3 style="color: #333; margin-top: 0;">Detail Pembayaran:</h3>
                            <p style="color: #555; line-height: 1.5; margin: 5px 0;">
                                <strong>Jumlah:</strong> ${formattedAmount}
                            </p>
                            <p style="color: #555; line-height: 1.5; margin: 5px 0;">
                                <strong>Status:</strong> Sedang Diproses
                            </p>
                            <p style="color: #555; line-height: 1.5; margin: 5px 0;">
                                <strong>Estimasi Waktu:</strong> 7 Hari Kerja
                            </p>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <p style="color: #555; line-height: 1.5;">
                                Anda dapat memeriksa saldo dan riwayat transaksi Anda melalui dashboard Worklytic kapan saja.
                            </p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="https://worklytic.com/dashboard" style="background-color: #0891b2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Lihat Dashboard Saya</a>
                            </div>
                        </div>
                        
                        <div style="background-color: #f0f9ff; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                            <p style="color: #555; line-height: 1.5; margin: 0;">
                                <strong>Perlu bantuan?</strong> Jika Anda memiliki pertanyaan atau masalah terkait pembayaran ini, jangan ragu untuk menghubungi tim dukungan kami di <a href="mailto:support@worklytic.com" style="color: #0891b2; text-decoration: none;">support@worklytic.com</a> atau melalui live chat di aplikasi Worklytic.
                            </p>
                        </div>
                        
                        <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px; color: #888; font-size: 12px;">
                            <p>Terima kasih telah menggunakan Worklytic!</p>
                            <p>© ${new Date().getFullYear()} Worklytic. Semua Hak Dilindungi.</p>
                            <div style="margin-top: 10px;">
                                <a href="https://worklytic.com/terms" style="color: #0891b2; text-decoration: none; margin: 0 10px;">Syarat & Ketentuan</a>
                                <a href="https://worklytic.com/privacy" style="color: #0891b2; text-decoration: none; margin: 0 10px;">Kebijakan Privasi</a>
                            </div>
                        </div>
                    </div>
                `
            });
            
            // Logging sukses menggunakan helper function
            logEmailSuccess(response as unknown as EmailResponse);
            
        } catch (error) {
            // Logging error menggunakan helper function
            logEmailError(email, error as Error);
            throw error;
        }
    }
}

export const Service = new UserService();