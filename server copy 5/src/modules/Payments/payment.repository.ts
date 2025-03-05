import { ObjectId } from "mongodb";
import { db } from "../../config";
import type { CreatePayment, UpdatePayment, Payments, PaymentId } from "./payment.schema";
import { Payment } from "./payment.schema";

export type Result<T> = {
    success: boolean;
    message?: string;
    data: T | null;
    error?: unknown;
};

export class PaymentRepository {
    private readonly collection = "Payments";
    
    private getCollection = async () => {
        return db.collection(this.collection);
    };
    
    create = async (data: CreatePayment): Promise<Result<Payments>> => {
        try {
            const doc = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            } as const;
            
            const collection = await this.getCollection();
            const result = await collection.insertOne(doc);
            
            if (!result.acknowledged) {
                throw new Error("Failed to create payment");
            }
            
            return {
                success: true,
                message: "Payment created successfully",
                data: new Payment({ ...doc, _id: result.insertedId }) as Payments
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to create payment");
        }
    };

    findAll = async (): Promise<Result<Payments[]>> => {
        try {
            const collection = await this.getCollection();
            
            const payments = await collection.aggregate([
                // Lookup untuk mendapatkan data project
                {
                    $lookup: {
                        from: "Projects",
                        localField: "projectId",
                        foreignField: "_id",
                        as: "project"
                    }
                },
                // Unwind project array
                {
                    $unwind: {
                        path: "$project",
                        preserveNullAndEmptyArrays: true
                    }
                },
                // Lookup untuk mendapatkan data user
                {
                    $lookup: {
                        from: "Users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                // Unwind user array
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]).toArray() as Payments[];
            
            return {
                success: true,
                data: payments
            };
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch payments");
        }
    };

    findById = async ({ id }: PaymentId): Promise<Result<Payments>> => {
        try {
            const collection = await this.getCollection();
            const [doc] = await collection.aggregate([
                {
                    $match: { _id: new ObjectId(id) }
                },
                // Lookup untuk mendapatkan data project
                {
                    $lookup: {
                        from: "Projects",
                        localField: "projectId",
                        foreignField: "_id",
                        as: "project"
                    }
                },
                // Unwind project array
                {
                    $unwind: {
                        path: "$project",
                        preserveNullAndEmptyArrays: true
                    }
                },
                // Lookup untuk mendapatkan data user
                {
                    $lookup: {
                        from: "Users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                // Unwind user array
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]).toArray() as Payments[];
                
            if (!doc) {
                throw new Error("Payment not found");
            }
            
            return {
                success: true,
                data: new Payment(doc) as Payments
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to find payment");
        }
    };

    findByOrderId = async (orderId: string): Promise<Result<Payments>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection.findOne({ orderId });
                
            if (!doc) {
                throw new Error("Payment not found");
            }
            
            return {
                success: true,
                data: new Payment(doc) as Payments
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to find payment");
        }
    };

    update = async ({ id }: PaymentId, data: UpdatePayment): Promise<Result<Payments>> => {
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
                throw new Error("Payment not found");
            }
            
            return {
                success: true,
                message: "Payment updated successfully",
                data: new Payment(result) as Payments
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to update payment");
        }
    };

    updateByOrderId = async (orderId: string, data: UpdatePayment): Promise<Result<Payments>> => {
        try {
            const collection = await this.getCollection();
            const result = await collection
                .findOneAndUpdate(
                    { orderId },
                    { 
                        $set: {
                            ...data,
                            updatedAt: new Date(),
                            ...(data.status === "success" ? { paidAt: new Date() } : {})
                        }
                    },
                    { returnDocument: 'after' }
                );
            
            if (!result) {
                throw new Error("Payment not found");
            }
            
            return {
                success: true,
                message: "Payment updated successfully",
                data: new Payment(result) as Payments
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to update payment");
        }
    };

    delete = async ({ id }: PaymentId): Promise<Result<Payments>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) });
                
            if (!doc) {
                throw new Error("Payment not found");
            }

            await collection.deleteOne({ _id: new ObjectId(id) });
            
            return {
                success: true,
                message: "Payment deleted successfully",
                data: new Payment(doc) as Payments
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to delete payment");
        }
    };
}

// ! -- CUSTOM METHODS --
// You can add custom methods or business logic below this line
// For example: 
// export class CustomPaymentRepository extends PaymentRepository {
//     customMethod = async () => {
//         // Your custom logic here
//     }
// }

export const Repository = new PaymentRepository()