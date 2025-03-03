import { Service as Payment } from "../../../../modules/Payments/payment.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();
        
        if (!orderId) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            );
        }
        
        try {
            const result = await Payment.checkPaymentStatus(orderId);
            return NextResponse.json(result);
        } catch (error) {
            // Jika error terkait "Transaction doesn't exist", kembalikan status pending
            if (error instanceof Error && 
                (error.message.includes("Transaction doesn't exist") || 
                 error.message.includes("404"))) {
                
                return NextResponse.json({
                    success: true,
                    message: "Payment is still being processed",
                    data: { status: "pending" }
                });
            }
            
            throw error;
        }
    } catch (error) {
        console.error("Error checking payment status:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: error instanceof Error ? error.message : "Failed to check payment status" 
            },
            { status: 500 }
        );
    }
} 