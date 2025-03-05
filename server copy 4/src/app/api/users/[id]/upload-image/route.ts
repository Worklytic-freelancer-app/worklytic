import { NextRequest, NextResponse } from "next/server";
import { Service as User } from "../../../../../modules/Users/user.service";

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
                    : "Failed to update profile image" 
            },
            { status: 500 }
        );
    }
}