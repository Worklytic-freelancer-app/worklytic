import { Service as Payment } from "../../../../../modules/Payments/payment.service";
import { Service as Project } from "../../../../../modules/Projects/project.service";
import { Service as User } from "../../../../../modules/Users/user.service";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params;
        const body = await req.json();
        const { userId } = body;
        
        if (!userId) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }
        
        // Dapatkan data project
        const projectResult = await Project.getById(projectId);
        if (!projectResult.success || !projectResult.data) {
            return NextResponse.json(
                { message: "Project not found" },
                { status: 404 }
            );
        }
        
        // Dapatkan data user
        const userResult = await User.getById(userId);
        if (!userResult.success || !userResult.data) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }
        
        // Buat payment untuk project
        const result = await Payment.createPaymentForProject(
            projectId,
            userId,
            projectResult.data.budget,
            {
                first_name: userResult.data.fullName,
                email: userResult.data.email,
                phone: userResult.data.phone || undefined
            },
            {
                title: projectResult.data.title
            }
        );
        
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to create payment for project" },
            { status: 500 }
        );
    }
} 