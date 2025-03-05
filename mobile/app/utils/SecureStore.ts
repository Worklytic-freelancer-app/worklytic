import * as SecureStore from 'expo-secure-store';

interface AuthData {
  token: string;
  user?: Record<string, unknown>; // Tipe yang lebih baik daripada any
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
  async getUserData(): Promise<Record<string, unknown> | null> {
    try {
      const userData = await SecureStore.getItemAsync('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Menyimpan data user
  async setUserData(userData: Record<string, unknown>): Promise<void> {
    try {
      await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
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
  },
  
  // Menyimpan data project sementara (untuk proses pembayaran)
  async setTempProjectData(projectData: Record<string, unknown>): Promise<void> {
    try {
      await SecureStore.setItemAsync('temp_project_data', JSON.stringify(projectData));
    } catch (error) {
      console.error('Error saving temp project data:', error);
      throw error;
    }
  },
  
  // Mengambil data project sementara
  async getTempProjectData(): Promise<Record<string, unknown> | null> {
    try {
      const projectData = await SecureStore.getItemAsync('temp_project_data');
      return projectData ? JSON.parse(projectData) : null;
    } catch (error) {
      console.error('Error getting temp project data:', error);
      return null;
    }
  },
  
  // Menghapus data project sementara
  async clearTempProjectData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('temp_project_data');
    } catch (error) {
      console.error('Error clearing temp project data:', error);
      throw error;
    }
  }
};