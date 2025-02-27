import { Service as User } from "../../../modules/Users/user.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await User.getAll();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await User.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to create user" },
            { status: 500 }
        );
    }
}