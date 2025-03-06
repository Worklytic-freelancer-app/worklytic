import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/navigators";
import { useState, useEffect } from "react";
import { ChevronLeft, Plus, X, Upload, DollarSign } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { useFetch } from "@/hooks/tanstack/useFetch";
import { useMutation } from "@/hooks/tanstack/useMutation";
import { COLORS } from "@/constant/color";

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
            Alert.alert("Success", "Service updated successfully", [
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
            Alert.alert("Error", "Failed to fetch service data");
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
                Alert.alert("Error", "Service title cannot be empty");
                return;
            }
            
            if (!formData.description) {
                Alert.alert("Error", "Service description cannot be empty");
                return;
            }
            
            if (!formData.price) {
                Alert.alert("Error", "Service price cannot be empty");
                return;
            }
            
            if (!formData.category) {
                Alert.alert("Error", "Service category cannot be empty");
                return;
            }
            
            if (!formData.deliveryTime) {
                Alert.alert("Error", "Delivery time cannot be empty");
                return;
            }
            
            if (images.length === 0) {
                Alert.alert("Error", "Please add at least 1 image");
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
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Service</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Service Image <Text style={styles.required}>*</Text></Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
                            {images.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.imagePreview} />
                                    <TouchableOpacity 
                                        style={styles.removeImageButton}
                                        onPress={() => removeImage(index)}
                                    >
                                        <X size={16} color={COLORS.background} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {images.length < 5 && (
                                <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
                                    <Upload size={24} color={COLORS.primary} />
                                    <Text style={styles.uploadText}>Upload</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Service Title <Text style={styles.required}>*</Text></Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Example: Mobile Application Development"
                            placeholderTextColor={COLORS.gray}
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Example: Development & IT"
                            placeholderTextColor={COLORS.gray}
                            value={formData.category}
                            onChangeText={(text) => setFormData({ ...formData, category: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Explain your service in detail"
                            placeholderTextColor={COLORS.gray}
                            multiline
                            numberOfLines={4}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Price <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWithIcon}>
                            <DollarSign size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.inputWithPadding]}
                                placeholder="Example: 5000000"
                                placeholderTextColor={COLORS.gray}
                                keyboardType="numeric"
                                value={formData.price}
                                onChangeText={(text) => setFormData({ ...formData, price: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Delivery Time <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Example: 14 days"
                            placeholderTextColor={COLORS.gray}
                            value={formData.deliveryTime}
                            onChangeText={(text) => setFormData({ ...formData, deliveryTime: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>What's Included</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="What will the client receive? (separate with comma)"
                            placeholderTextColor={COLORS.gray}
                            multiline
                            numberOfLines={4}
                            value={formData.includes}
                            onChangeText={(text) => setFormData({ ...formData, includes: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Requirements</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="What do you need from the client? (separate with comma)"
                            placeholderTextColor={COLORS.gray}
                            multiline
                            numberOfLines={4}
                            value={formData.requirements}
                            onChangeText={(text) => setFormData({ ...formData, requirements: text })}
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, isLoading && styles.disabledButton]} 
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={COLORS.background} size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.background,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.black,
    },
    formContainer: {
        flex: 1,
    },
    card: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        margin: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.darkGray,
        marginBottom: 8,
    },
    required: {
        color: COLORS.error,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.black,
        backgroundColor: COLORS.background,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        backgroundColor: COLORS.background,
    },
    inputIcon: {
        padding: 12,
    },
    inputWithPadding: {
        flex: 1,
        borderWidth: 0,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    imageList: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    imageWrapper: {
        marginRight: 12,
        position: 'relative',
    },
    imagePreview: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
    },
    uploadButton: {
        width: 120,
        height: 120,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${COLORS.primary}05`,
    },
    uploadText: {
        marginTop: 8,
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        margin: 16,
        marginTop: 8,
    },
    submitButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: COLORS.gray,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
