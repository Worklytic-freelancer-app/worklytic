import { NextRequest, NextResponse } from "next/server";
import { Service as ServiceService } from "../../../../modules/Services/service.service";

export async function GET(req: NextRequest) {
    try {
        // console.log("getRecommendationsByAi");
        
        const userHeader = req.headers.get("user");
        // console.log(userHeader, "userHeader");
        if (!userHeader) {
            return NextResponse.json({ error: "User header is required" }, { status: 401 });
        }
        const user = JSON.parse(userHeader);
        const result = await ServiceService.getRecommendationsByAi(user.User._id);
        return NextResponse.json(result);
    } catch (error) {
        // console.log(error, "error");
        return NextResponse.json(
            { message: error instanceof Error 
                ? error.message 
                : "Failed to get service recommendations" 
            },
            { status: 500 }
        );
    }
}