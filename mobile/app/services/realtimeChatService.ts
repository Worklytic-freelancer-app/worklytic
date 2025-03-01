import { database, auth } from '../config/firebase';
import {
  ref,
  set,
  push,
  onValue,
  update,
  get,
  query,
  orderByChild,
  equalTo,
  off,
  DatabaseReference
} from 'firebase/database';
import { SecureStoreUtils } from '@/utils/SecureStore';
import { initializeFirebaseAuth } from './firebaseAuth';

export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: number; // timestamp dalam milliseconds
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: number; // timestamp dalam milliseconds
  unreadCount: number;
}

class RealtimeChatService {
  // Helper untuk memastikan autentikasi
  private async ensureAuth() {
    if (!auth.currentUser) {
      console.log("No auth user, initializing Firebase Auth");
      await initializeFirebaseAuth();
    }
    return auth.currentUser;
  }

  // Mendapatkan atau membuat ID chat
  async getChatId(userId1: string, userId2: string): Promise<string> {
    await this.ensureAuth();
    
    // Membuat ID chat yang konsisten berdasarkan ID pengguna (selalu urut yang lebih kecil duluan)
    const sortedIds = [userId1, userId2].sort();
    const chatId = `${sortedIds[0]}_${sortedIds[1]}`;
    
    console.log(`Getting chat ID for users ${userId1} and ${userId2}: ${chatId}`);
    
    return chatId;
  }
  
  // Mengirim pesan
  async sendMessage(chatId: string, receiverId: string, text: string): Promise<void> {
    await this.ensureAuth();
    
    try {
      const userData = await SecureStoreUtils.getUserData();
      if (!userData || !userData._id) {
        throw new Error('User not authenticated');
      }
      
      const senderId = userData._id;
      const timestamp = Date.now();
      
      console.log(`Sending message from ${senderId} to ${receiverId} in chat ${chatId}`);
      
      // Reference untuk messages
      const messagesRef = ref(database, 'messages');
      const newMessageRef = push(messagesRef);
      
      // Simpan pesan baru
      await set(newMessageRef, {
        chatId,
        senderId,
        receiverId,
        text,
        createdAt: timestamp,
        read: false
      });
      
      console.log(`Message saved with ID: ${newMessageRef.key}`);
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  // Mendapatkan pesan dari chat
  async getMessages(chatId: string, callback: (messages: Message[]) => void): Promise<() => void> {
    await this.ensureAuth();
    
    console.log(`Setting up messages listener for chat ${chatId}`);
    
    const messagesRef = ref(database, 'messages');
    const messagesQuery = query(
      messagesRef,
      orderByChild('chatId'),
      equalTo(chatId)
    );
    
    const handleMessages = (snapshot: any) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        console.log(`Received ${Object.keys(messagesData).length} messages for chat ${chatId}`);
        
        const messages: Message[] = Object.keys(messagesData).map(key => ({
          id: key,
          ...messagesData[key]
        }));
        
        // Urutkan pesan berdasarkan waktu
        messages.sort((a, b) => a.createdAt - b.createdAt);
        
        callback(messages);
      } else {
        console.log(`No messages found for chat ${chatId}`);
        callback([]);
      }
    };
    
    // Daftarkan listener
    onValue(messagesQuery, handleMessages);
    
    // Return unsubscribe function
    return () => {
      console.log(`Removing messages listener for chat ${chatId}`);
      off(messagesQuery);
    };
  }
  
