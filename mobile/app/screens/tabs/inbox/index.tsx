import { View, Text, Image, FlatList, StyleSheet, ListRenderItem, Pressable, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
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
import Header from "@/components/Header";
import { MessageCircle, Search } from "lucide-react-native";
import { COLORS } from "@/constant/color";

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
  const [filteredChatItems, setFilteredChatItems] = useState<ChatItemUI[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Transform chats untuk tampilan UI
  useEffect(() => {
    async function transformChats() {
      setLocalLoading(true);
      
      if (!user) {
        setLocalLoading(false);
        return;
      }
      
      if (!chats || chats.length === 0) {
        setLocalLoading(false);
        return;
      }
      
      try {
        const transformedChats = await Promise.all(
          chats.map(async (chat) => {
            // Cari id user lain dalam chat
            let otherUserId;
            
            // Cek apakah participants adalah array
            if (Array.isArray(chat.participants) && chat.participants.length > 0) {
              otherUserId = chat.participants.find(id => id !== user._id);
            } 
            // Cek apakah chat ID mengandung ID pengguna (format: userId1_userId2)
            else if (chat.id.includes('_')) {
              const ids = chat.id.split('_');
              otherUserId = ids.find(id => id !== user._id);
            }
            
            if (!otherUserId) {
              // Fallback: gunakan ID lain dari chat ID
              if (chat.id.includes('_')) {
                const ids = chat.id.split('_');
                otherUserId = ids[0] === user._id ? ids[1] : ids[0];
              } else {
                return null;
              }
            }
            
            try {
              // Ambil info user lain dari API
              const response = await fetch(`${baseUrl}/api/users/${otherUserId}`, {
                headers: {
                  Authorization: `Bearer ${await SecureStoreUtils.getToken()}`
                }
              });
              
              if (!response.ok) {
                // Fallback jika API gagal
                return {
                  id: chat.id,
                  name: `Pengguna (${otherUserId.substring(0, 6)}...)`,
                  lastMessage: chat.lastMessage || 'Belum ada pesan',
                  profilePic: 'https://picsum.photos/200',
                  time: chat.lastMessageTime ? format(new Date(chat.lastMessageTime), 'HH:mm') : '',
                  unread: chat.unreadCount || 0,
                  userId: otherUserId
                };
              }
              
              const result = await response.json();
              const otherUser = result.data;
              
              if (!otherUser) {
                // Fallback jika data user tidak ada
                return {
                  id: chat.id,
                  name: `Pengguna (${otherUserId.substring(0, 6)}...)`,
                  lastMessage: chat.lastMessage || 'Belum ada pesan',
                  profilePic: 'https://picsum.photos/200',
                  time: chat.lastMessageTime ? format(new Date(chat.lastMessageTime), 'HH:mm') : '',
                  unread: chat.unreadCount || 0,
                  userId: otherUserId
                };
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
              };
            } catch (error) {
              console.error('Error fetching user data:', error);
              // Fallback jika terjadi error
              return {
                id: chat.id,
                name: `Pengguna (${otherUserId.substring(0, 6)}...)`,
                lastMessage: chat.lastMessage || 'Belum ada pesan',
                profilePic: 'https://picsum.photos/200',
                time: chat.lastMessageTime ? format(new Date(chat.lastMessageTime), 'HH:mm') : '',
                unread: chat.unreadCount || 0,
                userId: otherUserId
              };
            }
          })
        );
        
        // Filter out null items and set to state
        const validChats = transformedChats.filter(Boolean) as ChatItemUI[];
        setChatItems(validChats);
        setFilteredChatItems(validChats);
      } catch (error) {
        console.error('Error transforming chats:', error);
      } finally {
        setLocalLoading(false);
      }
    }
    
    transformChats();
  }, [chats, user]);

  // Filter chats berdasarkan search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChatItems(chatItems);
      return;
    }
    
    const filtered = chatItems.filter(chat => 
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredChatItems(filtered);
  }, [searchQuery, chatItems]);

  const handleChatPress = (chat: ChatItemUI) => {
    navigation.navigate('DirectMessage', {
      userId: chat.userId,
      userName: chat.name,
      userImage: chat.profilePic,
      chatId: chat.id
    });
  };

  const renderChatItem: ListRenderItem<ChatItemUI> = ({ item }) => (
    <Pressable 
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: item.profilePic }} 
          style={styles.profilePic}
          onError={(e) => {
            console.log('Error loading image:', e.nativeEvent.error);
          }}
        />
        {item.unread > 0 && (
          <View style={styles.onlineIndicator}>
            <Text style={styles.unreadText}>
              {item.unread > 99 ? '99+' : item.unread}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.messageFooter}>
          <Text 
            style={[
              styles.lastMessage, 
              item.unread > 0 && styles.unreadMessage
            ]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {item.lastMessage}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const renderSearchSection = () => (
    <View style={styles.searchWrapper}>
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.gray} strokeWidth={2} />
        <TextInput
          style={styles.searchPlaceholder}
          placeholder="Cari pesan..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  if (loading || localLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Pesan" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat pesan...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Pesan" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
          <Text style={styles.errorText}>
            Tidak dapat memuat pesan. Silakan coba lagi nanti.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Pesan" />
      
      <View style={styles.content}>
        {renderSearchSection()}
        
        {chatItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MessageCircle size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Pesan</Text>
            <Text style={styles.emptyText}>
              Pesan yang Anda kirim dan terima akan muncul di sini
            </Text>
          </View>
        ) : (
          <FlatList<ChatItemUI>
            data={filteredChatItems}
            renderItem={renderChatItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              searchQuery.length > 0 ? (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    Tidak ada hasil untuk "{searchQuery}"
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: "400",
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    backgroundColor: COLORS.background,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profilePic: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.inputBackground,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  messageContent: {
    flex: 1,
    marginLeft: 4,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "500",
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  unreadText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',       
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});
