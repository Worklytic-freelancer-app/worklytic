import { Repository as ProjectDiscussion } from "./projectdiscussion.repository";
import type { CreateProjectDiscussion, UpdateProjectDiscussion, ProjectDiscussions } from "./projectdiscussion.schema";
import { 
    CreateProjectDiscussionValidate, 
    UpdateProjectDiscussionValidate 
} from "./projectdiscussion.schema";
import type { Result } from "./projectdiscussion.repository";

class ProjectDiscussionService {
    async create(data: CreateProjectDiscussion): Promise<Result<ProjectDiscussions>> {
        const validated = CreateProjectDiscussionValidate.parse(data);
        return await ProjectDiscussion.create(validated);
    }
    
    async getAll(): Promise<Result<ProjectDiscussions[]>> {
        return await ProjectDiscussion.findAll();
    }
    
    async getById(id: string): Promise<Result<ProjectDiscussions>> {
        return await ProjectDiscussion.findById({ id });
    }
    
    async update(id: string, data: UpdateProjectDiscussion): Promise<Result<ProjectDiscussions>> {
        const validated = UpdateProjectDiscussionValidate.parse(data);
        return await ProjectDiscussion.update({ id }, validated);
    }
    
    async delete(id: string): Promise<Result<ProjectDiscussions>> {
        return await ProjectDiscussion.delete({ id });
    }
}

export const Service = new ProjectDiscussionService();