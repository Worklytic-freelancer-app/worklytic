import { NextRequest, NextResponse } from "next/server";
import { Service } from "../../../../modules/Payments/payment.service";

export async function POST(request: NextRequest) {
    try {
        const notificationData = await request.json();
        console.log("Received payment notification from Midtrans:", notificationData);
        
        // Proses notifikasi
        const result = await Service.handleCallback(notificationData);
        
        if (!result.success) {
            console.error("Failed to process payment notification:", result.message);
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 400 }
            );
        }
        
        console.log("Payment notification processed successfully:", result.data);
        return NextResponse.json(
            { success: true, message: "Notification processed" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing payment notification:", error);
        return NextResponse.json(
            { success: false, message: "Failed to process notification" },
            { status: 500 }
        );
    }
} 