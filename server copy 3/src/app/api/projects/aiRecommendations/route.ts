import { NextRequest, NextResponse } from "next/server";
import { Service as ProjectService } from "../../../../modules/Projects/project.service";

export async function GET(req: NextRequest) {
    try {
        const userHeader = req.headers.get("user");
        // sconsole.log(userHeader, "userHeader");
        if (!userHeader) {
            return NextResponse.json({ error: "User header is required" }, { status: 401 });
        }
        const user = JSON.parse(userHeader);
        const result = await ProjectService.getRecommendationsByAi(user.User._id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error 
                ? error.message 
                : "Failed to get project recommendations" 
            },
            { status: 500 }
        );
    }
}