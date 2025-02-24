import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mail, Lock, Eye, EyeOff, User, Briefcase, LogIn } from "lucide-react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Briefcase size={48} color="#2563eb" />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Prolancer and start your freelancing journey</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <User size={20} color="#6b7280" />
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#6b7280" value={form.fullName} onChangeText={(text) => setForm({ ...form, fullName: text })} />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color="#6b7280" />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#6b7280" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(text) => setForm({ ...form, email: text })} />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6b7280" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#6b7280" secureTextEntry={!showPassword} value={form.password} onChangeText={(text) => setForm({ ...form, password: text })} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
            {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate("BottomTab")}>
          <Text style={styles.signUpButtonText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => {
            /* Handle Google Sign Up */
          }}
        >
          <LogIn size={20} color="#374151" />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By signing up, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    marginLeft: 12,
    fontSize: 15,
    color: "#111827",
  },
  eyeButton: {
    padding: 8,
  },
  signUpButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#6b7280",
    fontSize: 14,
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: "#eff6ff",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
  },
  googleButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  termsContainer: {
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: "#2563eb",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  footerLink: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
});
