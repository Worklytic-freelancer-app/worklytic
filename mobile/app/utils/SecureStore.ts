import * as SecureStore from 'expo-secure-store';

interface AuthData {
  token: string;
  user?: any; // Sesuaikan dengan tipe data user Anda
}

export const SecureStoreUtils = {
  // Menyimpan data autentikasi
  async setAuthData(data: AuthData) {
    try {
      await SecureStore.setItemAsync('auth_token', data.token);
      if (data.user) {
        await SecureStore.setItemAsync('user_data', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  },

  // Mengambil token
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Mengambil data user
  async getUserData(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Menghapus data autentikasi (untuk logout)
  async clearAuthData() {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }
};