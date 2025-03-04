import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Alert } from "react-native";
import { Paperclip, Send, Image as ImageIcon, FileText, X } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { COLORS } from "@/constant/color";

// Export interface Attachment agar bisa digunakan di file lain
export interface Attachment {
    id: string;
    type: 'image' | 'document';
    url: string;
    name: string;
    date: string;
    size?: string;
}

interface InputProps {
    onSend: (content: string, attachments: Attachment[]) => Promise<void>;
    loading: boolean;
}

export default function Input({ onSend, loading }: InputProps) {
    const [newUpdate, setNewUpdate] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsEditing: true,
                quality: 0.5, // Kurangi kualitas untuk mengurangi ukuran
                base64: true, // Gunakan base64 langsung dari ImagePicker
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                
                if (!asset.base64) {
                    Alert.alert("Error", "Gagal mendapatkan data gambar");
                    return;
                }
                
                // Buat base64 string dengan format yang benar
                const base64Image = `data:image/jpeg;base64,${asset.base64}`;
                
                const newAttachment: Attachment = {
                    id: `temp-img-${Date.now()}`,
                    type: 'image',
                    url: base64Image,
                    name: asset.fileName || `image-${Date.now()}.jpg`,
                    date: new Date().toLocaleDateString(),
                };
                
                setAttachments(prev => [...prev, newAttachment]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert("Error", "Gagal memilih gambar");
        }
    };

    const pickDocument = async () => {
        try {
            // Izinkan PDF dan ZIP
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "application/zip", "application/x-zip-compressed"],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                
                // Periksa ukuran file (batasi hingga 5MB)
                if (asset.size && asset.size > 5 * 1024 * 1024) {
                    Alert.alert("File terlalu besar", "Ukuran file maksimal adalah 5MB");
                    return;
                }
                
                try {
                    // Baca file sebagai base64
                    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    
                    // Tentukan tipe MIME berdasarkan ekstensi file
                    const fileExtension = asset.name.split('.').pop()?.toLowerCase() || '';
                    let mimeType = 'application/octet-stream'; // Default
                    
                    if (fileExtension === 'pdf') {
                        mimeType = 'application/pdf';
                    } else if (fileExtension === 'zip') {
                        mimeType = 'application/zip';
                    }
                    
                    // Buat base64 string dengan format yang benar
                    const base64File = `data:${mimeType};base64,${base64}`;
                    
                    const newAttachment: Attachment = {
                        id: `temp-doc-${Date.now()}`,
                        type: 'document',
                        url: base64File,
                        name: asset.name,
                        date: new Date().toLocaleDateString(),
                        size: formatFileSize(asset.size || 0),
                    };
                    
                    setAttachments(prev => [...prev, newAttachment]);
                } catch (readError) {
                    console.error('Error reading file:', readError);
                    Alert.alert("Error", "Gagal membaca file");
                }
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert("Error", "Gagal memilih dokumen");
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const removeAttachment = (id: string) => {
        setAttachments(attachments.filter(attachment => attachment.id !== id));
    };

    const handleSendUpdate = async () => {
        if (newUpdate.trim() || attachments.length > 0) {
            try {
                await onSend(newUpdate, attachments);
                setNewUpdate('');
                setAttachments([]);
            } catch (error) {
                console.error('Error sending update:', error);
                Alert.alert(
                    "Gagal Mengirim", 
                    "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi."
                );
            }
        }
    };

    const renderAttachment = (attachment: Attachment) => (
        <View key={attachment.id} style={styles.attachmentItem}>
            <View style={styles.attachmentContent}>
                {attachment.type === 'image' ? (
                    <View style={styles.attachmentIconContainer}>
                        <ImageIcon size={20} color={COLORS.primary} />
                    </View>
                ) : (
                    <View style={styles.attachmentIconContainer}>
                        <FileText size={20} color={COLORS.primary} />
                    </View>
                )}
                <View style={styles.attachmentDetails}>
                    <Text style={styles.attachmentName} numberOfLines={1}>{attachment.name}</Text>
                    <Text style={styles.attachmentMeta}>
                        {attachment.size ? `${attachment.size} • ` : ''}
                        {attachment.date}
                    </Text>
                </View>
            </View>
            <TouchableOpacity 
                style={styles.removeButton} 
                onPress={() => removeAttachment(attachment.id)}
            >
                <X size={16} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.addUpdateContainer}>
            {attachments.length > 0 && (
                <View style={styles.selectedAttachments}>
                    {attachments.map(renderAttachment)}
                </View>
            )}
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.updateInput}
                    placeholder="Tulis update atau pesan..."
                    multiline
                    value={newUpdate}
                    onChangeText={setNewUpdate}
                />
                
                <View style={styles.inputActions}>
                    <View style={styles.attachButtons}>
                        <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
                            <ImageIcon size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
                            <Paperclip size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                        style={[
                            styles.sendButton, 
                            (!newUpdate.trim() && attachments.length === 0) || loading ? styles.sendButtonDisabled : {}
                        ]} 
                        onPress={handleSendUpdate}
                        disabled={(!newUpdate.trim() && attachments.length === 0) || loading}
                    >
                        <Send size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    addUpdateContainer: {
        padding: 16,
    },
    selectedAttachments: {
        gap: 8,
        marginBottom: 12,
    },
    attachmentItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: 'rgba(243, 244, 246, 0.7)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    attachmentContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    attachmentIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(8, 145, 178, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachmentDetails: {
        marginLeft: 12,
        flex: 1,
    },
    attachmentName: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.black,
    },
    attachmentMeta: {
        fontSize: 12,
        color: COLORS.gray,
    },
    removeButton: {
        padding: 4,
    },
    inputContainer: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
    },
    updateInput: {
        padding: 12,
        fontSize: 14,
        maxHeight: 100,
    },
    inputActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    attachButtons: {
        flexDirection: "row",
        gap: 12,
    },
    attachButton: {
        padding: 4,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "#93C5FD",
    },
});