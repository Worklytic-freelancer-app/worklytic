import { Repository as ProjectFeature } from "./projectfeature.repository";
import type { CreateProjectFeature, UpdateProjectFeature, ProjectFeatures } from "./projectfeature.schema";
import { 
    CreateProjectFeatureValidate, 
    UpdateProjectFeatureValidate 
} from "./projectfeature.schema";
import type { Result } from "./projectfeature.repository";
import { Service as ProjectDiscussionService } from "../ProjectDiscussions/projectdiscussion.service";
import { ProjectDiscussions } from "../ProjectDiscussions/projectdiscussion.schema";
import { Repository as ProjectRepository } from "../Projects/project.repository";

// Interface untuk ProjectFeature dengan discussions
interface ProjectFeatureWithDiscussions extends ProjectFeatures {
    discussions?: ProjectDiscussions[];
}

// Type untuk hasil dengan ProjectFeatureWithDiscussions
type ResultWithDiscussions<T> = Omit<Result<T>, 'data'> & {
    data: T | null;
};

class ProjectFeatureService {
    async create(data: CreateProjectFeature): Promise<Result<ProjectFeatures>> {
        try {
            // Validasi data
            const validated = CreateProjectFeatureValidate.parse(data);
            
            // Periksa apakah freelancer sudah melamar ke project ini
            const isUnique = await isFreelancerProjectUnique(
                validated.freelancerId.toString(), 
                validated.projectId.toString()
            );
            
            if (!isUnique) {
                return {
                    success: false,
                    message: "Freelancer already applied to this project",
                    data: null
                };
            }
            
            // Lanjutkan dengan pembuatan project feature
            return await ProjectFeature.create(validated);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to create project feature");
        }
    }
    
    async getAll(): Promise<ResultWithDiscussions<ProjectFeatureWithDiscussions[]>> {
        const result = await ProjectFeature.findAll();
        
        if (result.success && result.data) {
            // Ambil diskusi untuk setiap project feature
            const enhancedData = await Promise.all(result.data.map(async (feature) => {
                const discussionsResult = await ProjectDiscussionService.getByProjectFeatureId(feature._id.toString());
                const projectResult = await ProjectRepository.findById({ id: feature.projectId.toString() });
                return {
                    ...feature,
                    discussions: discussionsResult.data || [],
                    project: projectResult.data || null
                } as ProjectFeatureWithDiscussions;
            }));
            
            return {
                ...result,
                data: enhancedData
            };
        }
        
        return {
            ...result,
            data: null
        };
    }
    
    async getById(id: string): Promise<ResultWithDiscussions<ProjectFeatureWithDiscussions>> {
        const result = await ProjectFeature.findById({ id });
        
        if (result.success && result.data) {
            // Ambil diskusi untuk project feature ini
            const discussionsResult = await ProjectDiscussionService.getByProjectFeatureId(id);
            const projectResult = await ProjectRepository.findById({ id: result.data.projectId.toString() });
            
            return {
                ...result,
                data: {
                    ...result.data,
                    discussions: discussionsResult.data || [],
                    project: projectResult.data || null
                } as ProjectFeatureWithDiscussions
            };
        }
        
        return {
            ...result,
            data: null
        };
    }
    
    async update(id: string, data: UpdateProjectFeature): Promise<Result<ProjectFeatures>> {
        const validated = UpdateProjectFeatureValidate.parse(data);
        return await ProjectFeature.update({ id }, validated);
    }
    
    async delete(id: string): Promise<Result<ProjectFeatures>> {
        return await ProjectFeature.delete({ id });
    }

    async updateStatus(id: string, status: "pending" | "in progress" | "completed"): Promise<Result<ProjectFeatures>> {
        return await ProjectFeature.update({ id }, { status });
    }
}

// Fungsi helper di luar class
async function isFreelancerProjectUnique(freelancerId: string, projectId: string): Promise<boolean> {
    try {
        // Ambil semua project features
        const result = await ProjectFeature.findAll();
        
        if (!result.success || !result.data) {
            return true;
        }
        
        // Cek apakah ada project feature dengan freelancerId dan projectId yang sama
        const exists = result.data.some(feature => 
            feature.freelancerId.toString() === freelancerId && 
            feature.projectId.toString() === projectId
        );
        
        return !exists;
    } catch (error) {
        console.error("Error checking freelancer-project uniqueness:", error);
        return false;
    }
}

export const Service = new ProjectFeatureService();