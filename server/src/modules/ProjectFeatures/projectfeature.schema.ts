import { z } from "zod"
import { ObjectId } from "mongodb"

export class ProjectFeature {
    constructor(data: Partial<ProjectFeatures>) {
        Object.assign(this, data)
    }
}

const ProjectFeatureSchema = z.object({
    title: z.string(),
    description: z.string(),
    completedDate: z.date(),
    image: z.string()
})

const WithIdSchema = z.object({
    _id: z.instanceof(ObjectId)
})

const TimestampSchema = z.object({
    createdAt: z.date(),
    updatedAt: z.date()
})

export const ProjectFeatureIdValidate = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
})

export const CreateProjectFeatureValidate = ProjectFeatureSchema

export const ProjectFeaturesValidate = ProjectFeatureSchema
    .merge(WithIdSchema)
    .merge(TimestampSchema)

export const UpdateProjectFeatureValidate = ProjectFeatureSchema.partial()

export type CreateProjectFeature = z.infer<typeof CreateProjectFeatureValidate>
export type ProjectFeatures = z.infer<typeof ProjectFeaturesValidate>
export type UpdateProjectFeature = z.infer<typeof UpdateProjectFeatureValidate>
export type ProjectFeatureId = z.infer<typeof ProjectFeatureIdValidate>
