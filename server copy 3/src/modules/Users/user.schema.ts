import { z } from "zod";
import { ObjectId } from "mongodb";

export class User {
  constructor(data: Partial<Users>) {
    Object.assign(this, data);
  }
}

// Untuk data lengkap user
const UserSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["freelancer", "client"]),
  profileImage: z.string().default(""),
  location: z.string().default(""),
  balance: z.number().default(0),
  about: z.string().default(""),
  phone: z.string().default(""),
  hourlyRate: z.number().default(0),
  skills: z.array(z.string()).default([]),
  totalProjects: z.number().default(0),
  companyName: z.string().default(""),
  industry: z.string().default(""),
  website: z.string().default(""),
  rating: z.number().default(0),
  totalReviews: z.number().default(0),
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

export const CreateUserValidate = UserSchema;

export const UsersValidate = UserSchema.merge(WithIdSchema).merge(TimestampSchema);

export const UpdateUserValidate = UserSchema.partial();

export type CreateUser = z.infer<typeof CreateUserValidate>;
export type Users = z.infer<typeof UsersValidate>;
export type UpdateUser = z.infer<typeof UpdateUserValidate>;
export type UserId = z.infer<typeof UserIdValidate>;
