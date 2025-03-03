import { z } from "zod"
import { ObjectId } from "mongodb"

export class ProjectDiscussion {
    constructor(data: Partial<ProjectDiscussions>) {
        Object.assign(this, data)
    }
}

const ProjectDiscussionSchema = z.object({
    projectFeatureId: z.instanceof(ObjectId),
    senderId: z.instanceof(ObjectId),
    description: z.string(),
    images: z.array(z.string()).optional(),
    files: z.array(z.string()).optional()
})

const WithIdSchema = z.object({
    _id: z.instanceof(ObjectId)
})

const TimestampSchema = z.object({
    createdAt: z.date(),
    updatedAt: z.date()
})

export const ProjectDiscussionIdValidate = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
})

export const CreateProjectDiscussionValidate = ProjectDiscussionSchema

export const ProjectDiscussionsValidate = ProjectDiscussionSchema
    .merge(WithIdSchema)
    .merge(TimestampSchema)

export const UpdateProjectDiscussionValidate = ProjectDiscussionSchema.partial()

export type CreateProjectDiscussion = z.infer<typeof CreateProjectDiscussionValidate>
export type ProjectDiscussions = z.infer<typeof ProjectDiscussionsValidate>
export type UpdateProjectDiscussion = z.infer<typeof UpdateProjectDiscussionValidate>
export type ProjectDiscussionId = z.infer<typeof ProjectDiscussionIdValidate>
