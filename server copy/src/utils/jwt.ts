import jwt, { type JwtPayload } from "jsonwebtoken";

// import * as jose from "jose";

const SECRET_KEY = process.env.JWT_SECRET || "this-is-not-a-safe-key";

export const createToken = (payload: JwtPayload) => jwt.sign(payload, SECRET_KEY);

export const readPayload = (token: string) => jwt.verify(token, SECRET_KEY);

// export const readPayloadJose = async <T>(token: string) => {
//   const secretKey = new TextEncoder().encode(SECRET_KEY);
//   const payloadJose = await jose.jwtVerify<T>(token, secretKey);

//   return payloadJose.payload;
// };
