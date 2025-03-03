import { ObjectId } from "mongodb";
import { db } from "../../config";
import type { CreateProjectDiscussion, UpdateProjectDiscussion, ProjectDiscussions, ProjectDiscussionId } from "./projectdiscussion.schema";
import { ProjectDiscussion } from "./projectdiscussion.schema";

export type Result<T> = {
    success: boolean;
    message?: string;
    data: T | null;
    error?: unknown;
};

export class ProjectDiscussionRepository {
    private readonly collection = "ProjectDiscussions";
    
    private getCollection = async () => {
        return db.collection(this.collection);
    };
    
    create = async (data: CreateProjectDiscussion): Promise<Result<ProjectDiscussions>> => {
        try {
            const doc = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            } as const;
            
            const collection = await this.getCollection();
            const result = await collection.insertOne(doc);
            
            if (!result.acknowledged) {
                throw new Error("Failed to create projectdiscussion");
            }
            
            return {
                success: true,
                message: "ProjectDiscussion created successfully",
                data: new ProjectDiscussion({ ...doc, _id: result.insertedId }) as ProjectDiscussions
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to create projectdiscussion");
        }
    };

    findAll = async (): Promise<Result<ProjectDiscussions[]>> => {
        try {
            const collection = await this.getCollection();
            const docs = await collection
                .find({})
                .toArray() as ProjectDiscussions[];
                
            return {
                success: true,
                data: docs.map(doc => new ProjectDiscussion(doc) as ProjectDiscussions)
            };
        } catch (error) {
            console.log(error)
            throw new Error("Failed to fetch projectdiscussions");
        }
    };

    findById = async ({ id }: ProjectDiscussionId): Promise<Result<ProjectDiscussions>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) }) as ProjectDiscussions | null;
                
            if (!doc) {
                throw new Error("ProjectDiscussion not found");
            }
            
            return {
                success: true,
                data: new ProjectDiscussion(doc) as ProjectDiscussions
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to find projectdiscussion");
        }
    };

    update = async ({ id }: ProjectDiscussionId, data: UpdateProjectDiscussion): Promise<Result<ProjectDiscussions>> => {
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
                throw new Error("ProjectDiscussion not found");
            }
            
            return {
                success: true,
                message: "ProjectDiscussion updated successfully",
                data: new ProjectDiscussion(result) as ProjectDiscussions
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to update projectdiscussion");
        }
    };

    delete = async ({ id }: ProjectDiscussionId): Promise<Result<ProjectDiscussions>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) });
                
            if (!doc) {
                throw new Error("ProjectDiscussion not found");
            }

            await collection.deleteOne({ _id: new ObjectId(id) });
            
            return {
                success: true,
                message: "ProjectDiscussion deleted successfully",
                data: new ProjectDiscussion(doc) as ProjectDiscussions
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to delete projectdiscussion");
        }
    };
}

// ! -- CUSTOM METHODS --
// You can add custom methods or business logic below this line
// For example: 
// export class CustomProjectDiscussionRepository extends ProjectDiscussionRepository {
//     customMethod = async () => {
//         // Your custom logic here
//     }
// }

export const Repository = new ProjectDiscussionRepository()