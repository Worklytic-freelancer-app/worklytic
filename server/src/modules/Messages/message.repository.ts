import { ObjectId } from "mongodb";
import { db } from "../../config";
import type { CreateMessage, UpdateMessage, Messages, MessageId } from "./message.schema";
import { Message } from "./message.schema";

export type Result<T> = {
    success: boolean;
    message?: string;
    data: T | null;
    error?: unknown;
};

export class MessageRepository {
    private readonly collection = "Messages";
    
    private getCollection = async () => {
        return db.collection(this.collection);
    };
    
    create = async (data: CreateMessage): Promise<Result<Messages>> => {
        try {
            const doc = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            } as const;
            
            const collection = await this.getCollection();
            const result = await collection.insertOne(doc);
            
            if (!result.acknowledged) {
                throw new Error("Failed to create message");
            }
            
            return {
                success: true,
                message: "Message created successfully",
                data: new Message({ ...doc, _id: result.insertedId }) as Messages
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to create message");
        }
    };

    findAll = async (): Promise<Result<Messages[]>> => {
        try {
            const collection = await this.getCollection();
            const docs = await collection
                .find({})
                .toArray() as Messages[];
                
            return {
                success: true,
                data: docs.map(doc => new Message(doc) as Messages)
            };
        } catch (error) {
            console.log(error)
            throw new Error("Failed to fetch messages");
        }
    };

    findById = async ({ id }: MessageId): Promise<Result<Messages>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) }) as Messages | null;
                
            if (!doc) {
                throw new Error("Message not found");
            }
            
            return {
                success: true,
                data: new Message(doc) as Messages
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to find message");
        }
    };

    update = async ({ id }: MessageId, data: UpdateMessage): Promise<Result<Messages>> => {
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
                throw new Error("Message not found");
            }
            
            return {
                success: true,
                message: "Message updated successfully",
                data: new Message(result) as Messages
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to update message");
        }
    };

    delete = async ({ id }: MessageId): Promise<Result<Messages>> => {
        try {
            const collection = await this.getCollection();
            const doc = await collection
                .findOne({ _id: new ObjectId(id) });
                
            if (!doc) {
                throw new Error("Message not found");
            }

            await collection.deleteOne({ _id: new ObjectId(id) });
            
            return {
                success: true,
                message: "Message deleted successfully",
                data: new Message(doc) as Messages
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to delete message");
        }
    };
}

// ! -- CUSTOM METHODS --
// You can add custom methods or business logic below this line
// For example: 
// export class CustomMessageRepository extends MessageRepository {
//     customMethod = async () => {
//         // Your custom logic here
//     }
// }

export const Repository = new MessageRepository()