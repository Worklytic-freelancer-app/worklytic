import { Service as User } from "../../../../modules/Users/user.service";
import { NextResponse, NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await User.getById(id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch user" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const result = await User.update(id, body);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to update user" },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await User.delete(id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to delete user" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const contentType = req.headers.get('content-type') || '';
        
        let imageData: string | undefined;
        
        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('image') as File;
            
            if (!file) {
                return NextResponse.json(
                    { success: false, message: "Image file is required" },
                    { status: 400 }
                );
            }
            
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString('base64');
            
            const mimeType = file.type || 'image/jpeg';
            imageData = `data:${mimeType};base64,${base64}`;
        } else {
            try {
                const body = await req.json();
                imageData = body.image;
                
                if (!imageData) {
                    return NextResponse.json(
                        { success: false, message: "Image data is required" },
                        { status: 400 }
                    );
                }
            } catch (error) {
                console.error('Error parsing JSON body:', error);
                return NextResponse.json(
                    { success: false, message: "Invalid JSON body" },
                    { status: 400 }
                );
            }
        }
        
        if (imageData) {
            const result = await User.updateProfileImage(id, imageData);
            return NextResponse.json(result);
        }
        
        return NextResponse.json(
            { success: false, message: "No image data provided" },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error updating profile image:', error);
        return NextResponse.json(
            { 
                success: false,
                message: error instanceof Error 
                    ? error.message 
                    : "Gagal memperbarui gambar profil" 
            },
            { status: 500 }
        );
    }
}