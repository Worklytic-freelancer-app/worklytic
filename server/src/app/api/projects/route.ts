import { Service as Project } from "../../../modules/Projects/project.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await Project.getAll();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await Project.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to create project" },
            { status: 500 }
        );
    }
}