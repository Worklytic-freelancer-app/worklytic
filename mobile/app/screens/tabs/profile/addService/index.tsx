import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Plus, X } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import { useMutation } from "@/hooks/tanstack/useMutation";
import { useUser } from "@/hooks/tanstack/useUser";
import { COLORS } from "@/constant/color";

// Definisikan tipe untuk data service
interface ServiceData {
    _id: string;
    title: string;
    description: string;
    price: number;
    deliveryTime: string;
    category: string;
    images: string[];
    rating: number;
    reviews: number;
    includes: string[];
    requirements: string[];
    freelancerId: string;
}

// Ubah tipe untuk request payload agar memenuhi Record<string, unknown>
type CreateServicePayload = Record<string, unknown> & {
    title: string;
    description: string;
    price: number;
    deliveryTime: string;
    category: string;
    images: string[];
    rating: number;
    reviews: number;
    includes: string[];
    requirements: string[];
    freelancerId: string;
}

export default function AddService() {
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

  // Menggunakan useUser untuk mendapatkan data user
  const { data: userData } = useUser();

  // Menggunakan useMutation dengan tipe yang tepat
  const { mutate: createService, isPending: isLoading } = useMutation<ServiceData, CreateServicePayload>({
    endpoint: 'services',
    method: 'POST',
    invalidateQueries: ['users'],
    onSuccess: () => {
      Alert.alert("Sukses", "Layanan berhasil ditambahkan", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    },
  });

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
        // Konversi semua gambar ke base64
        const base64Images = await Promise.all(
          images.map(async (uri) => {
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
        
        if (!userData?._id) {
          throw new Error('User ID tidak ditemukan');
        }
        
        // Siapkan data untuk dikirim ke API
        const serviceData = {
          freelancerId: userData._id,
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          deliveryTime: formData.deliveryTime,
          category: formData.category,
          images: base64Images, // Kirim gambar dalam format base64
          rating: 0,
          reviews: 0,
          includes: formData.includes ? formData.includes.split(',').map(item => item.trim()) : [],
          requirements: formData.requirements ? formData.requirements.split(',').map(item => item.trim()) : [],
        };
        
        // Gunakan mutation untuk membuat layanan baru
        createService(serviceData);
        
      } catch (uploadError) {
        console.error('Error during image processing:', uploadError);
        Alert.alert("Error", "Terjadi kesalahan saat memproses gambar");
      }
    } catch (error) {
      console.error('Error creating service:', error);
      Alert.alert("Error", "Terjadi kesalahan saat menambahkan layanan");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Layanan Baru</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gambar Layanan <Text style={styles.required}>*</Text></Text>
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
              <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
                <Plus size={24} color={COLORS.primary} />
                <Text style={styles.uploadText}>Upload</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

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
          style={[styles.submitButton, isLoading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.background} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Buat Layanan</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
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
  imageList: {
    flexDirection: "row",
    marginTop: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${COLORS.primary}05`,
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 8,
    fontWeight: "500",
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
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
