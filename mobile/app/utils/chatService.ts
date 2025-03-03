import { firestore } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs, 
  serverTimestamp, 
  Timestamp,
  writeBatch 
} from 'firebase/firestore';
import { SecureStoreUtils } from '@/utils/SecureStore';

export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: Timestamp;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: number;
}

class ChatService {
  // Mendapatkan atau membuat ID chat
  async getChatId(userId1: string, userId2: string): Promise<string> {
    // Membuat ID chat yang konsisten berdasarkan ID pengguna (selalu urut yang lebih kecil duluan)
    const sortedIds = [userId1, userId2].sort();
    const chatId = `${sortedIds[0]}_${sortedIds[1]}`;
    
    // Cek apakah chat sudah ada
    const chatRef = doc(firestore, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    // Jika belum ada, buat dokumen chat baru
    if (!chatDoc.exists()) {
      try {
        // Gunakan ID yang sudah dibuat
        await addDoc(collection(firestore, 'chats'), {
          id: chatId,
          participants: [userId1, userId2],
          createdAt: serverTimestamp(),
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          unreadCount: 0
        });
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    }
    
    return chatId;
  }
  
  // Mengirim pesan
  async sendMessage(chatId: string, receiverId: string, text: string): Promise<void> {
    try {
      const userData = await SecureStoreUtils.getUserData();
      if (!userData || !userData._id) {
        throw new Error('User not authenticated');
      }
      
      const senderId = userData._id;
      
      // Tambahkan pesan ke koleksi messages
      await addDoc(collection(firestore, 'messages'), {
        chatId,
        senderId,
        receiverId,
        text,
        createdAt: serverTimestamp(),
        read: false
      });
      
      // Update info chat terakhir
      await addDoc(collection(firestore, 'chats'), {
        id: chatId,
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        unreadCount: 1 // Akan diincrement di sisi penerima
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  // Mendapatkan pesan dari chat
  getMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(firestore, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );
    
    // Menggunakan onSnapshot untuk realtime updates
    return onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Message, 'id'>;
        messages.push({
          id: doc.id,
          ...data
        });
      });
      callback(messages);
    });
  }
  
  // Mendapatkan semua chat untuk pengguna
  async getUserChats(callback: (chats: Chat[]) => void): Promise<() => void> {
    try {
      const userData = await SecureStoreUtils.getUserData();
      if (!userData || !userData._id) {
        throw new Error('User not authenticated');
      }
      
      const userId = userData._id;
      const q = query(
        collection(firestore, 'chats'),
        where('participants', 'array-contains', userId)
      );
      
      // Menggunakan onSnapshot untuk realtime updates
      return onSnapshot(q, async (snapshot) => {
        const chats: Chat[] = [];
        
        for (const doc of snapshot.docs) {
          const chatData = doc.data() as Chat;
          
          // Dapatkan info user lain dalam chat (untuk tampilan)
          const otherUserId = chatData.participants.find(id => id !== userId);
          if (otherUserId) {
            // TODO: Fetch user info dari API/Firebase
            
            chats.push({
              ...chatData,
              id: doc.id
            });
          }
        }
        
        callback(chats);
      });
    } catch (error) {
      console.error('Error getting user chats:', error);
      return () => {};
    }
  }
  
  // Menandai pesan sudah dibaca
  async markMessagesAsRead(chatId: string, receiverId: string): Promise<void> {
    try {
      const userData = await SecureStoreUtils.getUserData();
      if (!userData || !userData._id) return;
      
      const userId = userData._id;
      
      // Dapatkan semua pesan yang belum dibaca, dikirim ke user ini
      const q = query(
        collection(firestore, 'messages'),
        where('chatId', '==', chatId),
        where('receiverId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      
      // Update semua pesan jadi sudah dibaca
      const batch = writeBatch(firestore);
      snapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      
      await batch.commit();
      
      // Reset unread count di chat
      // TODO: Implement if needed
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}

export const chatService = new ChatService(); 