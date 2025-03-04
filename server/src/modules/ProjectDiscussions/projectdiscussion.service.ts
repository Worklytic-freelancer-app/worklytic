import { Repository as ProjectDiscussion } from "./projectdiscussion.repository";
import type { CreateProjectDiscussion, UpdateProjectDiscussion, ProjectDiscussions } from "./projectdiscussion.schema";
import { 
    CreateProjectDiscussionValidate, 
    UpdateProjectDiscussionValidate 
} from "./projectdiscussion.schema";
import type { Result } from "./projectdiscussion.repository";
import { ZodError } from "zod";
import { uploadMultipleToCloudinary } from "../../utils/upload";

class ProjectDiscussionService {
    async create(data: CreateProjectDiscussion): Promise<Result<ProjectDiscussions>> {
        try {
            console.log("Validating project discussion data:", JSON.stringify(data, null, 2));
            
            // Validasi data
            const validated = CreateProjectDiscussionValidate.parse(data);
            console.log("Validation successful");
            
            // Upload gambar ke Cloudinary jika ada
            if (validated.images && validated.images.length > 0) {
                console.log("Uploading discussion images...");
                const uploadResult = await uploadMultipleToCloudinary(validated.images, {
                    folder: 'freelancer-app/discussions/images'
                });
                
                // Update data dengan URL gambar dari Cloudinary
                validated.images = uploadResult.urls;
            }
            
            // Upload file ke Cloudinary jika ada
            if (validated.files && validated.files.length > 0) {
                console.log("Uploading discussion files...");
                const uploadResult = await uploadMultipleToCloudinary(validated.files, {
                    folder: 'freelancer-app/discussions/files'
                });
                
                // Update data dengan URL file dari Cloudinary
                validated.files = uploadResult.urls;
            }
            
            return await ProjectDiscussion.create(validated);
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.errors.map(err => 
                    `${err.path.join('.')}: ${err.message}`
                ).join(', ');
                throw new Error(`Validation error: ${errorMessage}`);
            }
            console.error("Project discussion creation error:", error);
            throw error;
        }
    }
    
    async getAll(): Promise<Result<ProjectDiscussions[]>> {
        return await ProjectDiscussion.findAll();
    }
    
    async getById(id: string): Promise<Result<ProjectDiscussions>> {
        return await ProjectDiscussion.findById({ id });
    }
    
    async update(id: string, data: UpdateProjectDiscussion): Promise<Result<ProjectDiscussions>> {
        try {
            const validated = UpdateProjectDiscussionValidate.parse(data);
            
            // Upload gambar ke Cloudinary jika ada gambar baru
            if (validated.images && validated.images.length > 0) {
                // Filter gambar yang perlu diupload (yang belum memiliki URL http/https)
                const imagesToUpload = validated.images.filter(img => 
                    !img.startsWith('http://') && !img.startsWith('https://')
                );
                
                if (imagesToUpload.length > 0) {
                    console.log(`Uploading ${imagesToUpload.length} new discussion images...`);
                    const uploadResult = await uploadMultipleToCloudinary(imagesToUpload, {
                        folder: 'freelancer-app/discussions/images'
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
            
            // Upload file ke Cloudinary jika ada file baru
            if (validated.files && validated.files.length > 0) {
                // Filter file yang perlu diupload (yang belum memiliki URL http/https)
                const filesToUpload = validated.files.filter(file => 
                    !file.startsWith('http://') && !file.startsWith('https://')
                );
                
                if (filesToUpload.length > 0) {
                    console.log(`Uploading ${filesToUpload.length} new discussion files...`);
                    const uploadResult = await uploadMultipleToCloudinary(filesToUpload, {
                        folder: 'freelancer-app/discussions/files'
                    });
                    
                    // Ganti file yang perlu diupload dengan URL dari Cloudinary
                    // sambil mempertahankan file yang sudah memiliki URL
                    let uploadedIndex = 0;
                    validated.files = validated.files.map(file => {
                        if (!file.startsWith('http://') && !file.startsWith('https://')) {
                            return uploadResult.urls[uploadedIndex++];
                        }
                        return file;
                    });
                }
            }
            
            return await ProjectDiscussion.update({ id }, validated);
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
    
    async delete(id: string): Promise<Result<ProjectDiscussions>> {
        return await ProjectDiscussion.delete({ id });
    }

    async getByProjectFeatureId(projectFeatureId: string): Promise<Result<ProjectDiscussions[]>> {
        return await ProjectDiscussion.findByProjectFeatureId(projectFeatureId);
    }
}

export const Service = new ProjectDiscussionService();