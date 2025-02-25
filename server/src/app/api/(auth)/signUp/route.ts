import { createUser, getUserByEmail } from "@/db/models/user";
import { CustomResponse } from "@/types/type";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UserInputSignUpSchema = z.object({
  name: z.string().min(1, { message: "Nama harus diisi" }),
  email: z.string().min(1, { message: "Email harus diisi" }).email({ message: "Format email tidak valid" }),
  password: z.string().min(5, { message: "Password minimal 5 karakter" }),
  role: z.enum(["client", "freelancer"]).default("freelancer"),
});

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/auth/signUp");

    const data = await request.json();
    const parsedData = UserInputSignUpSchema.safeParse(data);

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

    const emailUnique = await getUserByEmail(parsedData.data.email);
    if (emailUnique) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Validation Error",
          errors: {
            email: "Email sudah terdaftar",
          },
        },
        { status: 400 }
      );
    }

    // console.log(parsedData.data);

    const user = await createUser(parsedData.data);

    return NextResponse.json(
      {
        statusCode: 201,
        message: "Register berhasil",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
