import { useState, useEffect } from 'react';
import { chatService, Message, Chat } from '../utils/chatService';

export const useChat = (userId?: string, chatId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memuat pesan dalam sebuah chat
  useEffect(() => {
    let unsubscribe: () => void;

    if (chatId) {
      setLoading(true);
      try {
        unsubscribe = chatService.getMessages(chatId, (newMessages) => {
          setMessages(newMessages);
          setLoading(false);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading messages');
        setLoading(false);
      }
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId]);

  // Memuat daftar chat untuk pengguna
  useEffect(() => {
    let unsubscribe: () => void;

    const loadChats = async () => {
      setLoading(true);
      try {
        unsubscribe = await chatService.getUserChats((newChats) => {
          setChats(newChats);
          setLoading(false);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading chats');
        setLoading(false);
      }
    };

    loadChats();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Mengirim pesan
  const sendMessage = async (text: string, receiverId: string) => {
    if (!chatId) {
      // Jika belum ada chatId, coba dapatkan dari service
      try {
        if (!userId) {
          throw new Error('User ID is required to create chat');
        }
        const newChatId = await chatService.getChatId(userId, receiverId);
        return await chatService.sendMessage(newChatId, receiverId, text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error sending message');
        throw err;
      }
    } else {
      // Jika sudah ada chatId, gunakan langsung
      try {
        return await chatService.sendMessage(chatId, receiverId, text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error sending message');
        throw err;
      }
    }
  };

  // Menandai pesan sudah dibaca
  const markAsRead = async (receiverId: string) => {
    if (chatId) {
      try {
        await chatService.markMessagesAsRead(chatId, receiverId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error marking messages as read');
      }
    }
  };

  // Mendapatkan atau membuat chat ID
  const getChatId = async (otherUserId: string) => {
    if (!userId) {
      setError('User ID is required to create chat');
      throw new Error('User ID is required to create chat');
    }
    
    try {
      return await chatService.getChatId(userId, otherUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating chat');
      throw err;
    }
  };

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