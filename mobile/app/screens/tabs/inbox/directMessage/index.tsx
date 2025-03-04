import { View, Text, StyleSheet, Image, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Send } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { useUser } from "@/hooks/tanstack/useUser";
import { format } from "date-fns";

interface RouteParams {
  userId: string;
  userName: string;
  userImage: string;
  chatId?: string;
  initialMessage?: string;
}

export default function DirectMessage() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, userName, userImage, chatId: routeChatId, initialMessage } = route.params as RouteParams;
  const [message, setMessage] = useState("");
  const [localChatId, setLocalChatId] = useState<string | undefined>(routeChatId);
  const { data: user } = useUser();
  
  // Menggunakan custom hook realtime chat
  const { messages, loading, error, sendMessage, markAsRead, getChatId } = useRealtimeChat(
    user?._id, 
    localChatId
  );

  // Memastikan kita punya chat ID
  useEffect(() => {
    async function ensureChatId() {
      if (!localChatId && user?._id) {
        try {
          const newChatId = await getChatId(userId);
          setLocalChatId(newChatId);
        } catch (err) {
          console.error('Error getting chat ID:', err);
        }
      }
    }
    
    ensureChatId();
  }, [localChatId, user, userId, getChatId]);
  
  // Menandai pesan sudah dibaca saat masuk ke layar chat
  useEffect(() => {
    if (localChatId) {
      markAsRead(userId);
    }
  }, [localChatId, userId, markAsRead]);

  // Tambahkan useEffect untuk mengirim pesan otomatis
  useEffect(() => {
    if (initialMessage && localChatId && user?._id) {
      sendMessage(initialMessage, userId);
    }
  }, [localChatId, user, userId, initialMessage]);

  const handleSend = async () => {
    if (message.trim() && user?._id) {
      try {
        await sendMessage(message.trim(), userId);
        setMessage("");
        console.log("Message sent, inbox should update automatically");
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  
  // Format tanggal pesan
  const formatMessageTime = (timestamp: number) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return format(date, 'HH:mm');
  };
  
  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.senderId === user?._id;
    
    return (
      <View 
        style={[
          styles.messageContainer, 
          isUser ? styles.userMessage : styles.otherMessage
        ]}
      >
        <Text 
          style={[
            styles.messageText, 
            isUser ? styles.userMessageText : styles.otherMessageText
          ]}
        >
          {item.text}
        </Text>
        <Text 
          style={[
            styles.timestamp, 
            isUser ? styles.userTimestamp : styles.otherTimestamp
          ]}
        >
          {item.createdAt ? formatMessageTime(item.createdAt) : ''}
        </Text>
      </View>
    )
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerProfile}>
          <Image source={{ uri: userImage }} style={styles.profileImage} />
          <Text style={styles.profileName}>{userName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Memuat pesan...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Terjadi kesalahan saat memuat pesan</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={[
            styles.messagesList,
            { flexGrow: 1, justifyContent: 'flex-end' }
          ]}
          inverted={true}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10
          }}
        />
      )}

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 20 }]}>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !message.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
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
    flexGrow: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
});
