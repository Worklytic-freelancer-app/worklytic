import { Repository as User } from "./user.repository";
import type { CreateUser, UpdateUser, Users } from "./user.schema";
import { 
    CreateUserValidate, 
    UpdateUserValidate 
} from "./user.schema";
import type { Result } from "./user.repository";
import { hashText, compareText } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";
import cloudinary from "../../config/cloudinary";

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

            console.log(email, password, "email, password");
            

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
            console.log(error);
            
            throw new Error(error instanceof Error ? error.message : "Failed to login");
        }
    }

    async updateProfileImage(id: string, imageData: string): Promise<Result<Users>> {
        try {
            // Tambahkan logging untuk debug
            console.log('Starting image upload to Cloudinary...');
            
            // Upload gambar ke Cloudinary dengan error handling yang lebih baik
            let uploadResult;
            try {
                uploadResult = await cloudinary.uploader.upload(imageData, {
                    folder: 'freelancer-app',
                    use_filename: true,
                    unique_filename: true,
                    overwrite: true,
                });
            } catch (cloudinaryError) {
                console.error('Cloudinary upload error:', cloudinaryError);
                throw new Error('Gagal mengupload gambar ke cloud storage');
            }

            if (!uploadResult || !uploadResult.secure_url) {
                throw new Error('Tidak mendapatkan URL gambar dari cloud storage');
            }

            console.log('Image uploaded successfully, updating user profile...');
            
            // Update profil user dengan URL gambar baru
            const result = await User.update(
                { id }, 
                { profileImage: uploadResult.secure_url }
            );
            
            if (!result.success || !result.data) {
                throw new Error('Gagal memperbarui data user di database');
            }
            
            return {
                success: true,
                message: "Gambar profil berhasil diperbarui",
                data: result.data
            };
        } catch (error) {
            console.error('Error in updateProfileImage:', error);
            throw new Error(
                error instanceof Error 
                    ? error.message 
                    : "Gagal memperbarui gambar profil"
            );
        }
    }
}

export const Service = new UserService();