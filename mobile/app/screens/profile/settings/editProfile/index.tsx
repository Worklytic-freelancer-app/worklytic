import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Camera, X, Globe, Briefcase, Mail, Phone } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";

const DEFAULT_IMAGE = "https://via.placeholder.com/150";

export default function EditProfile() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        profileImage: DEFAULT_IMAGE,
        location: "",
        about: "",
        phone: "",
        website: "",
        skills: [] as string[],
        companyName: "",
        industry: "",
    });

    const [newSkill, setNewSkill] = useState("");
    const [userRole, setUserRole] = useState("freelancer");

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await SecureStoreUtils.getUserData();
            if (userData) {
                setFormData({
                    fullName: userData.fullName || "",
                    email: userData.email || "",
                    profileImage: userData.profileImage || DEFAULT_IMAGE,
                    location: userData.location || "",
                    about: userData.about || "",
                    phone: userData.phone || "",
                    website: userData.website || "",
                    skills: userData.skills || [],
                    companyName: userData.companyName || "",
                    industry: userData.industry || "",
                });
                setUserRole(userData.role || "freelancer");
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            Alert.alert("Error", "Gagal memuat data pengguna");
        }
    };

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            });
            setNewSkill("");
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
                setImageLoading(true);
                const token = await SecureStoreUtils.getToken();
                const userData = await SecureStoreUtils.getUserData();
                
                // Tampilkan gambar yang dipilih sementara
                setFormData(prev => ({
                    ...prev,
                    profileImage: result.assets[0].uri
                }));

                try {
                    // Kirim gambar ke server dengan PATCH request
                    const response = await fetch(`${baseUrl}/api/users/${userData._id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            image: `data:image/jpeg;base64,${result.assets[0].base64}`,
                        }),
                    });

                    const data = await response.json();

                    if (data.success) {
                        // Update profileImage di formData dengan URL dari server
                        setFormData(prev => ({
                            ...prev,
                            profileImage: data.data.profileImage,
                        }));
                        
                        // Update data user di SecureStore
                        const currentUserData = await SecureStoreUtils.getUserData();
                        await SecureStoreUtils.setAuthData({
                            token: token || "",
                            user: {
                                ...currentUserData,
                                profileImage: data.data.profileImage
                            }
                        });
                        
                        Alert.alert("Sukses", "Foto profil berhasil diperbarui");
                    } else {
                        Alert.alert("Error", "Gagal mengupload foto profil");
                        // Kembalikan gambar profil ke yang sebelumnya
                        loadUserData();
                    }
                } catch (error) {
                    console.error("Error uploading image:", error);
                    Alert.alert("Error", "Gagal mengupload foto profil");
                    loadUserData();
                }
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Gagal memilih gambar");
        } finally {
            setImageLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            const token = await SecureStoreUtils.getToken();
            const userData = await SecureStoreUtils.getUserData();
            
            // Kirim data profil ke server dengan PUT request
            const response = await fetch(`${baseUrl}/api/users/${userData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    location: formData.location,
                    about: formData.about,
                    phone: formData.phone,
                    website: formData.website,
                    skills: formData.skills,
                    companyName: formData.companyName,
                    industry: formData.industry,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Update data user di SecureStore
                await SecureStoreUtils.setAuthData({
                    token: token || "",
                    user: {
                        ...userData,
                        ...formData
                    }
                });
                
                Alert.alert("Sukses", "Profil berhasil diperbarui", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", "Gagal memperbarui profil");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", "Gagal menyimpan profil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSaveProfile} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                        <Text style={styles.saveButton}>Simpan</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.imageContainer}>
                    {imageLoading ? (
                        <View style={[styles.profileImage, styles.loadingImage]}>
                            <ActivityIndicator size="large" color="#2563eb" />
                        </View>
                    ) : (
                        <Image 
                            source={{ uri: formData.profileImage }}
                            style={styles.profileImage}
                        />
                    )}
                    <TouchableOpacity 
                        style={styles.cameraButton}
                        onPress={handleImagePick}
                        disabled={imageLoading}
                    >
                        <Camera size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informasi Dasar</Text>
                    
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nama Lengkap</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.fullName}
                            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                            placeholder="Masukkan nama lengkap"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWithIcon}>
                            <Mail size={20} color="#6b7280" />
                            <TextInput
                                style={[styles.input, styles.inputIcon]}
                                value={formData.email}
                                editable={false}
                                placeholder="Email"
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nomor Telepon</Text>
                        <View style={styles.inputWithIcon}>
                            <Phone size={20} color="#6b7280" />
                            <TextInput
                                style={[styles.input, styles.inputIcon]}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="Masukkan nomor telepon"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Lokasi</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.location}
                            onChangeText={(text) => setFormData({ ...formData, location: text })}
                            placeholder="Masukkan lokasi Anda"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Website</Text>
                        <View style={styles.inputWithIcon}>
                            <Globe size={20} color="#6b7280" />
                            <TextInput
                                style={[styles.input, styles.inputIcon]}
                                value={formData.website}
                                onChangeText={(text) => setFormData({ ...formData, website: text })}
                                placeholder="Masukkan URL website"
                                keyboardType="url"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tentang Saya</Text>
                    <View style={styles.formGroup}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.about}
                            onChangeText={(text) => setFormData({ ...formData, about: text })}
                            placeholder="Ceritakan tentang diri Anda, pengalaman, dan keahlian"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                {userRole === "freelancer" && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Keahlian</Text>
                        <View style={styles.skillsContainer}>
                            {formData.skills.map((skill, index) => (
                                <View key={index} style={styles.skillItem}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                    <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                                        <X size={16} color="#4b5563" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <View style={styles.addSkillContainer}>
                            <TextInput
                                style={[styles.input, styles.skillInput]}
                                value={newSkill}
                                onChangeText={setNewSkill}
                                placeholder="Tambahkan keahlian"
                            />
                            <TouchableOpacity style={styles.addButton} onPress={handleAddSkill}>
                                <Text style={styles.addButtonText}>Tambah</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {userRole === "client" && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informasi Perusahaan</Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nama Perusahaan</Text>
                            <View style={styles.inputWithIcon}>
                                <Briefcase size={20} color="#6b7280" />
                                <TextInput
                                    style={[styles.input, styles.inputIcon]}
                                    value={formData.companyName}
                                    onChangeText={(text) => setFormData({ ...formData, companyName: text })}
                                    placeholder="Masukkan nama perusahaan"
                                />
                            </View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Industri</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.industry}
                                onChangeText={(text) => setFormData({ ...formData, industry: text })}
                                placeholder="Masukkan industri perusahaan"
                            />
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    saveButton: {
        fontSize: 16,
        fontWeight: "500",
        color: "#2563eb",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    loadingImage: {
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center",
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: "35%",
        backgroundColor: "#2563eb",
        padding: 8,
        borderRadius: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#111827",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    skillItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    skillText: {
        fontSize: 14,
        color: "#374151",
    },
    addSkillContainer: {
        flexDirection: "row",
        gap: 8,
    },
    skillInput: {
        flex: 1,
    },
    addButton: {
        backgroundColor: "#2563eb",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: "center",
    },
    addButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    inputIcon: {
        flex: 1,
        marginLeft: 8,
        borderWidth: 0,
        padding: 12,
    },
});