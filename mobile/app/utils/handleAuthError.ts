import { SecureStoreUtils } from './SecureStore';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigators';

export const handleAuthError = async (
    error: any, 
    navigation?: NavigationProp<RootStackParamList>
): Promise<boolean> => {
    // Cek apakah error berkaitan dengan token
    const isAuthError = 
        error?.message?.includes('token') || 
        error?.message?.includes('unauthorized') ||
        error?.message?.includes('Unauthorized') ||
        error?.message?.includes('Invalid token') ||
        error?.status === 401;
    
    if (isAuthError && navigation) {
        // Hapus data auths
        await SecureStoreUtils.clearAuthData();
        
        // Langsung reset navigasi ke halaman login tanpa alert
        navigation.reset({
            index: 0,
            routes: [{ name: "SignIn" }],
        });
        
        return true;
    }
    return false;
} 