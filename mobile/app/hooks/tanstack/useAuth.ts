import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { baseUrl } from '@/constant/baseUrl';
import { SecureStoreUtils } from '@/utils/SecureStore';

// Tipe data untuk autentikasi
interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: UserData;
    };
}

interface UserData {
    id: string;
    fullName: string;
    email: string;
    role: 'client' | 'freelancer';
    // Tambahkan properti lain sesuai kebutuhan
}

interface SignInCredentials {
    email: string;
    password: string;
}

interface SignUpCredentials {
    fullName: string;
    email: string;
    password: string;
    role: 'client' | 'freelancer';
}

// Hook untuk autentikasi
export const useAuth = () => {
    const queryClient = useQueryClient();

    // Query untuk mendapatkan user yang sedang login
    const userQuery = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const token = await SecureStoreUtils.getToken();
            if (!token) return null;
            
            const userData = await SecureStoreUtils.getUserData();
            return userData;
        },
        staleTime: Infinity, // Data tidak akan dianggap stale
    });

    // Mutation untuk sign in
    const signInMutation = useMutation({
        mutationFn: async (credentials: SignInCredentials) => {
            try {
                const response = await fetch(`${baseUrl}/api/auth/sign-in`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(credentials),
                });
                
                // Ambil respons sebagai text terlebih dahulu
                const responseText = await response.text();
                
                // Periksa apakah respons adalah HTML (biasanya dimulai dengan <!DOCTYPE atau <html)
                if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                    console.error('Server mengembalikan HTML alih-alih JSON:', responseText.substring(0, 200));
                    throw new Error('Server sedang mengalami masalah. Silakan coba lagi nanti.');
                }
                
                // Coba parse sebagai JSON
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (error) {
                    console.error('Error parsing JSON:', error, 'Response:', responseText);
                    throw new Error('Format respons server tidak valid');
                }
                
                // Periksa status respons
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Gagal melakukan login');
                }
                
                return result as AuthResponse;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },
        onSuccess: async (data) => {
            // Simpan data autentikasi
            await SecureStoreUtils.setAuthData({
                token: data.data.token,
                user: data.data.user,
            });
            
            // Update cache dengan data user baru
            queryClient.setQueryData(['user'], data.data.user);
        },
    });

    // Mutation untuk sign up
    const signUpMutation = useMutation({
        mutationFn: async (credentials: SignUpCredentials) => {
            const response = await fetch(`${baseUrl}/api/auth/sign-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            
            // Periksa status HTTP terlebih dahulu
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Gagal melakukan registrasi';
                
                try {
                    // Coba parse sebagai JSON jika memungkinkan
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    // Jika bukan JSON, gunakan text sebagai error message
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }
            
            // Coba parse response sebagai JSON dengan penanganan error
            let result;
            try {
                const responseText = await response.text();
                result = JSON.parse(responseText);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                throw new Error('Format respons server tidak valid');
            }
            
            return result as AuthResponse;
        },
        onSuccess: async (data) => {
            // Simpan data autentikasi
            await SecureStoreUtils.setAuthData({
                token: data.data.token,
                user: data.data.user,
            });
            
            // Update cache dengan data user baru
            queryClient.setQueryData(['user'], data.data.user);
        },
    });

    // Mutation untuk logout
    const logoutMutation = useMutation({
        mutationFn: async () => {
            await SecureStoreUtils.clearAuthData();
        },
        onSuccess: () => {
            // Hapus data user dari cache
            queryClient.setQueryData(['user'], null);
            // Invalidate semua queries yang mungkin bergantung pada autentikasi
            queryClient.invalidateQueries();
        },
    });

    return {
        user: userQuery.data,
        isLoading: userQuery.isLoading,
        isAuthenticated: !!userQuery.data,
        signIn: signInMutation.mutate,
        signInAsync: signInMutation.mutateAsync,
        isSigningIn: signInMutation.isPending,
        signInError: signInMutation.error,
        signUp: signUpMutation.mutate,
        signUpAsync: signUpMutation.mutateAsync,
        isSigningUp: signUpMutation.isPending,
        signUpError: signUpMutation.error,
        logout: logoutMutation.mutate,
        logoutAsync: logoutMutation.mutateAsync,
        isLoggingOut: logoutMutation.isPending,
    };
};