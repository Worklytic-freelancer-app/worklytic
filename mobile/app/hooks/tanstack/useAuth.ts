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
            const response = await fetch(`${baseUrl}/api/auth/sign-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            
            const result = await response.json() as AuthResponse;
            
            if (!response.ok) {
                throw new Error(result.message || 'Gagal melakukan login');
            }
            
            return result;
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
            
            const result = await response.json() as AuthResponse;
            
            if (!response.ok) {
                throw new Error(result.message || 'Gagal melakukan registrasi');
            }
            
            return result;
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