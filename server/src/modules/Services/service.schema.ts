import { z } from "zod"
import { ObjectId } from "mongodb"

export class Service {
    constructor(data: Partial<Services>) {
        Object.assign(this, data)
    }
}

// Skema dasar untuk layanan
const ServiceBaseSchema = z.object({
    freelancerId: z.string().transform((val) => new ObjectId(val)),
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
})

// Skema untuk ID
const WithIdSchema = z.object({
    _id: z.instanceof(ObjectId)
})

// Skema untuk timestamp
const TimestampSchema = z.object({
    createdAt: z.date(),
    updatedAt: z.date()
})

// Validasi ID layanan
export const ServiceIdValidate = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
})

// Validasi untuk membuat layanan baru (tidak perlu timestamp)
export const CreateServiceValidate = ServiceBaseSchema

// Validasi untuk layanan lengkap (dengan ID dan timestamp)
export const ServicesValidate = ServiceBaseSchema
    .merge(WithIdSchema)
    .merge(TimestampSchema)

// Validasi untuk update layanan (semua field opsional)
export const UpdateServiceValidate = ServiceBaseSchema.partial()

// Type definitions
export type CreateService = z.infer<typeof CreateServiceValidate>
export type Services = z.infer<typeof ServicesValidate>
export type UpdateService = z.infer<typeof UpdateServiceValidate>
export type ServiceId = z.infer<typeof ServiceIdValidate>
