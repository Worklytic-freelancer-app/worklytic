import { View, Text, StyleSheet } from "react-native";

interface AboutProps {
  about: string;
}

export default function About({ about }: AboutProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About</Text>
      <Text style={styles.aboutText}>{about}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 24,
  },
}); 