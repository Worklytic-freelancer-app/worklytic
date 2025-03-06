import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Camera, X, Globe, Briefcase, Mail, Phone } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from "@/hooks/tanstack/useMutation";
import { useUser } from "@/hooks/tanstack/useUser";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { COLORS } from "@/constant/color";

const DEFAULT_IMAGE = "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg";

// Definisikan tipe untuk data user
interface User {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
    location: string;
    about: string;
    phone: string;
    website: string;
    skills: string[];
    companyName: string;
    industry: string;
    role: string;
}

// Tipe untuk update profile request
interface UpdateProfileRequest {
    fullName: string;
    location: string;
    about: string;
    phone: string;
    website: string;
    skills: string[];
    companyName: string;
    industry: string;
}

// Tipe untuk update image request
interface UpdateImageRequest {
    image: string;
}

export default function EditProfile() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [imageLoading, setImageLoading] = useState(false);
    
    // Gunakan useUser hook untuk mendapatkan data user
    const { data: userData, isLoading: userLoading, refetch: refetchUser } = useUser();
    
    const [formData, setFormData] = useState({
        _id: "",
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

    // Mutation untuk update profile
    const updateProfile = useMutation<User, Record<string, unknown>>({
        endpoint: `users/${formData._id || ''}`,
        method: 'PUT',
        requiresAuth: true,
        onSuccess: async (data) => {
            // Refresh data user
            refetchUser();
            
            Alert.alert("Sukses", "Profil berhasil diperbarui", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        },
        invalidateQueries: ['user']
    });

    // Mutation untuk update profile image
    const updateProfileImage = useMutation<User, Record<string, unknown>>({
        endpoint: `users/${formData._id}/upload-image`,
        method: 'PATCH',
        requiresAuth: true,
        onSuccess: async (data) => {
            // Update profileImage di formData dengan URL dari server
            setFormData(prev => ({
                ...prev,
                profileImage: data.profileImage,
            }));
            
            // Refresh data user
            refetchUser();
            
            Alert.alert("Success", "Profile image updated successfully");
        },
        invalidateQueries: ['user']
    });

    // Gunakan useEffect untuk mengisi formData saat userData tersedia
    useEffect(() => {
        if (userData) {
            setFormData({
                _id: userData._id || "",
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
    }, [userData]);

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
                
                // Tampilkan gambar yang dipilih sementara
                setFormData(prev => ({
                    ...prev,
                    profileImage: result.assets[0].uri
                }));

                try {
                    // Gunakan mutation untuk update gambar
                    await updateProfileImage.mutateAsync({
                        image: `data:image/jpeg;base64,${result.assets[0].base64}`,
                    });
                } catch (error) {
                    console.error("Error uploading image:", error);
                    Alert.alert("Error", "Failed to upload profile image");
                    
                    // Reset ke data user asli jika gagal
                    if (userData) {
                        setFormData(prev => ({
                            ...prev,
                            profileImage: userData.profileImage || DEFAULT_IMAGE
                        }));
                    }
                }
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image");
        } finally {
            setImageLoading(false);
        }
    };

    const handleSaveProfile = () => {
        updateProfile.mutate({
            fullName: formData.fullName,
            location: formData.location,
            about: formData.about,
            phone: formData.phone,
            website: formData.website,
            skills: formData.skills,
            companyName: formData.companyName,
            industry: formData.industry,
        });
    };

    // Tampilkan loading jika data user masih dimuat
    if (userLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2563eb" />
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
                    <ChevronLeft size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSaveProfile} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? (
                        <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                        <Text style={styles.saveButton}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.imageContainer}>
                    <View style={styles.imageWrapper}>
                        <ImageWithSkeleton 
                            source={{ 
                                uri: formData.profileImage || 
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random` 
                            }}
                            style={styles.profileImage}
                            skeletonStyle={{ 
                                width: 120, 
                                height: 120, 
                                borderRadius: 60,
                                backgroundColor: `${COLORS.primary}10` 
                            }}
                        />
                        <TouchableOpacity 
                            style={styles.cameraButton}
                            onPress={handleImagePick}
                            disabled={imageLoading}
                        >
                            <Camera size={20} color={COLORS.background} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.fullName}
                            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                            placeholder="Enter your full name"
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
                                placeholder="Enter your email"
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputWithIcon}>
                            <Phone size={20} color="#6b7280" />
                            <TextInput
                                style={[styles.input, styles.inputIcon]}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.location}
                            onChangeText={(text) => setFormData({ ...formData, location: text })}
                            placeholder="Enter your location"
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
                                placeholder="Enter your website URL"
                                keyboardType="url"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About Me</Text>
                    <View style={styles.formGroup}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.about}
                            onChangeText={(text) => setFormData({ ...formData, about: text })}
                            placeholder="Tell us about yourself, your experience, and your skills"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                {userRole === "freelancer" && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
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
                                placeholder="Add your skill"
                            />
                            <TouchableOpacity style={styles.addButton} onPress={handleAddSkill}>
                                <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {userRole === "client" && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Company Information</Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Company Name</Text>
                            <View style={styles.inputWithIcon}>
                                <Briefcase size={20} color="#6b7280" />
                                <TextInput
                                    style={[styles.input, styles.inputIcon]}
                                    value={formData.companyName}
                                    onChangeText={(text) => setFormData({ ...formData, companyName: text })}
                                    placeholder="Enter your company name"
                                />
                            </View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Industry</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.industry}
                                onChangeText={(text) => setFormData({ ...formData, industry: text })}
                                placeholder="Enter your industry"
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
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        fontWeight: "600",
        color: COLORS.black,
    },
    saveButton: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.primary,
    },
    content: {
        flex: 1,
        padding: 20,
        backgroundColor: `${COLORS.primary}05`,
    },
    imageContainer: {
        alignItems: "center",
        marginVertical: 24,
        marginBottom: 50,
    },
    imageWrapper: {
        position: 'relative',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.inputBackground,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: COLORS.background,
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.darkGray,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: COLORS.black,
        backgroundColor: COLORS.inputBackground,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    skillItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: `${COLORS.primary}15`,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    skillText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: "500",
    },
    addSkillContainer: {
        flexDirection: "row",
        gap: 8,
    },
    skillInput: {
        flex: 1,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: "center",
    },
    addButtonText: {
        color: COLORS.background,
        fontSize: 14,
        fontWeight: "600",
    },
    section: {
        marginBottom: 24,
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.black,
        marginBottom: 20,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        backgroundColor: COLORS.inputBackground,
    },
    inputIcon: {
        flex: 1,
        marginLeft: 8,
        borderWidth: 0,
        padding: 14,
    },
});