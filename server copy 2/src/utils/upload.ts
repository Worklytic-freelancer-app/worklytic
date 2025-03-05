import cloudinary from "../config/cloudinary";
import { UploadApiOptions } from "cloudinary";

/**
 * Upload file ke Cloudinary
 * @param fileData - Base64 string file atau URL file
 * @param options - Opsi tambahan untuk upload
 * @returns Promise dengan hasil upload
 */
export const uploadToCloudinary = async (
    fileData: string,
    options: {
        folder?: string;
        publicId?: string;
        resourceType?: "auto" | "image" | "video" | "raw";
    } = {}
) => {
    try {
        console.log("Uploading file to Cloudinary...");
        
        // Deteksi tipe file dari string base64
        let resourceType = options.resourceType || 'auto';
        
        // Deteksi tipe file berdasarkan MIME type
        if (fileData.startsWith('data:')) {
            const mimeType = fileData.split(';')[0].split(':')[1];
            
            // Gambar: gunakan resource_type: 'image'
            if (mimeType.startsWith('image/')) {
                resourceType = 'image';
            }
            // Video: gunakan resource_type: 'video'
            else if (mimeType.startsWith('video/')) {
                resourceType = 'video';
            }
            // File lainnya: gunakan resource_type: 'raw'
            else {
                resourceType = 'raw';
            }
            
            console.log(`Detected MIME type: ${mimeType}, using resource_type: ${resourceType}`);
        }
        
        const uploadOptions: UploadApiOptions = {
            folder: options.folder || 'freelancer-app',
            public_id: options.publicId,
            use_filename: true,
            unique_filename: true,
            overwrite: true,
            resource_type: resourceType,
        };
        
        // Tambahkan opsi khusus untuk jenis file tertentu
        if (resourceType === 'raw') {
            // Untuk file RAW, tambahkan opsi untuk mendapatkan nama file asli
            uploadOptions.use_filename = true;
            uploadOptions.unique_filename = true;
        }
        
        console.log(`Uploading with resource_type: ${resourceType}`);
        
        const result = await cloudinary.uploader.upload(fileData, uploadOptions);
        
        console.log("Upload successful:", result.public_id);
        
        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            originalFilename: result.original_filename,
            resourceType: resourceType
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error(
            error instanceof Error 
                ? `Gagal mengupload file: ${error.message}` 
                : "Gagal mengupload file"
        );
    }
};

/**
 * Upload multiple file ke Cloudinary
 * @param fileDataArray - Array dari Base64 string file atau URL file
 * @param options - Opsi tambahan untuk upload
 * @returns Promise dengan array hasil upload
 */
export const uploadMultipleToCloudinary = async (
    fileDataArray: string[],
    options: {
        folder?: string;
        resourceType?: "auto" | "image" | "video" | "raw";
    } = {}
) => {
    try {
        console.log(`Uploading ${fileDataArray.length} files to Cloudinary...`);
        
        const uploadPromises = fileDataArray.map(fileData => {
            // Gunakan auto-detect untuk resource_type
            return uploadToCloudinary(fileData, {
                ...options,
                // Jika resourceType tidak ditentukan, akan otomatis terdeteksi di uploadToCloudinary
            });
        });
        
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
                ? `Gagal mengupload beberapa file: ${error.message}` 
                : "Gagal mengupload beberapa file"
        );
    }
};

/**
 * Hapus file dari Cloudinary
 * @param publicId - Public ID file di Cloudinary
 * @param options - Opsi tambahan untuk penghapusan
 * @returns Promise dengan hasil penghapusan
 */
export const deleteFromCloudinary = async (
    publicId: string,
    options: {
        resourceType?: "image" | "video" | "raw";
    } = {}
) => {
    try {
        console.log(`Deleting file from Cloudinary: ${publicId}`);
        
        const resourceType = options.resourceType || 'image';
        
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        
        return {
            success: result === "ok",
            result
        };
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw new Error(
            error instanceof Error 
                ? `Gagal menghapus file: ${error.message}` 
                : "Gagal menghapus file"
        );
    }
};

/**
 * Mendapatkan tipe MIME dari ekstensi file
 * @param filename - Nama file dengan ekstensi
 * @returns Tipe MIME yang sesuai
 */
export const getMimeTypeFromFilename = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    // Map ekstensi ke tipe MIME
    const mimeTypes: Record<string, string> = {
        // Gambar
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        
        // Video
        'mp4': 'video/mp4',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'wmv': 'video/x-ms-wmv',
        'flv': 'video/x-flv',
        'webm': 'video/webm',
        
        // Audio
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'flac': 'audio/flac',
        
        // Dokumen
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        
        // Arsip
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        'tar': 'application/x-tar',
        'gz': 'application/gzip',
        
        // Teks
        'txt': 'text/plain',
        'csv': 'text/csv',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        
        // Lainnya
        'json': 'application/json',
        'xml': 'application/xml',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
};