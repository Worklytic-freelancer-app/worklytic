import { Service as Message } from "../../../modules/Messages/message.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await Message.getAll();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await Message.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to create message" },
            { status: 500 }
        );
    }
}