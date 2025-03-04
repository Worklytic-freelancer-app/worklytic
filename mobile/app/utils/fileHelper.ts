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