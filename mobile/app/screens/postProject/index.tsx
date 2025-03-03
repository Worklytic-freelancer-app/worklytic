import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Upload, X, DollarSign, MapPin, Tag, Calendar } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useMutation } from "@/hooks/tanstack/useMutation";
import { useUser } from "@/hooks/tanstack/useUser";
import { COLORS } from "@/constant/color";

// Kategori proyek
const PROJECT_CATEGORIES = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "Video Editing",
    "Data Analysis",
    "Other"
];

// Lokasi proyek
const PROJECT_LOCATIONS = [
    "Remote",
    "On-site",
    "Hybrid"
];

// Status proyek
const PROJECT_STATUS = [
    "Open",
    "In Progress",
    "Completed",
    "Cancelled"
];

// Definisikan interface untuk response data
interface ProjectResponse {
    _id: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    location: string;
    completedDate: Date;
    status: string;
    requirements: string[];
    image: string[];
    clientId: string;
    // tambahkan properti lain sesuai kebutuhan
}

// Definisikan interface untuk request data
interface CreateProjectRequest {
    clientId: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    location: string;
    completedDate: Date;
    status: string;
    requirements: string[];
    image: string[];
}

export default function PostProject() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    
    // Gunakan useUser untuk mendapatkan data user
    const { data: userData, isLoading: isLoadingUser } = useUser();
    
    const [form, setForm] = useState({
        title: "",
        description: "",
        budget: "",
        category: "Web Development",
        location: "Remote",
        requirements: "",
        completedDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], // Default 1 bulan dari sekarang
        status: "Open" // Default status adalah Open
    });

    // Gunakan hook useMutation dengan tipe data yang spesifik
    const createProjectMutation = useMutation<ProjectResponse, CreateProjectRequest>({
        endpoint: 'projects',
        method: 'POST',
        requiresAuth: true,
    });

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images');
                return;
            }
            
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
                base64: true,
            });
            
            if (!result.canceled && result.assets && result.assets[0].base64) {
                // Batasi jumlah gambar maksimal 5
                if (images.length >= 5) {
                    Alert.alert('Limit Reached', 'You can only upload up to 5 images');
                    return;
                }
                
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setImages([...images, base64Image]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSubmit = async () => {
        try {
            // Validasi form
            if (!form.title) {
                Alert.alert("Error", "Judul proyek harus diisi");
                return;
            }
            
            if (!form.description) {
                Alert.alert("Error", "Deskripsi proyek harus diisi");
                return;
            }
            
            if (!form.budget) {
                Alert.alert("Error", "Budget proyek harus diisi");
                return;
            }
            
            // Konversi budget ke number
            const budget = parseFloat(form.budget.replace(/[^0-9]/g, ''));
            if (isNaN(budget) || budget <= 0) {
                Alert.alert("Error", "Budget harus berupa angka positif");
                return;
            }
            
            // Cek apakah userData tersedia
            if (!userData?._id) {
                Alert.alert("Error", "Data user tidak ditemukan");
                return;
            }
            
            // Siapkan requirements sebagai array
            const requirementsArray = form.requirements
                ? form.requirements.split('\n').filter(item => item.trim() !== '')
                : [];
            
            // Navigasi ke halaman review dengan data proyek
            navigation.navigate('ReviewPostProject', {
                title: form.title,
                description: form.description,
                budget: budget,
                category: form.category,
                location: form.location,
                completedDate: form.completedDate,
                status: form.status,
                requirements: requirementsArray.join('\n'),
                images: images,
                clientId: userData._id
            });
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            Alert.alert('Error', errorMessage);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Buat Proyek Baru</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Judul Proyek <Text style={styles.required}>*</Text></Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Masukkan judul proyek" 
                            placeholderTextColor={COLORS.gray} 
                            value={form.title} 
                            onChangeText={(text) => setForm({ ...form, title: text })} 
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Deskripsi <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Jelaskan detail proyek Anda"
                            placeholderTextColor={COLORS.gray}
                            multiline
                            numberOfLines={4}
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Budget <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWithIcon}>
                            <DollarSign size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput 
                                style={[styles.input, styles.inputWithPadding]} 
                                placeholder="Masukkan budget proyek (contoh: 5000000)" 
                                placeholderTextColor={COLORS.gray} 
                                keyboardType="numeric" 
                                value={form.budget} 
                                onChangeText={(text) => setForm({ ...form, budget: text })} 
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kategori</Text>
                        <TouchableOpacity 
                            style={styles.inputWithIcon}
                            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                        >
                            <Tag size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <View style={[styles.input, styles.inputWithPadding, styles.pickerText]}>
                                <Text style={{ color: COLORS.black }}>{form.category}</Text>
                            </View>
                        </TouchableOpacity>
                        
                        {showCategoryPicker && (
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={form.category}
                                    onValueChange={(itemValue) => {
                                        setForm({ ...form, category: itemValue });
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    {PROJECT_CATEGORIES.map((category) => (
                                        <Picker.Item key={category} label={category} value={category} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Lokasi</Text>
                        <TouchableOpacity 
                            style={styles.inputWithIcon}
                            onPress={() => setShowLocationPicker(!showLocationPicker)}
                        >
                            <MapPin size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <View style={[styles.input, styles.inputWithPadding, styles.pickerText]}>
                                <Text style={{ color: COLORS.black }}>{form.location}</Text>
                            </View>
                        </TouchableOpacity>
                        
                        {showLocationPicker && (
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={form.location}
                                    onValueChange={(itemValue) => {
                                        setForm({ ...form, location: itemValue });
                                        setShowLocationPicker(false);
                                    }}
                                >
                                    {PROJECT_LOCATIONS.map((location) => (
                                        <Picker.Item key={location} label={location} value={location} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tanggal Selesai</Text>
                        <View style={styles.inputWithIcon}>
                            <Calendar size={20} color={COLORS.primary} style={styles.inputIcon} />
                            <TextInput 
                                style={[styles.input, styles.inputWithPadding]} 
                                placeholder="YYYY-MM-DD" 
                                placeholderTextColor={COLORS.gray} 
                                value={form.completedDate} 
                                onChangeText={(text) => setForm({ ...form, completedDate: text })} 
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Persyaratan</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Masukkan persyaratan proyek (satu per baris)"
                            placeholderTextColor={COLORS.gray}
                            multiline
                            numberOfLines={4}
                            value={form.requirements}
                            onChangeText={(text) => setForm({ ...form, requirements: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gambar Proyek</Text>
                        <View style={styles.imageContainer}>
                            {images.map((image, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri: image }} style={styles.imagePreview} />
                                    <TouchableOpacity 
                                        style={styles.removeImageButton}
                                        onPress={() => removeImage(index)}
                                    >
                                        <X size={16} color={COLORS.background} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            
                            {images.length < 5 && (
                                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                                    <Upload size={24} color={COLORS.primary} />
                                    <Text style={styles.uploadText}>Upload</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                <TouchableOpacity 
                    style={[
                        styles.submitButton, 
                        (loading) && styles.disabledButton
                    ]} 
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.background} size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Buat Proyek</Text>
                    )}
                </TouchableOpacity>
                
                <Text style={styles.disclaimer}>
                    Dengan membuat proyek ini, kamu setuju untuk membayar biaya yang diperlukan. 
                    Kamu akan diarahkan ke halaman pembayaran setelah pengajuan.
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.inputBackground,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.black,
    },
    formContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        color: COLORS.darkGray,
        marginBottom: 8,
    },
    required: {
        color: COLORS.error,
    },
    input: {
        backgroundColor: COLORS.inputBackground,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: COLORS.black,
    },
    inputWithIcon: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 14,
        zIndex: 1,
    },
    inputWithPadding: {
        flex: 1,
        paddingLeft: 45,
    },
    pickerText: {
        paddingTop: 14,
        paddingBottom: 14,
    },
    pickerContainer: {
        marginTop: 8,
        backgroundColor: COLORS.inputBackground,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        overflow: 'hidden',
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 12,
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
    },
    uploadText: {
        fontSize: 14,
        color: COLORS.primary,
        marginTop: 8,
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    disabledButton: {
        backgroundColor: COLORS.primaryLight,
        opacity: 0.7,
    },
    submitButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: "600",
    },
    disclaimer: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: "center",
        marginBottom: 32,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
});