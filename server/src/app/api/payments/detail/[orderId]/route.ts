import { NextResponse } from "next/server";
import { Service as Payment } from "../../../../../modules/Payments/payment.service";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        
        if (!orderId) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            );
        }
        
        // Cari payment berdasarkan orderId
        const payment = await Payment.findByOrderId(orderId);
        
        if (!payment.success || !payment.data) {
            return NextResponse.json(
                { success: false, message: "Payment not found" },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            message: "Payment detail retrieved successfully",
            data: payment.data
        });
    } catch (error) {
        console.error("Error getting payment detail:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: error instanceof Error ? error.message : "Failed to get payment detail" 
            },
            { status: 500 }
        );
    }
} 