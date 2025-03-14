import jwt from "jsonwebtoken";
import * as jose from "jose";
import type { Users } from "../modules/Users/user.schema";

interface Payload {
  id: string;
  email: string;
  User: Users;
}

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "rahasiawkoawkoawko";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const generateToken = (payload: Payload) => {
  return jwt.sign(payload, JWT_SECRET);
};

export const verifyToken = async (token: string) => {
  const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
  return payload;
};
