import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Upload, X, DollarSign, MapPin, Clock, Tag, FileText, Calendar } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

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

export default function PostProject() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    
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
            setLoading(true);
            
            // Validasi form
            if (!form.title) {
                Alert.alert("Error", "Judul proyek harus diisi");
                setLoading(false);
                return;
            }
            
            if (!form.description) {
                Alert.alert("Error", "Deskripsi proyek harus diisi");
                setLoading(false);
                return;
            }
            
            if (!form.budget) {
                Alert.alert("Error", "Budget proyek harus diisi");
                setLoading(false);
                return;
            }
            
            // Konversi budget ke number
            const budget = parseFloat(form.budget.replace(/[^0-9]/g, ''));
            if (isNaN(budget) || budget <= 0) {
                Alert.alert("Error", "Budget harus berupa angka positif");
                setLoading(false);
                return;
            }
            
            // Ambil token
            const token = await SecureStoreUtils.getToken();
            if (!token) {
                Alert.alert("Error", "Kamu perlu login terlebih dahulu");
                setLoading(false);
                return;
            }
            
            // Ambil user data
            const userData = await SecureStoreUtils.getUserData();
            if (!userData?._id) {
                Alert.alert("Error", "Data user tidak ditemukan");
                setLoading(false);
                return;
            }
            
            // Siapkan requirements sebagai array
            const requirementsArray = form.requirements
                ? form.requirements.split('\n').filter(item => item.trim() !== '')
                : [];
            
            // Buat project
            const response = await fetch(`${baseUrl}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    clientId: userData._id,
                    title: form.title,
                    description: form.description,
                    budget: budget,
                    category: form.category,
                    location: form.location,
                    completedDate: new Date(form.completedDate),
                    status: form.status,
                    requirements: requirementsArray,
                    image: images
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data?._id) {
                // Navigasi ke halaman pembayaran dengan ID proyek
                navigation.navigate('Payment', { projectId: result.data._id });
            } else {
                throw new Error(result.message || 'Failed to create project');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#ffffff" />
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
                            placeholderTextColor="#9ca3af" 
                            value={form.title} 
                            onChangeText={(text) => setForm({ ...form, title: text })} 
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Deskripsi <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Jelaskan detail proyek Anda"
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={4}
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Budget <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputWithIcon}>
                            <DollarSign size={20} color="#6b7280" style={styles.inputIcon} />
                            <TextInput 
                                style={[styles.input, styles.inputWithPadding]} 
                                placeholder="Masukkan budget proyek (contoh: 5000000)" 
                                placeholderTextColor="#9ca3af" 
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
                            <Tag size={20} color="#6b7280" style={styles.inputIcon} />
                            <View style={[styles.input, styles.inputWithPadding, styles.pickerText]}>
                                <Text style={{ color: '#1f2937' }}>{form.category}</Text>
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
                            <MapPin size={20} color="#6b7280" style={styles.inputIcon} />
                            <View style={[styles.input, styles.inputWithPadding, styles.pickerText]}>
                                <Text style={{ color: '#1f2937' }}>{form.location}</Text>
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
                            <Calendar size={20} color="#6b7280" style={styles.inputIcon} />
                            <TextInput 
                                style={[styles.input, styles.inputWithPadding]} 
                                placeholder="YYYY-MM-DD" 
                                placeholderTextColor="#9ca3af" 
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
                            placeholderTextColor="#9ca3af"
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
                                        <X size={16} color="#ffffff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            
                            {images.length < 5 && (
                                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                                    <Upload size={24} color="#6b7280" />
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
                        <ActivityIndicator color="#ffffff" size="small" />
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
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#3b82f6",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    formContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 8,
    },
    required: {
        color: "#ef4444",
    },
    input: {
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: "#1f2937",
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
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
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
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    uploadText: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
    },
    submitButton: {
        backgroundColor: "#3b82f6",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginBottom: 16,
    },
    disabledButton: {
        backgroundColor: "#93c5fd",
    },
    submitButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    disclaimer: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 32,
        paddingHorizontal: 20,
    },
});