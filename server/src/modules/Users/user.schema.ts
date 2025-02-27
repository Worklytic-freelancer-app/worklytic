import { z } from "zod";
import { ObjectId } from "mongodb";

export class User {
  constructor(data: Partial<Users>) {
    Object.assign(this, data);
  }
}

const CreateUserSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["freelancer", "client"]),
});

// Untuk data lengkap user
const UserSchema = CreateUserSchema.extend({
  profileImage: z.string().optional().default(""),
  location: z.string().optional().default(""),
  balance: z.number().optional().default(0),
  about: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  hourlyRate: z.number().optional().default(0),
  skills: z.array(z.string()).optional().default([]),
  totalProjects: z.number().optional().default(0),
  successRate: z.number().optional().default(0),
  companyName: z.string().optional().default(""),
  industry: z.string().optional().default(""),
  website: z.string().optional().default(""),
  totalPostedProjects: z.number().optional().default(0),
  rating: z.number().optional().default(0),
  totalReviews: z.number().optional().default(0),
});

const WithIdSchema = z.object({
  _id: z.instanceof(ObjectId),
});

const TimestampSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserIdValidate = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),
});

export const CreateUserValidate = CreateUserSchema;

export const UsersValidate = UserSchema.merge(WithIdSchema).merge(TimestampSchema);

export const UpdateUserValidate = UserSchema.partial();

export type CreateUser = z.infer<typeof CreateUserValidate>;
export type Users = z.infer<typeof UsersValidate>;
export type UpdateUser = z.infer<typeof UpdateUserValidate>;
export type UserId = z.infer<typeof UserIdValidate>;
