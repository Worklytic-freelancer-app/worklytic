import { Service as Project } from "../../../../modules/Projects/project.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        // Ambil data user dari header yang sudah diset di middleware
        const userHeader = req.headers.get("user");
        console.log(userHeader);
        if (!userHeader) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = JSON.parse(userHeader);
        
        // Cek apakah user memiliki skills
        if (!user.User.skills || user.User.skills.length === 0) {
            return NextResponse.json({
                success: true,
                data: []
            });
        }

        const result = await Project.getRecommendationsBySkills(user.User.skills);
        // console.log(result, "result");
        
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch project recommendations" },
            { status: 500 }
        );
    }
} 