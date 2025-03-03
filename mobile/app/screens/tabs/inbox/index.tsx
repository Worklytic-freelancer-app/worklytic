import { View, Text, Image, FlatList, StyleSheet, ListRenderItem, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigators";

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  profilePic: string;
  time: string;
  unread: number;
}

const chatData: ChatItem[] = [
  {
    id: "1",
    name: "John Doe",
    lastMessage: "Hey, how are you? Let's catch up soon!",
    profilePic: "https://picsum.photos/200?random=1",
    time: "10:30 AM",
    unread: 2,
  },
  {
    id: "2",
    name: "Jane Smith",
    lastMessage: "The meeting is scheduled for tomorrow at the main office",
    profilePic: "https://picsum.photos/200?random=2",
    time: "9:45 AM",
    unread: 0,
  },
];

export default function Chat(): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const renderChatItem: ListRenderItem<ChatItem> = ({ item }) => (
    <Pressable
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("DirectMessage", {
          userId: parseInt(item.id),
          userName: item.name,
          userImage: item.profilePic,
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList<ChatItem> data={chatData} renderItem={renderChatItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false} />
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
});
