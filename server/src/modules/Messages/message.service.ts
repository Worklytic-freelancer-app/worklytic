import { Repository as Message } from "./message.repository";
import type { CreateMessage, UpdateMessage, Messages } from "./message.schema";
import { 
    CreateMessageValidate, 
    UpdateMessageValidate 
} from "./message.schema";
import type { Result } from "./message.repository";

class MessageService {
    async create(data: CreateMessage): Promise<Result<Messages>> {
        const validated = CreateMessageValidate.parse(data);
        return await Message.create(validated);
    }
    
    async getAll(): Promise<Result<Messages[]>> {
        return await Message.findAll();
    }
    
    async getById(id: string): Promise<Result<Messages>> {
        return await Message.findById({ id });
    }
    
    async update(id: string, data: UpdateMessage): Promise<Result<Messages>> {
        const validated = UpdateMessageValidate.parse(data);
        return await Message.update({ id }, validated);
    }
    
    async delete(id: string): Promise<Result<Messages>> {
        return await Message.delete({ id });
    }
}

export const Service = new MessageService();