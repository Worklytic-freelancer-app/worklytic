import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Camera, X, Globe, Briefcase, Mail, Phone } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "@/hooks/useUser";
import * as ImagePicker from 'expo-image-picker';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60";

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    profileImage: user?.profileImage || DEFAULT_IMAGE,
    location: user?.location || "",
    about: user?.about || "",
    phone: user?.phone || "",
    website: user?.website || "",
    skills: user?.skills || [],
    companyName: user?.companyName || "",
    industry: user?.industry || "",
  });

  const [newSkill, setNewSkill] = useState("");

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        // Di sini nanti akan diintegrasikan dengan Cloudinary
        setFormData({ ...formData, profileImage: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Error", "Gagal memilih gambar");
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

  const handleSave = () => {
    // Implementasi penyimpanan data akan ditambahkan nanti
    Alert.alert("Sukses", "Profil berhasil diperbarui");
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: formData.profileImage }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
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
            <Text style={styles.label}>Website</Text>
            <View style={styles.inputWithIcon}>
              <Globe size={20} color="#6b7280" />
              <TextInput
                style={[styles.input, styles.inputIcon]}
                value={formData.website}
                onChangeText={(text) => setFormData({ ...formData, website: text })}
                placeholder="Masukkan website"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Profesional</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tentang</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.about}
              onChangeText={(text) => setFormData({ ...formData, about: text })}
              placeholder={user?.role === "freelancer" ? 
                "Ceritakan tentang pengalaman dan keahlian Anda" : 
                "Ceritakan tentang perusahaan Anda"}
              multiline
              numberOfLines={4}
            />
          </View>

          {user?.role === "freelancer" ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Keahlian</Text>
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
                  placeholder="Tambah keahlian"
                />
              </View>
            </View>
          ) : (
            <View>
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
                  placeholder="Masukkan jenis industri"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.saveButtonContainer} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  saveButtonContainer: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});