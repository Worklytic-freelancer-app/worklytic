import { Service as Payment } from "../../../../modules/Payments/payment.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();
        
        if (!orderId) {
            return NextResponse.json(
                { message: "Order ID is required" },
                { status: 400 }
            );
        }
        
        const result = await Payment.checkPaymentStatus(orderId);
        
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to check payment status" },
            { status: 500 }
        );
    }
} 