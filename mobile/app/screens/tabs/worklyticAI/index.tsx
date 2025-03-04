import { View } from "react-native";
import { useAuth } from "../../../hooks/tanstack/useAuth";
import WorklyticAIClient from "./client";
import WorklyticAIFreelancer from "./freelancer";

export default function WorklyticAI() {
  const { user } = useAuth();

  // Jika user adalah client, tampilkan halaman client
  if (user?.role === "client") {
    return <WorklyticAIClient />;
  }

  // Jika user adalah freelancer, tampilkan halaman freelancer
  if (user?.role === "freelancer") {
    return <WorklyticAIFreelancer />;
  }

  // Jika tidak ada user atau role tidak dikenali, tampilkan view kosong
  return <View />;
}