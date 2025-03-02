import { z } from "zod"
import { ObjectId } from "mongodb"
import { ProjectFeaturesValidate } from "../ProjectFeatures/projectfeature.schema"

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
    completedDate: z.date(),
    status: z.string(),
    requirements: z.array(z.string()),
    image: z.array(z.string()),
    features: z.array(ProjectFeaturesValidate),
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
export type Projects = z.infer<typeof ProjectsValidate>
export type UpdateProject = z.infer<typeof UpdateProjectValidate>
export type ProjectId = z.infer<typeof ProjectIdValidate>
