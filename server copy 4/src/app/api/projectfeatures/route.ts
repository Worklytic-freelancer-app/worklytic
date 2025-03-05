import { Service as ProjectFeature } from "../../../modules/ProjectFeatures/projectfeature.service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await ProjectFeature.getAll();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch projectfeatures" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await ProjectFeature.create(body);
        
        // Cek apakah operasi berhasil
        if (!result.success) {
            // Cek pesan error spesifik untuk kasus freelancer sudah melamar
            if (result.message === "Freelancer already applied to this project") {
                // Gunakan status 409 (Conflict) untuk resource yang sudah ada
                return NextResponse.json(result, { status: 409 });
            }
            
            // Untuk error lainnya, gunakan status 400 (Bad Request)
            return NextResponse.json(result, { status: 400 });
        }
        
        // Jika berhasil, kembalikan status 201 (Created)
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to create projectfeature" },
            { status: 500 }
        );
    }
}