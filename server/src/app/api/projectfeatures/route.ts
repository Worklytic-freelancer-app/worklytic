import { Service as ProjectFeature } from "../../../modules/ProjectFeatures/projectfeature.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await ProjectFeature.getAll();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch projectfeatures" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await ProjectFeature.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to create projectfeature" },
            { status: 500 }
        );
    }
}