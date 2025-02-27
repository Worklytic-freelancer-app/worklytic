import { Repository as ProjectFeature } from "./projectfeature.repository";
import type { CreateProjectFeature, UpdateProjectFeature, ProjectFeatures } from "./projectfeature.schema";
import { 
    CreateProjectFeatureValidate, 
    UpdateProjectFeatureValidate 
} from "./projectfeature.schema";
import type { Result } from "./projectfeature.repository";

class ProjectFeatureService {
    async create(data: CreateProjectFeature): Promise<Result<ProjectFeatures>> {
        const validated = CreateProjectFeatureValidate.parse(data);
        return await ProjectFeature.create(validated);
    }
    
    async getAll(): Promise<Result<ProjectFeatures[]>> {
        return await ProjectFeature.findAll();
    }
    
    async getById(id: string): Promise<Result<ProjectFeatures>> {
        return await ProjectFeature.findById({ id });
    }
    
    async update(id: string, data: UpdateProjectFeature): Promise<Result<ProjectFeatures>> {
        const validated = UpdateProjectFeatureValidate.parse(data);
        return await ProjectFeature.update({ id }, validated);
    }
    
    async delete(id: string): Promise<Result<ProjectFeatures>> {
        return await ProjectFeature.delete({ id });
    }
}

export const Service = new ProjectFeatureService();