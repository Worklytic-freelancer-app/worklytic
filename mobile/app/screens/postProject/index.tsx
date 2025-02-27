import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

export default function PostProject() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
    location: "",
    duration: "",
    requirements: "",
  });

  const handleSubmit = () => {
    // Handle form submission here
    console.log(form);
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
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Project Title</Text>
          <TextInput style={styles.input} placeholder="Enter project title" placeholderTextColor="#9ca3af" value={form.title} onChangeText={(text) => setForm({ ...form, title: text })} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your project in detail"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Budget</Text>
          <TextInput style={styles.input} placeholder="Enter project budget (e.g., Rp 37.500.000)" placeholderTextColor="#9ca3af" keyboardType="numeric" value={form.budget} onChangeText={(text) => setForm({ ...form, budget: text })} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput style={styles.input} placeholder="Select project category (e.g., Development, Design)" placeholderTextColor="#9ca3af" value={form.category} onChangeText={(text) => setForm({ ...form, category: text })} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} placeholder="Project location (e.g., Remote, On-site)" placeholderTextColor="#9ca3af" value={form.location} onChangeText={(text) => setForm({ ...form, location: text })} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration</Text>
          <TextInput style={styles.input} placeholder="Project duration (e.g., 3 months)" placeholderTextColor="#9ca3af" value={form.duration} onChangeText={(text) => setForm({ ...form, duration: text })} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Requirements</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="List project requirements (one per line)"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            value={form.requirements}
            onChangeText={(text) => setForm({ ...form, requirements: text })}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Post Project</Text>
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
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
