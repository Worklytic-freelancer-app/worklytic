import { CustomResponse } from "@/types/type";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("masuk request GET");

    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 200,
        message: "Success Read Projects",
      },
      { status: 200 }
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
