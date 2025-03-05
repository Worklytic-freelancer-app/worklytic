import { useQuery } from '@tanstack/react-query';
import { baseUrl } from '@/constant/baseUrl';
import { SecureStoreUtils } from '@/utils/SecureStore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { handleAuthError } from '@/utils/handleAuthError';
import { RootStackParamList } from '@/navigators';

// Tipe untuk parameter fetch
interface FetchOptions {
    endpoint: string;
    queryParams?: Record<string, string>;
    requiresAuth?: boolean;
    enabled?: boolean;
    refetchInterval?: number | false;
    staleTime?: number;
}

// Hook untuk melakukan fetch data dengan TanStack Query
export const useFetch = <T>({
    endpoint,
    queryParams = {},
    requiresAuth = true,
    enabled = true,
    refetchInterval = false,
    staleTime = 5 * 60 * 1000 // Default 5 menit
}: FetchOptions) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    
    // Buat query key dari endpoint dan query params
    const queryKey = [
        endpoint,
        ...Object.entries(queryParams).map(([key, value]) => `${key}=${value}`)
    ];

    // Gunakan useQuery untuk fetch data
    return useQuery({
        queryKey,
        queryFn: async () => {
            try {
                // Tambahkan query params ke URL jika ada
                const queryString = Object.entries(queryParams)
                    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                    .join('&');
                
                const url = `${baseUrl}/api/${endpoint}${queryString ? `?${queryString}` : ''}`;
                
                // Set headers
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                
                // Tambahkan token jika diperlukan
                if (requiresAuth) {
                    const token = await SecureStoreUtils.getToken();
                    if (!token) {
                        // Gunakan handleAuthError untuk menangani error tidak ada token
                        await handleAuthError({ message: 'unauthorized' }, navigation);
                        throw new Error('Sesi login tidak valid. Silakan login kembali.');
                    }
                    headers['Authorization'] = `Bearer ${token}`;
                }
                
                // Lakukan fetch
                const response = await fetch(url, { headers });
                
                // Handle unauthorized response (401)
                if (response.status === 401) {
                    await handleAuthError({ status: 401 }, navigation);
                    throw new Error('Sesi login telah berakhir. Silakan login kembali.');
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Terjadi kesalahan saat memuat data');
                }
                
                return result.data as T;
            } catch (error) {
                console.error('Error fetching data:', error);
                // Cek apakah error adalah auth error
                const isAuthError = await handleAuthError(error, navigation);
                if (!isAuthError) {
                    // Jika bukan auth error, lempar error seperti biasa
                    throw error;
                } else {
                    // Jika auth error, lempar error yang lebih spesifik
                    throw new Error('Sesi login telah berakhir. Silakan login kembali.');
                }
            }
        },
        enabled,
        refetchInterval,
        staleTime,
    });
};