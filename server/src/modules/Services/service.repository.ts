import { ObjectId } from "mongodb";
import { db } from "../../config";
import type { CreateService, UpdateService, Services, ServiceId } from "./service.schema";
import { Service } from "./service.schema";

export type Result<T> = {
    success: boolean;
    message?: string;
    data: T | null;
    error?: unknown;
};

export class ServiceRepository {
    private readonly collection = "Services";
    
    private getCollection = async () => {
        return db.collection(this.collection);
    };
    
    create = async (data: CreateService): Promise<Result<Services>> => {
        try {
            const doc = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            } as const;
            
            const collection = await this.getCollection();
            const result = await collection.insertOne(doc);
            
            if (!result.acknowledged) {
                throw new Error("Failed to create service");
            }
            
            return {
                success: true,
                message: "Service created successfully",
                data: new Service({ ...doc, _id: result.insertedId }) as Services
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to create service");
        }
    };

    findAll = async (): Promise<Result<Services[]>> => {
        try {
            const collection = await this.getCollection();
            const docs = await collection
                .find({})
                .toArray() as Services[];
                
            return {
                success: true,
                data: docs.map(doc => new Service(doc) as Services)
            };
        } catch (error) {
            console.log(error)
            throw new Error("Failed to fetch services");
        }
    };

    findById = async ({ id }: ServiceId): Promise<Result<Services>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) }) as Services | null;
                
            if (!doc) {
                throw new Error("Service not found");
            }
            
            return {
                success: true,
                data: new Service(doc) as Services
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to find service");
        }
    };

    update = async ({ id }: ServiceId, data: UpdateService): Promise<Result<Services>> => {
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
                throw new Error("Service not found");
            }
            
            return {
                success: true,
                message: "Service updated successfully",
                data: new Service(result) as Services
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to update service");
        }
    };

    delete = async ({ id }: ServiceId): Promise<Result<Services>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) });
                
            if (!doc) {
                throw new Error("Service not found");
            }

            await collection.deleteOne({ _id: new ObjectId(id) });
            
            return {
                success: true,
                message: "Service deleted successfully",
                data: new Service(doc) as Services
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to delete service");
        }
    };
}

// ! -- CUSTOM METHODS --
// You can add custom methods or business logic below this line
// For example: 
// export class CustomServiceRepository extends ServiceRepository {
//     customMethod = async () => {
//         // Your custom logic here
//     }
// }

export const Repository = new ServiceRepository()