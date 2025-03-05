import { NextResponse } from "next/server";
import { createTransactionToken } from "../../../../config/midtrans";
import { nanoid } from "nanoid";
import { Service as Payment } from "../../../../modules/Payments/payment.service";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
    try {
        const { userId, amount, title } = await req.json();
        
        if (!userId || !amount || !title) {
            return NextResponse.json(
                { success: false, message: "User ID, amount, and title are required" },
                { status: 400 }
            );
        }
        
        try {
            // Buat order ID unik
            const orderId = `PRE-ORDER-${nanoid(10)}`;
            
            // Buat transaction token dari Midtrans
            const transaction = await createTransactionToken(
                {
                    order_id: orderId,
                    gross_amount: amount
                },
                {
                    first_name: "Customer", // Ini seharusnya diambil dari data user
                    email: "customer@example.com", // Ini seharusnya diambil dari data user
                },
                [{
                    id: "pre-project",
                    price: amount,
                    quantity: 1,
                    name: title
                }]
            );
            
            // Simpan data pre-payment ke database
            await Payment.create({
                projectId: new ObjectId(), // Temporary ObjectId
                userId: new ObjectId(userId),
                amount,
                status: "pending",
                transactionId: transaction.transaction_id || "",
                orderId,
                snapToken: transaction.token || "",
                paymentUrl: transaction.redirect_url || "",
                currency: "IDR"
            });
            
            return NextResponse.json({
                success: true,
                message: "Pre-payment created successfully",
                data: {
                    orderId,
                    redirect_url: transaction.redirect_url,
                    paymentUrl: transaction.redirect_url,
                    token: transaction.token
                }
            });
        } catch (error) {
            console.error("Error creating pre-payment:", error);
            throw error;
        }
    } catch (error) {
        console.error("Error in pre-payment API:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: error instanceof Error ? error.message : "Failed to create pre-payment" 
            },
            { status: 500 }
        );
    }
} 