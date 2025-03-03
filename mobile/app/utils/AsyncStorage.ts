import AsyncStorage from '@react-native-async-storage/async-storage';

// Utility functions untuk AsyncStorage
export class AsyncStorageUtils {
    // Menyimpan data dengan key
    static async setItem(key: string, value: string): Promise<void> {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('Error saving to AsyncStorage:', error);
            throw error;
        }
    }

    // Mengambil data dengan key
    static async getItem(key: string): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(key);
        } catch (error) {
            console.error('Error getting from AsyncStorage:', error);
            throw error;
        }
    }

    // Menghapus data dengan key
    static async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from AsyncStorage:', error);
            throw error;
        }
    }

    // Menyimpan data object (JSON)
    static async setObject<T>(key: string, value: T): Promise<void> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (error) {
            console.error('Error saving object to AsyncStorage:', error);
            throw error;
        }
    }

    // Mengambil data object (JSON)
    static async getObject<T>(key: string): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) as T : null;
        } catch (error) {
            console.error('Error getting object from AsyncStorage:', error);
            throw error;
        }
    }

    // Menghapus semua data
    static async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing AsyncStorage:', error);
            throw error;
        }
    }
}