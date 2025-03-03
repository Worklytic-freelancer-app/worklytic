import { useState, useEffect, useCallback } from 'react';
import { realtimeChatService, Message, Chat } from '../utils/realtimeChatService';

export const useRealtimeChat = (userId?: string, chatId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memuat pesan dalam sebuah chat
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let timeoutId: NodeJS.Timeout;

    async function setupMessagesListener() {
      if (chatId) {
        setLoading(true);
        try {
          console.log("Setting up messages listener for chatId:", chatId);
          const unsubscribe = await realtimeChatService.getMessages(chatId, (newMessages) => {
            console.log("Received messages update:", newMessages.length);
            setMessages(newMessages);
            setLoading(false);
            
            // Clear timeout if we got a response
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
          });
          cleanup = unsubscribe;
          
          // Safety timeout - jika tidak ada respons dalam 3 detik, set loading ke false
          timeoutId = setTimeout(() => {
            console.log("Messages safety timeout triggered");
            setLoading(false);
          }, 3000);
        } catch (err) {
          console.error("Error in messages listener:", err);
          setError(err instanceof Error ? err.message : 'Error loading messages');
          setLoading(false);
        }
      } else {
        // Jika tidak ada chatId, set loading ke false
        console.log("No chatId provided, skipping messages listener");
        setLoading(false);
      }
    }

    setupMessagesListener();

    return () => {
      if (cleanup) {
        cleanup();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [chatId]);

  // Memuat daftar chat untuk pengguna
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let timeoutId: NodeJS.Timeout;

    async function setupChatsListener() {
      console.log("Starting to set up chats listener");
      setLoading(true);
      
      try {
        console.log("Setting up chats listener");
        const unsubscribe = await realtimeChatService.getUserChats((newChats) => {
          console.log("Received chats update:", newChats.length, "chats");
          setChats(newChats);
          setLoading(false);
          
          // Clear timeout if we got a response
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        });
        cleanup = unsubscribe;
        
        // Safety timeout - jika tidak ada respons dalam 3 detik, set loading ke false
        timeoutId = setTimeout(() => {
          console.log("Chats safety timeout triggered - forcing loading to false");
          setLoading(false);
        }, 3000);
      } catch (err) {
        console.error("Error in chats listener:", err);
        setError(err instanceof Error ? err.message : 'Error loading chats');
        setLoading(false);
      }
    }

    setupChatsListener();

    return () => {
      if (cleanup) {
        cleanup();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Mengirim pesan dengan refresh otomatis
  const sendMessage = useCallback(async (text: string, receiverId: string) => {
    if (!chatId && !userId) {
      throw new Error('User ID is required to create chat');
    }
    
    try {
      let targetChatId = chatId;
      
      // Jika belum ada chatId, coba dapatkan dari service
      if (!targetChatId && userId) {
        targetChatId = await realtimeChatService.getChatId(userId, receiverId);
      }
      
      if (!targetChatId) {
        throw new Error('Could not determine chat ID');
      }
      
      // Kirim pesan
      await realtimeChatService.sendMessage(targetChatId, receiverId, text);
      
      // Tidak perlu refresh manual karena listener akan menangkap perubahan
      console.log("Message sent successfully, listeners will update UI");
      
      return targetChatId;
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : 'Error sending message');
      throw err;
    }
  }, [chatId, userId]);

  // Menandai pesan sudah dibaca
  const markAsRead = useCallback(async (senderId: string) => {
    if (chatId) {
      try {
        await realtimeChatService.markMessagesAsRead(chatId, senderId);
      } catch (err) {
        console.error("Error marking messages as read:", err);
        setError(err instanceof Error ? err.message : 'Error marking messages as read');
      }
    }
  }, [chatId]);

  // Mendapatkan atau membuat chat ID
  const getChatId = useCallback(async (otherUserId: string) => {
    if (!userId) {
      setError('User ID is required to create chat');
      throw new Error('User ID is required to create chat');
    }
    
    try {
      return await realtimeChatService.getChatId(userId, otherUserId);
    } catch (err) {
      console.error("Error getting chat ID:", err);
      setError(err instanceof Error ? err.message : 'Error creating chat');
      throw err;
    }
  }, [userId]);

  return {
    messages,
    chats,
    loading,
    error,
    sendMessage,
    markAsRead,
    getChatId
  };
}; 