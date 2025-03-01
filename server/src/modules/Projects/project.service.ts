import { Repository as Project } from "./project.repository";
import type { CreateProject, UpdateProject, Projects } from "./project.schema";
import { 
    CreateProjectValidate, 
    UpdateProjectValidate 
} from "./project.schema";
import type { Result } from "./project.repository";
import { Repository as User } from "../Users/user.repository";
// import { Service as UserService } from "../Users/user.service";

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
    
    async getRecommendationsBySkills(skills: string[]): Promise<Result<Projects[]>> {
        try {
            const projects = await Project.findAll();
            
            if (!projects.data) {
                return {
                    success: true,
                    data: []
                };
            }

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
    async applyProject(projectId: string, freelancerId: string): Promise<Result<Projects>> {
        try {
            // Dapatkan informasi freelancer menggunakan User Repository
            const freelancerResult = await User.findById({ id: freelancerId });
            if (!freelancerResult.data) {
                throw new Error("Freelancer not found");
            }

            // Dapatkan project yang akan diupdate
            const project = await Project.findById({ id: projectId });
            if (!project.data) {
                throw new Error("Project not found");
            }

            // Update project menggunakan method update yang sudah ada
            const updatedProject = await Project.update(
                { id: projectId },
                {
                    assignedFreelancer: [
                        ...(project.data.assignedFreelancer || []),
                        freelancerResult.data
                    ]
                }
            );

            return {
                success: true,
                message: "Project applied successfully",
                data: updatedProject.data
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to apply project");
        }
    }
}

export const Service = new ProjectService();

// async function test() {
//     try {
//         const projects = await Service.getRecommendationsBySkills(["react", "nodejs", "typescript", "mongodb", "express"]);
//         console.log(projects);
//     } catch (error) {
//         console.log(error);
//     }
// }

// test();