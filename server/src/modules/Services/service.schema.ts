import { z } from "zod"
import { ObjectId } from "mongodb"

export class Service {
    constructor(data: Partial<Services>) {
        Object.assign(this, data)
    }
}

const ServiceSchema = z.object({
    freelancerId: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    deliveryTime: z.string(),
    category: z.string(),
    images: z.array(z.string()),
    rating: z.number(),
    reviews: z.number(),
    includes: z.array(z.string()),
    requirements: z.array(z.string()),
    createdAt: z.date(),
    updatedAt: z.date()
})

const WithIdSchema = z.object({
    _id: z.instanceof(ObjectId)
})

const TimestampSchema = z.object({
    createdAt: z.date(),
    updatedAt: z.date()
})

export const ServiceIdValidate = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
})

export const CreateServiceValidate = ServiceSchema

export const ServicesValidate = ServiceSchema
    .merge(WithIdSchema)
    .merge(TimestampSchema)

export const UpdateServiceValidate = ServiceSchema.partial()

export type CreateService = z.infer<typeof CreateServiceValidate>
export type Services = z.infer<typeof ServicesValidate>
export type UpdateService = z.infer<typeof UpdateServiceValidate>
export type ServiceId = z.infer<typeof ServiceIdValidate>
