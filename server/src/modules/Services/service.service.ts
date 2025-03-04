import { Repository as ServiceRepository } from "./service.repository";
import type { CreateService, UpdateService, Services } from "./service.schema";
import { 
    CreateServiceValidate, 
    UpdateServiceValidate 
} from "./service.schema";
import type { Result } from "./service.repository";
import { ZodError } from "zod";
import { uploadMultipleToCloudinary } from "../../utils/upload";
import { Service as UserService } from "../Users/user.service";
import gemini from "@/config/gemini";

interface ServiceRecommendation {
    serviceId: string;
    title: string;
    matchPercentage: number;
    budget: number;
    category: string;
}   

class ServiceService {
    async create(data: CreateService): Promise<Result<Services>> {
        try {
            console.log("Validating service data:", JSON.stringify(data, null, 2));
            
            // Validasi data
            try {
                const validated = CreateServiceValidate.parse(data);
                console.log("Validation successful");
                
                // Upload gambar ke Cloudinary jika ada
                if (validated.images && validated.images.length > 0) {
                    console.log("Uploading service images...");
                    const uploadResult = await uploadMultipleToCloudinary(validated.images, {
                        folder: 'freelancer-app/services'
                    });
                    
                    // Update data dengan URL gambar dari Cloudinary
                    validated.images = uploadResult.urls;
                }
                
                return await ServiceRepository.create(validated);
            } catch (validationError) {
                if (validationError instanceof ZodError) {
                    console.error("Validation error:", validationError.errors);
                    const errorMessage = validationError.errors.map(err => 
                        `${err.path.join('.')}: ${err.message}`
                    ).join(', ');
                    throw new Error(`Validation error: ${errorMessage}`);
                }
                throw validationError;
            }
        } catch (error) {
            console.error("Service creation error:", error);
            throw error;
        }
    }
    
    async getAll(): Promise<Result<Services[]>> {
        return await ServiceRepository.findAll();
    }

    async getByFreelancerId(freelancerId: string): Promise<Result<Services>> {
        return await ServiceRepository.findByFreelancerId({ freelancerId });
    }
    
    async getById(id: string): Promise<Result<Services>> {
        return await ServiceRepository.findById({ id });
    }
    
    async update(id: string, data: UpdateService): Promise<Result<Services>> {
        try {
            const validated = UpdateServiceValidate.parse(data);
            
            // Upload gambar ke Cloudinary jika ada gambar baru
            if (validated.images && validated.images.length > 0) {
                // Filter gambar yang perlu diupload (yang belum memiliki URL http/https)
                const imagesToUpload = validated.images.filter(img => 
                    !img.startsWith('http://') && !img.startsWith('https://')
                );
                
                if (imagesToUpload.length > 0) {
                    console.log(`Uploading ${imagesToUpload.length} new service images...`);
                    const uploadResult = await uploadMultipleToCloudinary(imagesToUpload, {
                        folder: 'freelancer-app/services'
                    });
                    
                    // Ganti gambar yang perlu diupload dengan URL dari Cloudinary
                    // sambil mempertahankan gambar yang sudah memiliki URL
                    let uploadedIndex = 0;
                    validated.images = validated.images.map(img => {
                        if (!img.startsWith('http://') && !img.startsWith('https://')) {
                            return uploadResult.urls[uploadedIndex++];
                        }
                        return img;
                    });
                }
            }
            
            return await ServiceRepository.update({ id }, validated);
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.errors.map(err => 
                    `${err.path.join('.')}: ${err.message}`
                ).join(', ');
                throw new Error(`Validation error: ${errorMessage}`);
            }
            throw error;
        }
    }
    
    async delete(id: string): Promise<Result<Services>> {
        return await ServiceRepository.delete({ id });
    }

    async getRecommendationsByAi(id: string): Promise<Result<ServiceRecommendation[]>> {
        try {
            const user = await UserService.getById(id);
            if (!user.success || !user.data) {
                throw new Error("User not found");
            }
            const services = await ServiceRepository.findAll();
            const prompt = `
            You are a freelancer expert.
            You are given a user profile and you need to recommend services that are most relevant to the user profile.
            User profile: ${JSON.stringify(user.data)}
            Services: ${JSON.stringify(services.data)}

            Jangan bungkus dengan JSON Array, hanya kirim dalam bentuk string biasa saja!!!
            Create without \`\`\` json and \`\`\` text, just send with string only!!!
            Bungkus semua dalam string atau teks biasa seperti ini "[{inidatanya}]" dan bentuknya tanpa new line semua, contoh: "[{ini data project}]"
            !!! Kirim dalam bentuk JSON Array !!! Warning !!! Wajib mengirim dalam bentuk JSON Array !!!
            [
              {
                serviceId: "string -> {ini pakai service ID yg sesuai dengan data service}",
                title: "string -> {ini pakai title yg sesuai dengan data service}",
                matchPercentage: "number -> {ini tidak ada pada data service ataupun user, jadi kamu harus menghitungnya sendiri, contoh: 95%}",
                budget: "number -> {ini pakai budget yg sesuai dengan data service}",
                category: "string -> {ini pakai category yg sesuai dengan data service}",
                include: "array -> {ini pakai include yg sesuai dengan data project user / pikir sendiri yang sesuai dengan title dan kategory}",
                image: "array -> {ini pakai image yg sesuai dengan data service}"
              }
            ]`;

            const response = await gemini(prompt) as ServiceRecommendation[];
            console.log(response, "response");
            
            return {
                success: true,
                data: response
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to get service recommendations");
        }
    }



}

export const Service = new ServiceService();