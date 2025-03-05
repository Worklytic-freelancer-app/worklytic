import { Service as Payment } from "../../../../modules/Payments/payment.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Proses callback dari Midtrans
        await Payment.handleCallback(body);
        
        return NextResponse.json({
            success: true,
            message: "Callback processed successfully"
        });
    } catch (error) {
        console.error("Error processing payment callback:", error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to process payment callback" },
            { status: 500 }
        );
    }
} 