import { View, Text, StyleSheet, Image, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Send } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: string;
}

interface RouteParams {
  userId: number;
  userName: string;
  userImage: string;
}

export default function DirectMessage() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { userName, userImage } = route.params as RouteParams;
  const [message, setMessage] = useState("");

  const messages: Message[] = [
    {
      id: "1",
      text: "Hi, I'm interested in your Mobile App Development project",
      sender: "user",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      text: "Hello! Thanks for reaching out. Do you have experience with React Native?",
      sender: "other",
      timestamp: "10:32 AM",
    },
    {
      id: "3",
      text: "Yes, I have 3 years of experience with React Native and have built several apps",
      sender: "user",
      timestamp: "10:33 AM",
    },
  ];

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === "user" ? styles.userMessage : styles.otherMessage]}>
      <Text style={[styles.messageText, item.sender === "user" ? styles.userMessageText : styles.otherMessageText]}>{item.text}</Text>
      <Text style={[styles.timestamp, item.sender === "user" ? styles.userTimestamp : styles.otherTimestamp]}>{item.timestamp}</Text>
    </View>
  );

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message here
      setMessage("");
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerProfile}>
          <Image source={{ uri: userImage }} style={styles.profileImage} />
          <Text style={styles.profileName}>{userName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList data={messages} renderItem={renderMessage} keyExtractor={(item) => item.id} contentContainerStyle={styles.messagesList} inverted />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 20 }]}>
        <TextInput style={styles.input} placeholder="Type a message..." value={message} onChangeText={setMessage} multiline maxLength={500} />
        <TouchableOpacity style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} onPress={handleSend} disabled={!message.trim()}>
          <Send size={20} color={message.trim() ? "#2563eb" : "#94a3b8"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerProfile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#111827",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: "#e0e7ff",
    textAlign: "right",
  },
  otherTimestamp: {
    color: "#6b7280",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 15,
    color: "#111827",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  sendButtonDisabled: {
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
});