  // Mendapatkan semua chat untuk pengguna
  async getUserChats(callback: (chats: Chat[]) => void): Promise<() => void> {
    await this.ensureAuth();
    
    try {
      const userData = await SecureStoreUtils.getUserData();
      if (!userData || !userData._id) {
        console.log("No user data available from SecureStore");
        callback([]);
        return () => {};
      }
      
      const userId = userData._id;
      console.log(`Getting chats for user ID: ${userId}`);
      
      // Dapatkan semua pesan di mana pengguna adalah pengirim
      const senderMessagesRef = ref(database, 'messages');
      const senderQuery = query(
        senderMessagesRef,
        orderByChild('senderId'),
        equalTo(userId)
      );
      
      // Dapatkan semua pesan di mana pengguna adalah penerima
      const receiverMessagesRef = ref(database, 'messages');
      const receiverQuery = query(
        receiverMessagesRef,
        orderByChild('receiverId'),
        equalTo(userId)
      );
      
      // Fungsi untuk memproses dan menggabungkan pesan
      const processMessages = async () => {
        try {
          // Ambil snapshot terbaru untuk kedua query
          const senderSnapshot = await get(senderQuery);
          const receiverSnapshot = await get(receiverQuery);
          
          // Map untuk menyimpan chat yang unik berdasarkan chatId
          const chatMap: Record<string, {
            lastMessage: string;
            lastMessageTime: number;
            participants: string[];
            unreadCount: number;
          }> = {};
          
          // Proses pesan di mana pengguna adalah pengirim
          if (senderSnapshot.exists()) {
            const senderMessages = senderSnapshot.val();
            console.log(`Found ${Object.keys(senderMessages).length} messages where user is sender`);
            
            Object.values(senderMessages).forEach((message: any) => {
              const chatId = message.chatId;
              const otherUserId = message.receiverId;
              
              if (!chatMap[chatId] || message.createdAt > chatMap[chatId].lastMessageTime) {
                chatMap[chatId] = {
                  lastMessage: message.text,
                  lastMessageTime: message.createdAt,
                  participants: [userId, otherUserId],
                  unreadCount: 0
                };
              }
            });
          } else {
            console.log("No messages found where user is sender");
          }
          
          // Proses pesan di mana pengguna adalah penerima
          if (receiverSnapshot.exists()) {
            const receiverMessages = receiverSnapshot.val();
            console.log(`Found ${Object.keys(receiverMessages).length} messages where user is receiver`);
            
            Object.values(receiverMessages).forEach((message: any) => {
              const chatId = message.chatId;
              const otherUserId = message.senderId;
              
              if (!chatMap[chatId] || message.createdAt > chatMap[chatId].lastMessageTime) {
                chatMap[chatId] = {
                  lastMessage: message.text,
                  lastMessageTime: message.createdAt,
                  participants: [userId, otherUserId],
                  unreadCount: message.read ? 0 : 1
                };
              } else if (!message.read) {
                // Tambahkan ke unread count jika pesan belum dibaca
                chatMap[chatId].unreadCount++;
              }
            });
          } else {
            console.log("No messages found where user is receiver");
          }
          
          // Konversi ke array dan urutkan berdasarkan waktu pesan terakhir
          const chats: Chat[] = Object.keys(chatMap).map(chatId => ({
            id: chatId,
            participants: chatMap[chatId].participants,
            lastMessage: chatMap[chatId].lastMessage,
            lastMessageTime: chatMap[chatId].lastMessageTime,
            unreadCount: chatMap[chatId].unreadCount
          })).sort((a, b) => b.lastMessageTime - a.lastMessageTime);
          
          console.log(`Returning ${chats.length} chats to callback`);
          callback(chats);
        } catch (error) {
          console.error("Error processing messages:", error);
          callback([]);
        }
      };
      
      // Daftarkan listener untuk perubahan pada pesan yang dikirim
      console.log("Setting up sender messages listener");
      onValue(senderQuery, () => {
        processMessages();
      });
      
      // Daftarkan listener untuk perubahan pada pesan yang diterima
      console.log("Setting up receiver messages listener");
      onValue(receiverQuery, () => {
        processMessages();
      });
      
      // Return unsubscribe function untuk kedua listener
      return () => {
        console.log("Removing messages listeners");
        off(senderQuery);
        off(receiverQuery);
      };
    } catch (error) {
      console.error('Error getting user chats:', error);
      callback([]);
      return () => {};
    }
  }
  
  // Menandai pesan sudah dibaca
  async markMessagesAsRead(chatId: string, senderId: string): Promise<void> {
    await this.ensureAuth();
    
    try {
      const userData = await SecureStoreUtils.getUserData();
      if (!userData || !userData._id) return;
      
      const userId = userData._id;
      
      console.log(`Marking messages as read in chat ${chatId} from sender ${senderId}`);
      
      // Dapatkan semua pesan yang belum dibaca
      const messagesRef = ref(database, 'messages');
      const unreadQuery = query(
        messagesRef,
        orderByChild('chatId'),
        equalTo(chatId)
      );
      
      const snapshot = await get(unreadQuery);
      if (snapshot.exists()) {
        const messages = snapshot.val();
        console.log(`Found ${Object.keys(messages).length} messages in chat ${chatId}`);
        
        // Update pesan yang belum dibaca
        const updates: Record<string, any> = {};
        
        Object.keys(messages).forEach(key => {
          const message = messages[key];
          if (message.senderId === senderId && message.receiverId === userId && !message.read) {
            console.log(`Marking message ${key} as read`);
            updates[`messages/${key}/read`] = true;
          }
        });
        
        // Lakukan update batch
        if (Object.keys(updates).length > 0) {
          console.log(`Updating ${Object.keys(updates).length} items`);
          await update(ref(database), updates);
        } else {
          console.log("No messages to mark as read");
        }
      } else {
        console.log(`No messages found in chat ${chatId}`);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}

export const realtimeChatService = new RealtimeChatService(); 