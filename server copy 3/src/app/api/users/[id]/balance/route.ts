import { NextRequest, NextResponse } from "next/server";
import { Service as User } from "../../../../../modules/Users/user.service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const result = await User.updateBalance(id, body.balance);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error 
                ? error.message 
                : "Failed to update balance" 
            },
            { status: 500 }
        );
    }
}
