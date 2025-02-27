import { ObjectId } from "mongodb";
import { db } from "../../config";
import type { CreateUser, UpdateUser, Users, UserId } from "./user.schema";
import { User } from "./user.schema";

export type Result<T> = {
  success: boolean;
  message?: string;
  data: T | null;
  error?: unknown;
};

export class UserRepository {
  private readonly collection = "Users";

  private getCollection = async () => {
    return db.collection(this.collection);
  };

  create = async (data: CreateUser): Promise<Result<Users>> => {
    try {
      const doc = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as const;

      const collection = await this.getCollection();
      const result = await collection.insertOne(doc);

      if (!result.acknowledged) {
        throw new Error("Failed to create user");
      }

      return {
        success: true,
        message: "User created successfully",
        data: new User({ ...doc, _id: result.insertedId }) as Users,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to create user");
    }
  };

  findAll = async (): Promise<Result<Users[]>> => {
    try {
      const collection = await this.getCollection();
      const docs = (await collection.find({}).toArray()) as Users[];

      return {
        success: true,
        data: docs.map((doc) => new User(doc) as Users),
      };
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch users");
    }
  };

  findById = async ({ id }: UserId): Promise<Result<Users>> => {
    try {
      const collection = await this.getCollection();
      const doc = (await collection.findOne({ _id: new ObjectId(id) })) as Users | null;

      if (!doc) {
        throw new Error("User not found");
      }

      return {
        success: true,
        data: new User(doc) as Users,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to find user");
    }
  };

  findByEmail = async (email: string): Promise<Result<Users>> => {
    try {
      const collection = await this.getCollection();
      const doc = (await collection.findOne({ email })) as Users | null;

      if (!doc) {
        throw new Error("User not found");
      }

      return {
        success: true,
        data: new User(doc) as Users,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to find user");
    }
  };

  update = async ({ id }: UserId, data: UpdateUser): Promise<Result<Users>> => {
    try {
      const collection = await this.getCollection();
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("User not found");
      }

      return {
        success: true,
        message: "User updated successfully",
        data: new User(result) as Users,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to update user");
    }
  };

  delete = async ({ id }: UserId): Promise<Result<Users>> => {
    try {
      const collection = await this.getCollection();
      const doc = await collection.findOne({ _id: new ObjectId(id) });

      if (!doc) {
        throw new Error("User not found");
      }

      await collection.deleteOne({ _id: new ObjectId(id) });

      return {
        success: true,
        message: "User deleted successfully",
        data: new User(doc) as Users,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to delete user");
    }
  };
}

// ! -- CUSTOM METHODS --
// You can add custom methods or business logic below this line
// For example:
// export class CustomUserRepository extends UserRepository {
//     customMethod = async () => {
//         // Your custom logic here
//     }
// }

export const Repository = new UserRepository();
