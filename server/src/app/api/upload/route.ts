import { NextResponse } from "next/server";
import { uploadImage } from "../../../utils/cloudinary";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;
    
    if (!image) {
      return NextResponse.json(
        { success: false, message: "Image data is required" },
        { status: 400 }
      );
    }
    
    console.log("Uploading image to Cloudinary...");
    
    // Upload gambar ke Cloudinary
    const imageUrl = await uploadImage(image);
    
    console.log("Image uploaded successfully:", imageUrl);
    
    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      data: imageUrl
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to upload image" 
      },
      { status: 500 }
    );
  }
} 