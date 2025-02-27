import { getUserByEmail, UserModel } from "@/db/models/user";
import { CustomResponse } from "@/types/type";
import { compareText } from "@/utils/bcrypt";
import { createToken } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UserInputSignInSchema = z.object({
  email: z.string().min(1, { message: "Email harus diisi" }).email({ message: "Format email tidak valid" }),
  password: z.string().min(5, { message: "Password minimal 5 karakter" }),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log(data, "data");

    const parsedData = UserInputSignInSchema.safeParse(data);

    if (!parsedData.success) {
      const errorMap: Record<string, string> = {};

      parsedData.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!errorMap[field]) {
          errorMap[field] = issue.message;
        }
      });

      return NextResponse.json(
        {
          statusCode: 400,
          message: "Validation Error",
          errors: errorMap,
        },
        { status: 400 }
      );
    }

    const user = (await getUserByEmail(data.email)) as UserModel;
    // console.log(user, "user");

    // console.log(user.password, data.paasword, "<<<<<");

    if (!user || !compareText(data.password, user.password)) {
      return NextResponse.json(
        {
          statusCode: 401,
          message: "LoginError",
          errors: "Invalid Email or Password",
        },
        {
          status: 401,
        }
      );
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = await createToken(payload);
    // console.log(token);
    return NextResponse.json(
      {
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
