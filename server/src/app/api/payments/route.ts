import { Service as Payment } from "../../../modules/Payments/payment.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await Payment.getAll();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch payments" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await Payment.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to create payment" },
            { status: 500 }
        );
    }
}