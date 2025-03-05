import { Service as Service } from "../../../modules/Services/service.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await Service.getAll();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch services" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await Service.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to create service" },
            { status: 500 }
        );
    }
}