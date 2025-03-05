import { Service as ProjectDiscussion } from "../../../modules/ProjectDiscussions/projectdiscussion.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await ProjectDiscussion.getAll();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch projectdiscussions" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await ProjectDiscussion.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to create projectdiscussion" },
            { status: 500 }
        );
    }
}