import { Repository as ServiceRepository } from "./service.repository";
import type { CreateService, UpdateService, Services } from "./service.schema";
import { 
    CreateServiceValidate, 
    UpdateServiceValidate 
} from "./service.schema";
import type { Result } from "./service.repository";

class ServiceService {
    async create(data: CreateService): Promise<Result<Services>> {
        const validated = CreateServiceValidate.parse(data);
        return await ServiceRepository.create(validated);
    }
    
    async getAll(): Promise<Result<Services[]>> {
        return await ServiceRepository.findAll();
    }
    
    async getById(id: string): Promise<Result<Services>> {
        return await ServiceRepository.findById({ id });
    }
    
    async update(id: string, data: UpdateService): Promise<Result<Services>> {
        const validated = UpdateServiceValidate.parse(data);
        return await ServiceRepository.update({ id }, validated);
    }
    
    async delete(id: string): Promise<Result<Services>> {
        return await ServiceRepository.delete({ id });
    }
}

export const Service = new ServiceService();