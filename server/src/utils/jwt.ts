import jwt from "jsonwebtoken";
import * as jose from "jose";

interface Payload {
  id: string;
  email: string;
}

const JWT_SECRET = "rahasia";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const generateToken = (payload: Payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

export const verifyToken = async (token: string) => {
  const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
  return payload;
};
