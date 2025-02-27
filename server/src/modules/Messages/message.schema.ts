import { z } from "zod"
import { ObjectId } from "mongodb"

export class Message {
    constructor(data: Partial<Messages>) {
        Object.assign(this, data)
    }
}

const MessageSchema = z.object({
    senderId: z.string(),
    receiverId: z.string(),
    text: z.string(),
    createdAt: z.date(),
    read: z.boolean()
})

const WithIdSchema = z.object({
    _id: z.instanceof(ObjectId)
})

const TimestampSchema = z.object({
    createdAt: z.date(),
    updatedAt: z.date()
})

export const MessageIdValidate = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
})

export const CreateMessageValidate = MessageSchema

export const MessagesValidate = MessageSchema
    .merge(WithIdSchema)
    .merge(TimestampSchema)

export const UpdateMessageValidate = MessageSchema.partial()

export type CreateMessage = z.infer<typeof CreateMessageValidate>
export type Messages = z.infer<typeof MessagesValidate>
export type UpdateMessage = z.infer<typeof UpdateMessageValidate>
export type MessageId = z.infer<typeof MessageIdValidate>
