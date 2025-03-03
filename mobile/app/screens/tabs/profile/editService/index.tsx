import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/navigators";
import { useState, useEffect } from "react";
import { ChevronLeft, Plus, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";
import { useFetch } from "@/hooks/tanstack/useFetch";
import { useMutation } from "@/hooks/tanstack/useMutation";

type EditServiceRouteProp = RouteProp<RootStackParamList, 'EditService'>;

interface ServiceData {
    _id: string;
    title: string;
    description: string;
    price: number;
    deliveryTime: string;
    category: string;
    images: string[];
    requirements: string[];
    includes: string[];
}

export default function EditService() {
    const insets = useSafeAreaInsets();
    const route = useRoute<EditServiceRouteProp>();
    const navigation = useNavigation();
    const [images, setImages] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        deliveryTime: "",
        category: "",
        requirements: "",
        includes: "",
    });

    // Fetch service data using TanStack Query
    const { data: serviceData, isLoading: isFetching, error: fetchError } = useFetch<ServiceData>({
        endpoint: `services/${route.params?.serviceId}`,
        enabled: !!route.params?.serviceId,
    });

    // Update mutation
    const { mutate: updateService, isPending: isLoading } = useMutation<any, Partial<ServiceData>>({
        endpoint: `services/${route.params?.serviceId}`,
        method: 'PUT',
        invalidateQueries: ['services'],
        onSuccess: () => {
            Alert.alert("Sukses", "Layanan berhasil diperbarui", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        },
    });

    // Set form data when service data is fetched
    useEffect(() => {
        if (serviceData) {
            // Konversi array ke string dengan koma
            const requirementsString = serviceData.requirements.join(', ');
            const includesString = serviceData.includes.join(', ');
            
            setFormData({
                title: serviceData.title,
                description: serviceData.description,
                price: serviceData.price.toString(),
                deliveryTime: serviceData.deliveryTime,
                category: serviceData.category,
                requirements: requirementsString,
                includes: includesString,
            });
            
            setImages(serviceData.images);
        }
    }, [serviceData]);

    // Show error if fetch fails
    useEffect(() => {
        if (fetchError) {
            Alert.alert("Error", "Gagal mengambil data layanan");
        }
    }, [fetchError]);

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0].uri) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            // Validasi form
            if (!formData.title) {
                Alert.alert("Error", "Judul layanan tidak boleh kosong");
                return;
            }
            
            if (!formData.description) {
                Alert.alert("Error", "Deskripsi layanan tidak boleh kosong");
                return;
            }
            
            if (!formData.price) {
                Alert.alert("Error", "Harga layanan tidak boleh kosong");
                return;
            }
            
            if (!formData.category) {
                Alert.alert("Error", "Kategori layanan tidak boleh kosong");
                return;
            }
            
            if (!formData.deliveryTime) {
                Alert.alert("Error", "Waktu pengerjaan tidak boleh kosong");
                return;
            }
            
            if (images.length === 0) {
                Alert.alert("Error", "Mohon tambahkan minimal 1 gambar");
                return;
            }
            
            try {
                // Konversi semua gambar ke base64 (jika belum berupa URL)
                const processedImages = await Promise.all(
                    images.map(async (uri) => {
                        // Jika URI sudah berupa URL (gambar yang sudah ada di server), kembalikan saja
                        if (uri.startsWith('http')) {
                            return uri;
                        }
                        
                        // Konversi URI gambar lokal ke base64
                        const response = await fetch(uri);
                        const blob = await response.blob();
                        
                        return new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const base64data = reader.result as string;
                                resolve(base64data);
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });
                    })
                );
                
                // Siapkan data untuk dikirim ke API
                const serviceData = {
                    title: formData.title,
                    description: formData.description,
                    price: parseInt(formData.price),
                    deliveryTime: formData.deliveryTime,
                    category: formData.category,
                    images: processedImages, // Kirim gambar dalam format base64 atau URL
                    includes: formData.includes ? formData.includes.split(',').map(item => item.trim()) : [],
                    requirements: formData.requirements ? formData.requirements.split(',').map(item => item.trim()) : [],
                };
                
                // Gunakan mutation untuk update
                updateService(serviceData as Partial<ServiceData>);
                
            } catch (uploadError) {
                console.error('Error during image processing:', uploadError);
                Alert.alert("Error", "Terjadi kesalahan saat memproses gambar");
            }
        } catch (error) {
            console.error('Error updating service:', error);
            Alert.alert("Error", "Terjadi kesalahan saat memperbarui layanan");
        }
    };

    if (isFetching) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Memuat data layanan... 🔄</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Layanan</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.imageSection}>
                    <Text style={styles.sectionTitle}>Gambar Layanan</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image source={{ uri }} style={styles.image} />
                                <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(index)}>
                                    <X size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
                            <Plus size={24} color="#2563eb" />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Judul Layanan</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Pengembangan Aplikasi Mobile"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kategori</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Pengembangan & IT"
                            value={formData.category}
                            onChangeText={(text) => setFormData({ ...formData, category: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Deskripsi</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Jelaskan layanan Anda secara detail"
                            multiline
                            numberOfLines={4}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Harga (Rp)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: 5000000"
                            keyboardType="numeric"
                            value={formData.price}
                            onChangeText={(text) => setFormData({ ...formData, price: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Waktu Pengerjaan</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: 14 hari"
                            value={formData.deliveryTime}
                            onChangeText={(text) => setFormData({ ...formData, deliveryTime: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Persyaratan (pisahkan dengan koma)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Apa yang Anda butuhkan dari klien?"
                            multiline
                            numberOfLines={4}
                            value={formData.requirements}
                            onChangeText={(text) => setFormData({ ...formData, requirements: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Yang Termasuk (pisahkan dengan koma)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Apa yang akan klien terima?"
                            multiline
                            numberOfLines={4}
                            value={formData.includes}
                            onChangeText={(text) => setFormData({ ...formData, includes: text })}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.saveButton, isLoading && styles.disabledButton]} 
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    imageSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    imageList: {
        flexDirection: 'row',
    },
    imageContainer: {
        marginRight: 12,
        position: 'relative',
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    removeImage: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
    },
    addImageButton: {
        width: 120,
        height: 120,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#2563eb',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    formSection: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    saveButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#93c5fd',
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
});
