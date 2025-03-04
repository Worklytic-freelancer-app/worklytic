import { useMutation as useTanstackMutation, useQueryClient } from '@tanstack/react-query';
import { baseUrl } from '@/constant/baseUrl';
import { SecureStoreUtils } from '@/utils/SecureStore';

// Tipe untuk parameter mutation
interface MutationOptions<TData> {
    endpoint: string;
    method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requiresAuth?: boolean;
    onSuccess?: (data: any) => void;
    invalidateQueries?: string[];
}

// Tipe untuk custom endpoint
interface WithCustomEndpoint {
    customEndpoint?: string;
}

// Hook untuk melakukan mutation data dengan TanStack Query
export const useMutation = <TData, TVariables extends Record<string, unknown> = Record<string, unknown>>({
    endpoint,
    method = 'POST',
    requiresAuth = true,
    onSuccess,
    invalidateQueries = []
}: MutationOptions<TData>) => {
    const queryClient = useQueryClient();

    return useTanstackMutation<TData, Error, TVariables & Partial<WithCustomEndpoint>>({
        mutationFn: async (variables) => {
            try {
                // Gunakan customEndpoint jika disediakan dalam variables
                const finalEndpoint = variables.customEndpoint || endpoint;
                const url = `${baseUrl}/api/${finalEndpoint}`;
                
                console.log(`${method} request to: ${url}`);
                
                // Hapus customEndpoint dari variables sebelum dikirim
                const { customEndpoint, ...restVariables } = variables;
                
                // Set headers
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                
                // Tambahkan token jika diperlukan
                if (requiresAuth) {
                    const token = await SecureStoreUtils.getToken();
                    if (!token) {
                        throw new Error('Sesi login tidak valid. Silakan login kembali.');
                    }
                    headers['Authorization'] = `Bearer ${token}`;
                }
                
                // Lakukan fetch
                const response = await fetch(url, {
                    method,
                    headers,
                    body: method !== 'DELETE' ? JSON.stringify(restVariables) : undefined,
                });
                
                // Cek jika respons kosong untuk DELETE request
                if (method === 'DELETE' && response.status === 204) {
                    console.log("DELETE successful with no content");
                    return {} as TData; // Return empty object for successful DELETE with no content
                }
                
                // Coba parse response sebagai JSON
                let result;
                try {
                    const text = await response.text();
                    console.log(`Response text: ${text}`);
                    result = text ? JSON.parse(text) : {};
                } catch (parseError) {
                    console.error("Error parsing JSON:", parseError);
                    // Jika parsing gagal tapi response OK, anggap sukses
                    if (response.ok) {
                        return {} as TData;
                    }
                    throw new Error("Respons server tidak valid");
                }
                
                if (!result.success && !response.ok) {
                    throw new Error(result.message || 'Terjadi kesalahan saat memproses data');
                }
                
                return (result.data || result) as TData;
            } catch (error) {
                console.error(`Error ${method} data:`, error);
                throw error;
            }
        },
        onSuccess: (data) => {
            // Invalidate queries jika diperlukan
            if (invalidateQueries.length > 0) {
                invalidateQueries.forEach(query => {
                    queryClient.invalidateQueries({ queryKey: [query] });
                });
            }
            
            // Panggil callback onSuccess jika ada
            if (onSuccess) {
                onSuccess(data);
            }
        },
    });
}; 