import { View, Text, Image, FlatList, StyleSheet, ListRenderItem, Pressable, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/tanstack/useUser";
import { format } from "date-fns";
import { SecureStoreUtils } from "@/utils/SecureStore";
import { baseUrl } from "@/constant/baseUrl";

interface ChatItemUI {
  id: string;
  name: string;
  lastMessage: string;
  profilePic: string;
  time: string;
  unread: number;
  userId: string;
}

export default function Chat(): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { chats, loading, error } = useRealtimeChat();
  const { data: user } = useUser();
  const [chatItems, setChatItems] = useState<ChatItemUI[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  
  // Debug logs
  useEffect(() => {
    console.log("Chats data:", JSON.stringify(chats));
    console.log("Loading state:", loading);
    console.log("Error state:", error);
    console.log("User data:", user);
  }, [chats, loading, error, user]);
  
  // Transform chats untuk tampilan UI
  useEffect(() => {
    async function transformChats() {
      setLocalLoading(true);
      
      if (!user) {
        console.log("No user data available");
        setLocalLoading(false);
        return;
      }
      
      if (!chats || chats.length === 0) {
        console.log("No chats available");
        setLocalLoading(false);
        return;
      }
      
      try {
        console.log("Starting chat transformation with", chats.length, "chats");
        console.log("Current user ID:", user._id);
        
        // Log semua chat untuk debugging
        chats.forEach((chat, index) => {
          console.log(`Chat ${index + 1}:`, JSON.stringify(chat));
        });
        
        const transformedChats = await Promise.all(
          chats.map(async (chat) => {
            console.log("Processing chat:", chat.id, "with participants:", chat.participants);
            
            // Cari id user lain dalam chat
            let otherUserId;
            
            // Cek apakah participants adalah array
            if (Array.isArray(chat.participants) && chat.participants.length > 0) {
              otherUserId = chat.participants.find(id => id !== user._id);
              console.log("Found other user from participants array:", otherUserId);
            } 
            // Cek apakah chat ID mengandung ID pengguna (format: userId1_userId2)
            else if (chat.id.includes('_')) {
              const ids = chat.id.split('_');
              otherUserId = ids.find(id => id !== user._id);
              console.log("Found other user from chat ID:", otherUserId);
            }
            
            if (!otherUserId) {
              console.log("No other user found in chat:", chat.id);
              // Fallback: gunakan ID lain dari chat ID
              if (chat.id.includes('_')) {
                const ids = chat.id.split('_');
                otherUserId = ids[0] === user._id ? ids[1] : ids[0];
                console.log("Using fallback user ID from chat ID:", otherUserId);
              } else {
                console.log("Cannot determine other user ID, skipping chat");
                return null;
              }
            }
            
            console.log("Found other user:", otherUserId);
            
            try {
              // Ambil info user lain dari API
              const response = await fetch(`${baseUrl}/api/users/${otherUserId}`, {
                headers: {
                  Authorization: `Bearer ${await SecureStoreUtils.getToken()}`
                }
              });
              
              if (!response.ok) {
                console.log("API response not OK:", response.status);
                // Fallback jika API gagal
                return {
                  id: chat.id,
                  name: `Pengguna (${otherUserId.substring(0, 6)}...)`,
                  lastMessage: chat.lastMessage || 'Belum ada pesan',
                  profilePic: 'https://picsum.photos/200',
                  time: chat.lastMessageTime ? format(new Date(chat.lastMessageTime), 'HH:mm') : '',
                  unread: chat.unreadCount || 0,
                  userId: otherUserId
                } as ChatItemUI;
              }
              
              const result = await response.json();
              const otherUser = result.data;
              
              if (!otherUser) {
                console.log("No user data returned from API");
                // Fallback jika data user tidak ada
                return {
                  id: chat.id,
                  name: `Pengguna (${otherUserId.substring(0, 6)}...)`,
                  lastMessage: chat.lastMessage || 'Belum ada pesan',
                  profilePic: 'https://picsum.photos/200',
                  time: chat.lastMessageTime ? format(new Date(chat.lastMessageTime), 'HH:mm') : '',
                  unread: chat.unreadCount || 0,
                  userId: otherUserId
                } as ChatItemUI;
              }
              
              // Format waktu terakhir chat
              let timeString = '';
              if (chat.lastMessageTime) {
                const date = new Date(chat.lastMessageTime);
                timeString = format(date, 'HH:mm');
              }
              
              return {
                id: chat.id,
                name: otherUser.fullName || `Pengguna (${otherUserId.substring(0, 6)}...)`,
                lastMessage: chat.lastMessage || 'Belum ada pesan',
                profilePic: otherUser.profileImage || 'https://picsum.photos/200',
                time: timeString,
                unread: chat.unreadCount || 0,
                userId: otherUserId
              } as ChatItemUI;
            } catch (apiError) {
              console.error("Error fetching user data:", apiError);
              // Fallback jika API error
              return {
                id: chat.id,
                name: `Pengguna (${otherUserId.substring(0, 6)}...)`,
                lastMessage: chat.lastMessage || 'Belum ada pesan',
                profilePic: 'https://picsum.photos/200',
                time: chat.lastMessageTime ? format(new Date(chat.lastMessageTime), 'HH:mm') : '',
                unread: chat.unreadCount || 0,
                userId: otherUserId
              } as ChatItemUI;
            }
          })
        );
        
        // Filter out null items and set to state
        const validChats = transformedChats.filter(Boolean) as ChatItemUI[];
        console.log("Valid chats count:", validChats.length);
        setChatItems(validChats);
      } catch (error) {
        console.error('Error transforming chats:', error);
      } finally {
        setLocalLoading(false);
      }
    }
    
    transformChats();
  }, [chats, user]);

  const renderChatItem: ListRenderItem<ChatItemUI> = ({ item }) => (
    <Pressable
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("DirectMessage", {
          userId: item.userId,
          userName: item.name,
          userImage: item.profilePic,
          chatId: item.id,
        })
      }
    >
      <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={2}>
          {item.lastMessage}
        </Text>
      </View>
      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </Pressable>
  );

  if (loading || localLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat chat...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesan</Text>
        {/* <TouchableOpacity 
          style={styles.createChatButton}
          onPress={createTestChat}
        >
          <Text style={styles.createChatButtonText}>+ Buat Chat Test</Text>
        </TouchableOpacity> */}
      </View>
      
      {chatItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Belum Ada Pesan</Text>
          <Text style={styles.emptyText}>
            Pesan yang Anda kirim dan terima akan muncul di sini
          </Text>
          {/* <TouchableOpacity 
            style={styles.createChatButtonLarge}
            onPress={createTestChat}
          >
            <Text style={styles.createChatButtonText}>Buat Chat Test</Text>
          </TouchableOpacity> */}
        </View>
      ) : (
        <FlatList<ChatItemUI>
          data={chatItems}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  listContainer: {
    padding: 16,
  },
  chatItem: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profilePic: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  time: {
    fontSize: 12,
    color: "#666",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  unreadBadge: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: '80%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: '80%',
  },
  createChatButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  createChatButtonLarge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 24,
  },
  createChatButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
