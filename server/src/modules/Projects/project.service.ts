import { Repository as Project } from "./project.repository";
import type { CreateProject, UpdateProject, Projects } from "./project.schema";
import { 
    CreateProjectValidate, 
    UpdateProjectValidate 
} from "./project.schema";
import type { Result } from "./project.repository";

class ProjectService {
    async create(data: CreateProject): Promise<Result<Projects>> {
        const validated = CreateProjectValidate.parse(data);
        return await Project.create(validated);
    }
    
    async getAll(): Promise<Result<Projects[]>> {
        return await Project.findAll();
    }
    
    async getById(id: string): Promise<Result<Projects>> {
        return await Project.findById({ id });
    }
    
    async update(id: string, data: UpdateProject): Promise<Result<Projects>> {
        const validated = UpdateProjectValidate.parse(data);
        return await Project.update({ id }, validated);
    }
    
    async delete(id: string): Promise<Result<Projects>> {
        return await Project.delete({ id });
    }
}

export const Service = new ProjectService();