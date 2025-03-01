import { z } from "zod"
import { ObjectId } from "mongodb"
import { Users } from "../Users/user.schema"

export class Project {
    constructor(data: Partial<Projects>) {
        Object.assign(this, data)
    }
}

const ProjectSchema = z.object({
    clientId: z.instanceof(ObjectId),
    title: z.string(),
    description: z.string(),
    budget: z.number(),
    category: z.string(),
    location: z.string(),
    duration: z.string(),
    status: z.string(),
    requirements: z.array(z.string()),
    image: z.array(z.string()),
    assignedFreelancer: z.array(Users),
    chosenFreelancer: z.array(Users),
    features: z.array(z.string()),
    createdAt: z.date(),
    updatedAt: z.date(),
    progress: z.number()
})

const WithIdSchema = z.object({
    _id: z.instanceof(ObjectId)
})

const TimestampSchema = z.object({
    createdAt: z.date(),
    updatedAt: z.date()
})

export const ProjectIdValidate = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
})

export const CreateProjectValidate = ProjectSchema

export const ProjectsValidate = ProjectSchema
    .merge(WithIdSchema)
    .merge(TimestampSchema)

export const UpdateProjectValidate = ProjectSchema.partial()

export type CreateProject = z.infer<typeof CreateProjectValidate>



// Update interface Projects untuk menggunakan tipe baru
export interface Projects {
    _id: ObjectId;
    clientId: ObjectId;
    title: string;
    description: string;
    budget: number;
    category: string;
    location: string;
    duration: string;
    status: string;
    requirements: string[];
    image: string[];
    assignedFreelancer?: Users[];
    chosenFreelancer?: Users[];
    features: string[];
    createdAt: Date;
    updatedAt: Date;
    progress: number;
}

export type UpdateProject = z.infer<typeof UpdateProjectValidate>
export type ProjectId = z.infer<typeof ProjectIdValidate>
