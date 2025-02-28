import { ObjectId } from "mongodb";
import { db } from "../../config";
import type { CreateProjectFeature, UpdateProjectFeature, ProjectFeatures, ProjectFeatureId } from "./projectfeature.schema";
import { ProjectFeature } from "./projectfeature.schema";

export type Result<T> = {
    success: boolean;
    message?: string;
    data: T | null;
    error?: unknown;
};

export class ProjectFeatureRepository {
    private readonly collection = "ProjectFeatures";
    
    private getCollection = async () => {
        return db.collection(this.collection);
    };
    
    create = async (data: CreateProjectFeature): Promise<Result<ProjectFeatures>> => {
        try {
            const doc = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            } as const;
            
            const collection = await this.getCollection();
            const result = await collection.insertOne(doc);
            
            if (!result.acknowledged) {
                throw new Error("Failed to create projectfeature");
            }
            
            return {
                success: true,
                message: "ProjectFeature created successfully",
                data: new ProjectFeature({ ...doc, _id: result.insertedId }) as ProjectFeatures
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to create projectfeature");
        }
    };

    findAll = async (): Promise<Result<ProjectFeatures[]>> => {
        try {
            const collection = await this.getCollection();
            const docs = await collection
                .find({})
                .toArray() as ProjectFeatures[];
                
            return {
                success: true,
                data: docs.map(doc => new ProjectFeature(doc) as ProjectFeatures)
            };
        } catch (error) {
            console.log(error)
            throw new Error("Failed to fetch projectfeatures");
        }
    };

    findById = async ({ id }: ProjectFeatureId): Promise<Result<ProjectFeatures>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) }) as ProjectFeatures | null;
                
            if (!doc) {
                throw new Error("ProjectFeature not found");
            }
            
            return {
                success: true,
                data: new ProjectFeature(doc) as ProjectFeatures
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to find projectfeature");
        }
    };

    update = async ({ id }: ProjectFeatureId, data: UpdateProjectFeature): Promise<Result<ProjectFeatures>> => {
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
                throw new Error("ProjectFeature not found");
            }
            
            return {
                success: true,
                message: "ProjectFeature updated successfully",
                data: new ProjectFeature(result) as ProjectFeatures
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to update projectfeature");
        }
    };

    delete = async ({ id }: ProjectFeatureId): Promise<Result<ProjectFeatures>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) });
                
            if (!doc) {
                throw new Error("ProjectFeature not found");
            }

            await collection.deleteOne({ _id: new ObjectId(id) });
            
            return {
                success: true,
                message: "ProjectFeature deleted successfully",
                data: new ProjectFeature(doc) as ProjectFeatures
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to delete projectfeature");
        }
    };
}

// ! -- CUSTOM METHODS --
// You can add custom methods or business logic below this line
// For example: 
// export class CustomProjectFeatureRepository extends ProjectFeatureRepository {
//     customMethod = async () => {
//         // Your custom logic here
//     }
// }

export const Repository = new ProjectFeatureRepository()