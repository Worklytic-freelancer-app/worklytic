import { Service as Service } from "../../../modules/Services/service.service";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET() {
    try {
        const result = await Service.getAll();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json(
            { 
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch services" 
            },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Received service data:", JSON.stringify(body, null, 2));
        
        // Validasi tanggal jika ada
        if (body.createdAt) {
            delete body.createdAt;
        }
        if (body.updatedAt) {
            delete body.updatedAt;
        }
        
        const result = await Service.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        
        // Menangani error validasi
        if (error instanceof ZodError) {
            const errorMessages = error.errors.map(err => 
                `${err.path.join('.')}: ${err.message}`
            );
            
            return NextResponse.json(
                { 
                    success: false,
                    message: "Validation error",
                    errors: errorMessages
                },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { 
                success: false,
                message: error instanceof Error ? error.message : "Failed to create service" 
            },
            { status: 500 }
        );
    }
}