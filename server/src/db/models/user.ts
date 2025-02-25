import { ObjectId } from "mongodb";
import { getDb } from "../config/mongoConnection";
import { hashText } from "@/utils/bcrypt";

export type UserModel = {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  role: "freelancer" | "client";
};

export type UserModelCreateInput = Omit<UserModel, "_id">;

export const createUser = async (user: UserModelCreateInput) => {
  const db = await getDb();
  const collection = db.collection("users");

  const modifiedUser: UserModelCreateInput = {
    ...user,
    password: hashText(user.password),
  };

  const newUser = await collection.insertOne(modifiedUser);

  return newUser;
};

export const findAll = async () => {
  const db = await getDb();
  const collection = db.collection("users");
  const users = await collection.find().toArray();
  return users;
};

export const getUserById = async (id: string) => {
  const db = await getDb();
  const collection = db.collection("users");
  const user = await collection.findOne({ _id: new ObjectId(id) });
  return user;
};

export const getUserByEmail = async (email: string) => {
  const db = await getDb();
  const collection = db.collection("users");
  const user = await collection.findOne({ email });
  return user;
};

export const getUserByName = async (name: string) => {
  const db = await getDb();
  const collection = db.collection("users");
  const user = await collection.findOne({ name });
  return user;
};
