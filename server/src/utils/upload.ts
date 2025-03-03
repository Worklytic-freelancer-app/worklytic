import cloudinary from "../config/cloudinary";

/**
 * Upload gambar ke Cloudinary
 * @param imageData - Base64 string gambar atau URL gambar
 * @param options - Opsi tambahan untuk upload
 * @returns Promise dengan hasil upload
 */
export const uploadToCloudinary = async (
    imageData: string,
    options: {
        folder?: string;
        publicId?: string;
    } = {}
) => {
    try {
        console.log("Uploading file to Cloudinary...");
        
        const uploadOptions = {
            folder: options.folder || 'freelancer-app',
            public_id: options.publicId,
            use_filename: true,
            unique_filename: true,
            overwrite: true,
        };
        
        const result = await cloudinary.uploader.upload(imageData, uploadOptions);
        
        console.log("Upload successful:", result.public_id);
        
        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error(
            error instanceof Error 
                ? `Gagal mengupload gambar: ${error.message}` 
                : "Gagal mengupload gambar"
        );
    }
};

/**
 * Upload multiple gambar ke Cloudinary
 * @param imageDataArray - Array dari Base64 string gambar atau URL gambar
 * @param options - Opsi tambahan untuk upload
 * @returns Promise dengan array hasil upload
 */
export const uploadMultipleToCloudinary = async (
    imageDataArray: string[],
    options: {
        folder?: string;
    } = {}
) => {
    try {
        console.log(`Uploading ${imageDataArray.length} files to Cloudinary...`);
        
        const uploadPromises = imageDataArray.map(imageData => 
            uploadToCloudinary(imageData, options)
        );
        
        const results = await Promise.all(uploadPromises);
        
        console.log(`Successfully uploaded ${results.length} files`);
        
        return {
            success: true,
            urls: results.map(result => result.url),
            results
        };
    } catch (error) {
        console.error("Multiple Cloudinary upload error:", error);
        throw new Error(
            error instanceof Error 
                ? `Gagal mengupload beberapa gambar: ${error.message}` 
                : "Gagal mengupload beberapa gambar"
        );
    }
};

/**
 * Hapus gambar dari Cloudinary
 * @param publicId - Public ID gambar di Cloudinary
 * @returns Promise dengan hasil penghapusan
 */
export const deleteFromCloudinary = async (publicId: string) => {
    try {
        console.log(`Deleting file from Cloudinary: ${publicId}`);
        
        const result = await cloudinary.uploader.destroy(publicId);
        
        return {
            success: result === "ok",
            result
        };
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw new Error(
            error instanceof Error 
                ? `Gagal menghapus gambar: ${error.message}` 
                : "Gagal menghapus gambar"
        );
    }
};