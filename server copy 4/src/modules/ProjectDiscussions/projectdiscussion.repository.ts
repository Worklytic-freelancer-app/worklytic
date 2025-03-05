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
            const docs = await collection.aggregate([
                {
                    $lookup: {
                        from: "Users",
                        localField: "senderId",
                        foreignField: "_id",
                        as: "sender"
                    }
                },
                {
                    $unwind: {
                        path: "$sender",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        sender: { $ifNull: ["$sender", {}] }
                    }
                }
            ]).toArray();
                
            return {
                success: true,
                data: docs as ProjectDiscussions[]
            };
        } catch (error) {
            console.log(error)
            throw new Error("Failed to fetch projectdiscussions");
        }
    };

    findById = async ({ id }: ProjectDiscussionId): Promise<Result<ProjectDiscussions>> => {
        try {
            const collection = await this.getCollection();
            const [doc] = await collection.aggregate([
                {
                    $match: { _id: new ObjectId(id) }
                },
                {
                    $lookup: {
                        from: "Users",
                        localField: "senderId",
                        foreignField: "_id",
                        as: "sender"
                    }
                },
                {
                    $unwind: {
                        path: "$sender",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        sender: { $ifNull: ["$sender", {}] }
                    }
                }
            ]).toArray();
                
            if (!doc) {
                throw new Error("ProjectDiscussion not found");
            }
            
            return {
                success: true,
                data: doc as ProjectDiscussions
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
            
            // Ambil data dengan sender
            const [updatedDoc] = await collection.aggregate([
                {
                    $match: { _id: new ObjectId(id) }
                },
                {
                    $lookup: {
                        from: "Users",
                        localField: "senderId",
                        foreignField: "_id",
                        as: "sender"
                    }
                },
                {
                    $unwind: {
                        path: "$sender",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        sender: { $ifNull: ["$sender", []] }
                    }
                }
            ]).toArray();
            
            return {
                success: true,
                message: "ProjectDiscussion updated successfully",
                data: updatedDoc as ProjectDiscussions
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to update projectdiscussion");
        }
    };

    delete = async ({ id }: ProjectDiscussionId): Promise<Result<ProjectDiscussions>> => {
        try {
            const collection = await this.getCollection();
            const [doc] = await collection.aggregate([
                {
                    $match: { _id: new ObjectId(id) }
                },
                {
                    $lookup: {
                        from: "Users",
                        localField: "senderId",
                        foreignField: "_id",
                        as: "sender"
                    }
                },
                {
                    $unwind: {
                        path: "$sender",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        sender: { $ifNull: ["$sender", []] }
                    }
                }
            ]).toArray();
                
            if (!doc) {
                throw new Error("ProjectDiscussion not found");
            }

            await collection.deleteOne({ _id: new ObjectId(id) });
            
            return {
                success: true,
                message: "ProjectDiscussion deleted successfully",
                data: doc as ProjectDiscussions
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to delete projectdiscussion");
        }
    };

    findByProjectFeatureId = async (projectFeatureId: string): Promise<Result<ProjectDiscussions[]>> => {
        try {
            const collection = await this.getCollection();
            const docs = await collection.aggregate([
                {
                    $match: { projectFeatureId: new ObjectId(projectFeatureId) }
                },
                {
                    $lookup: {
                        from: "Users",
                        localField: "senderId",
                        foreignField: "_id",
                        as: "sender"
                    }
                },
                {
                    $unwind: {
                        path: "$sender",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        sender: { $ifNull: ["$sender", {}] }
                    }
                },
                {
                    $sort: { createdAt: -1 } // Urutkan dari yang terbaru
                }
            ]).toArray();
                
            return {
                success: true,
                data: docs as ProjectDiscussions[]
            };
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch discussions for this project feature");
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