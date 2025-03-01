import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from "react-native";
import { Paperclip, Send, Image as ImageIcon, FileText, X } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface Attachment {
    id: string;
    type: 'image' | 'document';
    url: string;
    name: string;
    date: string;
    size?: string;
}

interface InputProps {
    userRole: 'client' | 'freelancer';
    onSendUpdate: (content: string, attachments: Attachment[]) => void;
    sendingUpdate: boolean;
}

export default function Input({ userRole, onSendUpdate, sendingUpdate }: InputProps) {
    const [newUpdate, setNewUpdate] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const newAttachment: Attachment = {
                id: `temp-img-${Date.now()}`,
                type: 'image',
                url: asset.uri,
                name: asset.fileName || `image-${Date.now()}.jpg`,
                date: new Date().toLocaleDateString(),
            };
            setAttachments([...attachments, newAttachment]);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const newAttachment: Attachment = {
                    id: `temp-doc-${Date.now()}`,
                    type: 'document',
                    url: asset.uri,
                    name: asset.name,
                    date: new Date().toLocaleDateString(),
                    size: formatFileSize(asset.size || 0),
                };
                setAttachments([...attachments, newAttachment]);
            }
        } catch (error) {
            console.error('Error picking document:', error);
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

    const handleSendUpdate = () => {
        if (newUpdate.trim() || attachments.length > 0) {
            onSendUpdate(newUpdate, attachments);
            setNewUpdate('');
            setAttachments([]);
        }
    };

    const renderAttachment = (attachment: Attachment) => (
        <View key={attachment.id} style={styles.attachmentItem}>
            <View style={styles.attachmentContent}>
                {attachment.type === 'image' ? (
                    <ImageIcon size={20} color="#4B5563" />
                ) : (
                    <FileText size={20} color="#4B5563" />
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

    // Render input berbeda untuk client dan freelancer
    if (userRole === 'client') {
        return (
            <View style={styles.clientInputContainer}>
                <View style={styles.clientInputWrapper}>
                    <TextInput
                        style={styles.clientInput}
                        placeholder="Tulis pesan..."
                        value={newUpdate}
                        onChangeText={setNewUpdate}
                    />
                    <TouchableOpacity 
                        style={[
                            styles.clientSendButton, 
                            !newUpdate.trim() || sendingUpdate ? styles.sendButtonDisabled : {}
                        ]} 
                        onPress={handleSendUpdate}
                        disabled={!newUpdate.trim() || sendingUpdate}
                    >
                        <Send size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Render input untuk freelancer (dengan attachment)
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
                            <ImageIcon size={20} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
                            <Paperclip size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                        style={[
                            styles.sendButton, 
                            (!newUpdate.trim() && attachments.length === 0) || sendingUpdate ? styles.sendButtonDisabled : {}
                        ]} 
                        onPress={handleSendUpdate}
                        disabled={(!newUpdate.trim() && attachments.length === 0) || sendingUpdate}
                    >
                        <Send size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Styles untuk client input (simpel dengan tombol send di sebelah kanan)
    clientInputContainer: {
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        padding: 16,
    },
    clientInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingLeft: 16,
        paddingRight: 4,
        paddingVertical: 4,
    },
    clientInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 8,
    },
    clientSendButton: {
        backgroundColor: "#2563EB",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    
    // Styles untuk freelancer input (dengan attachment)
    addUpdateContainer: {
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
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
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    attachmentContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    attachmentDetails: {
        marginLeft: 12,
        flex: 1,
    },
    attachmentName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
    },
    attachmentMeta: {
        fontSize: 12,
        color: "#6B7280",
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
        backgroundColor: "#2563EB",
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