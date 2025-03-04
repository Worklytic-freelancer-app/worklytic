import { Repository as Project } from "./project.repository";
import type { CreateProject, UpdateProject, Projects } from "./project.schema";
import { 
    CreateProjectValidate, 
    UpdateProjectValidate 
} from "./project.schema";
import type { Result } from "./project.repository";
import { ZodError } from "zod";
import { uploadMultipleToCloudinary } from "../../utils/upload";
// import { Service as UserService } from "../Users/user.service";

class ProjectService {
    async create(data: CreateProject): Promise<Result<Projects>> {
        try {
            console.log("Validating project data:", JSON.stringify(data, null, 2));
            
            // Validasi data
            const validated = CreateProjectValidate.parse(data);
            console.log("Validation successful");
            
            // Upload gambar ke Cloudinary jika ada
            if (validated.image && validated.image.length > 0) {
                console.log("Uploading project images...");
                const uploadResult = await uploadMultipleToCloudinary(validated.image, {
                    folder: 'freelancer-app/projects'
                });
                
                // Update data dengan URL gambar dari Cloudinary
                validated.image = uploadResult.urls;
            }
            
            return await Project.create(validated);
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.errors.map(err => 
                    `${err.path.join('.')}: ${err.message}`
                ).join(', ');
                throw new Error(`Validation error: ${errorMessage}`);
            }
            console.error("Project creation error:", error);
            throw error;
        }
    }
    
    async getAll(): Promise<Result<Projects[]>> {
        return await Project.findAll();
    }
    
    async getById(id: string): Promise<Result<Projects>> {
        return await Project.findById({ id });
    }
    
    async update(id: string, data: UpdateProject): Promise<Result<Projects>> {
        try {
            const validated = UpdateProjectValidate.parse(data);
            
            // Upload gambar ke Cloudinary jika ada gambar baru
            if (validated.image && validated.image.length > 0) {
                // Filter gambar yang perlu diupload (yang belum memiliki URL http/https)
                const imagesToUpload = validated.image.filter(img => 
                    !img.startsWith('http://') && !img.startsWith('https://')
                );
                
                if (imagesToUpload.length > 0) {
                    console.log(`Uploading ${imagesToUpload.length} new project images...`);
                    const uploadResult = await uploadMultipleToCloudinary(imagesToUpload, {
                        folder: 'freelancer-app/projects'
                    });
                    
                    // Ganti gambar yang perlu diupload dengan URL dari Cloudinary
                    // sambil mempertahankan gambar yang sudah memiliki URL
                    let uploadedIndex = 0;
                    validated.image = validated.image.map(img => {
                        if (!img.startsWith('http://') && !img.startsWith('https://')) {
                            return uploadResult.urls[uploadedIndex++];
                        }
                        return img;
                    });
                }
            }
            
            return await Project.update({ id }, validated);
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
    
    async delete(id: string): Promise<Result<Projects>> {
        return await Project.delete({ id });
    }
    
    async getRecommendationsBySkills(skills: string[]): Promise<Result<Projects[]>> {
        try {
            const projects = await Project.findAll();
            
            if (!projects.data) {
                return {
                    success: true,
                    data: []
                };
            }

            // console.log(projects.data, "projects");
            console.log(skills, "skills");

            // Filter proyek yang sesuai dengan skills dan urutkan berdasarkan budget tertinggi
            const recommendedProjects = projects.data
                .filter(project => {
                    // Cek apakah kategori proyek cocok dengan salah satu skill
                    return skills.some(skill => 
                        project.category.toLowerCase().includes(skill.toLowerCase())
                    );
                })
                .sort((a, b) => b.budget - a.budget);

            return {
                success: true,
                data: recommendedProjects
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to get project recommendations");
        }
    }
}

export const Service = new ProjectService();

async function test() {
    try {
        const projects = await Service.getRecommendationsBySkills(["react", "nodejs", "typescript", "mongodb", "express"]);
        console.log(projects);
    } catch (error) {
        console.log(error);
    }
}

test();