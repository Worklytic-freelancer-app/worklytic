import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Camera, X } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';

export default function PostProject() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
    location: "",
    duration: "",
    requirements: "",
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.budget || !form.category || !form.location || !form.duration || !form.requirements) {
      Alert.alert("Error", "Mohon lengkapi semua field");
      return;
    }
    
    navigation.navigate('ReviewPostProject', {
      ...form,
      images
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Project</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.projectImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <X size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Camera size={32} color="#6B7280" />
              <Text style={styles.uploadText}>Upload Project Images</Text>
              <Text style={styles.uploadSubtext}>Tap to browse files</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Project Title</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter a clear title for your project" 
              placeholderTextColor="#9ca3af" 
              value={form.title} 
              onChangeText={(text) => setForm({ ...form, title: text })} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g., Web Development, Mobile App, UI/UX Design" 
              placeholderTextColor="#9ca3af" 
              value={form.category} 
              onChangeText={(text) => setForm({ ...form, category: text })} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your project requirements in detail"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1, { marginRight: 8 }]}>
              <Text style={styles.label}>Budget (Rp)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g., 5000000" 
                placeholderTextColor="#9ca3af" 
                keyboardType="numeric"
                value={form.budget} 
                onChangeText={(text) => setForm({ ...form, budget: text })} 
              />
            </View>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Duration</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g., 2 months" 
                placeholderTextColor="#9ca3af" 
                value={form.duration} 
                onChangeText={(text) => setForm({ ...form, duration: text })} 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g., Remote, Jakarta, On-site" 
              placeholderTextColor="#9ca3af" 
              value={form.location} 
              onChangeText={(text) => setForm({ ...form, location: text })} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Requirements</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="List specific requirements or skills needed"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              value={form.requirements}
              onChangeText={(text) => setForm({ ...form, requirements: text })}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Lanjutkan</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
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
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  formContainer: {
    flex: 1,
  },
  imageSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  uploadButton: {
    height: 200,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  projectImage: {
    width: 280,
    height: 160,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  formSection: {
    padding: 16,
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
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  flex1: {
    flex: 1,
  },
  submitButton: {
    margin: 16,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
