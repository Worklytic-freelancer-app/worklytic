import { Repository as ProjectFeature } from "./projectfeature.repository";
import type { CreateProjectFeature, UpdateProjectFeature, ProjectFeatures } from "./projectfeature.schema";
import { 
    CreateProjectFeatureValidate, 
    UpdateProjectFeatureValidate 
} from "./projectfeature.schema";
import type { Result } from "./projectfeature.repository";
import { Service as ProjectDiscussionService } from "../ProjectDiscussions/projectdiscussion.service";
import { ProjectDiscussions } from "../ProjectDiscussions/projectdiscussion.schema";

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
        const validated = CreateProjectFeatureValidate.parse(data);
        return await ProjectFeature.create(validated);
    }
    
    async getAll(): Promise<ResultWithDiscussions<ProjectFeatureWithDiscussions[]>> {
        const result = await ProjectFeature.findAll();
        
        if (result.success && result.data) {
            // Ambil diskusi untuk setiap project feature
            const enhancedData = await Promise.all(result.data.map(async (feature) => {
                const discussionsResult = await ProjectDiscussionService.getByProjectFeatureId(feature._id.toString());
                return {
                    ...feature,
                    discussions: discussionsResult.data || []
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
            
            return {
                ...result,
                data: {
                    ...result.data,
                    discussions: discussionsResult.data || []
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

export const Service = new ProjectFeatureService();