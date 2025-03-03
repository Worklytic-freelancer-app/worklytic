import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Plus, X } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";
import { useMutation } from "@/hooks/tanstack/useMutation";
import { useUser } from "@/hooks/tanstack/useUser";

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

  // Menggunakan useMutation untuk menambahkan layanan
  const { mutate: createService, isPending: isLoading } = useMutation<any, any>({
    endpoint: 'services',
    method: 'POST',
    invalidateQueries: ['services/my-services'],
    onSuccess: () => {
      Alert.alert("Sukses", "Layanan berhasil ditambahkan", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    },
  });

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  // Fungsi untuk mengupload gambar ke Cloudinary
  const uploadImageToCloudinary = async (uri: string) => {
    try {
      // Konversi URI gambar ke base64
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64data = reader.result as string;
            const base64Content = base64data.split(',')[1];
            
            // Kirim ke endpoint upload di server
            const token = await SecureStoreUtils.getToken();
            const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ image: `data:image/jpeg;base64,${base64Content}` })
            });
            
            const uploadResult = await uploadResponse.json();
            if (uploadResult.success) {
              resolve(uploadResult.data);
            } else {
              reject(new Error(uploadResult.message || 'Gagal mengupload gambar'));
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Gagal mengupload gambar');
    }
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
      
      // Upload semua gambar ke Cloudinary
      try {
        const uploadPromises = images.map(image => uploadImageToCloudinary(image));
        const uploadedImageUrls = await Promise.all(uploadPromises);
        
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
          images: uploadedImageUrls,
          rating: 0,
          reviews: 0,
          includes: formData.includes ? formData.includes.split(',').map(item => item.trim()) : [],
          requirements: formData.requirements ? formData.requirements.split(',').map(item => item.trim()) : [],
        };
        
        // Gunakan mutation untuk membuat layanan baru
        createService(serviceData);
        
      } catch (uploadError) {
        console.error('Error during upload:', uploadError);
        Alert.alert("Error", "Terjadi kesalahan saat mengupload gambar");
      }
    } catch (error) {
      console.error('Error creating service:', error);
      Alert.alert("Error", "Terjadi kesalahan saat menambahkan layanan");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Layanan Baru</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
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
          style={[styles.submitButton, isLoading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  imageList: {
    flexDirection: "row",
  },
  imageContainer: {
    marginRight: 12,
    position: "relative",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeImage: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 4,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#2563eb",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  formSection: {
    padding: 20,
  },
  inputGroup: {
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#93c5fd",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
