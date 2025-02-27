import { Repository as User } from "./user.repository";
import type { CreateUser, UpdateUser, Users } from "./user.schema";
import { 
    CreateUserValidate, 
    UpdateUserValidate 
} from "./user.schema";
import type { Result } from "./user.repository";
import { hashText, compareText } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";

class UserService {
    async create(data: CreateUser): Promise<Result<Users>> {
        const validated = CreateUserValidate.parse(data);
        return await User.create(validated);
    }
    
    async getAll(): Promise<Result<Users[]>> {
        return await User.findAll();
    }
    
    async getById(id: string): Promise<Result<Users>> {
        return await User.findById({ id });
    }
    
    async update(id: string, data: UpdateUser): Promise<Result<Users>> {
        const validated = UpdateUserValidate.parse(data);
        return await User.update({ id }, validated);
    }
    
    async delete(id: string): Promise<Result<Users>> {
        return await User.delete({ id });
    }

    async signUp(data: CreateUser): Promise<Result<{ user: Users; token: string }>> {
        try {
            const hashedPassword = hashText(data.password);
            const validated = CreateUserValidate.parse({
                ...data,
                password: hashedPassword,
            });
            
            const result = await User.create(validated);
            
            if (!result.data) {
                throw new Error("Failed to create user");
            }

            const token = generateToken({
                id: result.data._id.toString(),
                email: result.data.email,
            });

            return {
                success: true,
                message: "User registered successfully",
                data: {
                    user: result.data,
                    token,
                },
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to register user");
        }
    }

    async signIn(email: string, password: string): Promise<Result<{ user: Users; token: string }>> {
        try {
            const result = await User.findByEmail(email);
            
            if (!result.data) {
                throw new Error("Invalid email or password");
            }

            const isPasswordValid = compareText(password, result.data.password);
            
            if (!isPasswordValid) {
                throw new Error("Invalid email or password");
            }

            const token = generateToken({
                id: result.data._id.toString(),
                email: result.data.email,
            });

            return {
                success: true,
                message: "Login successful",
                data: {
                    user: result.data,
                    token,
                },
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to login");
        }
    }
}

export const Service = new UserService();