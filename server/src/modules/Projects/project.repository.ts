import { ObjectId } from "mongodb";
import { db } from "../../config";
import type { CreateProject, UpdateProject, Projects, ProjectId } from "./project.schema";
import { Project } from "./project.schema";

export type Result<T> = {
    success: boolean;
    message?: string;
    data: T | null;
    error?: unknown;
};

export class ProjectRepository {
    private readonly collection = "Projects";
    
    private getCollection = async () => {
        return db.collection(this.collection);
    };
    
    create = async (data: CreateProject): Promise<Result<Projects>> => {
        try {
            const doc = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            } as const;
            
            const collection = await this.getCollection();
            const result = await collection.insertOne(doc);
            
            if (!result.acknowledged) {
                throw new Error("Failed to create project");
            }
            
            return {
                success: true,
                message: "Project created successfully",
                data: new Project({ ...doc, _id: result.insertedId }) as Projects
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to create project");
        }
    };

    findAll = async (): Promise<Result<Projects[]>> => {
        try {
            const collection = await this.getCollection();
            
            // Ambil projects terlebih dahulu
            const projects = await collection.find({}).toArray() as Projects[];
            
            // Kumpulkan semua clientId yang unik
            const clientIds = [...new Set(projects.map(p => p.clientId.toString()))];
            
            // Ambil users berdasarkan clientIds
            const userCollection = db.collection("Users");
            const users = await userCollection.find({
                _id: { $in: clientIds.map(id => new ObjectId(id)) }
            }).toArray();
            
            // Buat map untuk lookup cepat
            const userMap = new Map();
            users.forEach(user => {
                userMap.set(user._id.toString(), user);
            });
            
            console.log(`Found ${users.length} users for ${clientIds.length} unique clientIds`);
            
            // Gabungkan project dengan user
            const result = projects.map(project => {
                const clientIdStr = project.clientId.toString();
                const client = userMap.get(clientIdStr);
                return {
                    ...project,
                    client: client || null
                } as Projects;
            });
                
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.log(error)
            throw new Error("Failed to fetch projects");
        }
    };

    findById = async ({ id }: ProjectId): Promise<Result<Projects>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) }) as Projects | null;
                
            if (!doc) {
                throw new Error("Project not found");
            }
            
            return {
                success: true,
                data: new Project(doc) as Projects
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to find project");
        }
    };

    update = async ({ id }: ProjectId, data: UpdateProject): Promise<Result<Projects>> => {
        try {
            const collection = await this.getCollection();
            const result = await collection
                .findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { 
                        $set: {
                            ...data,
                            updatedAt: new Date()
                        }
                    },
                    { returnDocument: 'after' }
                );
            
            if (!result) {
                throw new Error("Project not found");
            }
            
            return {
                success: true,
                message: "Project updated successfully",
                data: new Project(result) as Projects
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to update project");
        }
    };

    delete = async ({ id }: ProjectId): Promise<Result<Projects>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) });
                
            if (!doc) {
                throw new Error("Project not found");
            }

            await collection.deleteOne({ _id: new ObjectId(id) });
            
            return {
                success: true,
                message: "Project deleted successfully",
                data: new Project(doc) as Projects
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to delete project");
        }
    };
}

// ! -- CUSTOM METHODS --
// You can add custom methods or business logic below this line
// For example: 
// export class CustomProjectRepository extends ProjectRepository {
//     customMethod = async () => {
//         // Your custom logic here
//     }
// }

export const Repository = new ProjectRepository()