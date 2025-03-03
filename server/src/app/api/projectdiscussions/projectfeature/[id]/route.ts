import { Service as ProjectDiscussion } from "../../../../../modules/ProjectDiscussions/projectdiscussion.service";
import { NextResponse, NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const result = await ProjectDiscussion.getByProjectFeatureId(id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch discussions for this project feature" },
            { status: 500 }
        );
    }
} 