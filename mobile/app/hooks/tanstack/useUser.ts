import { useQuery } from '@tanstack/react-query';
import { baseUrl } from '@/constant/baseUrl';
import { SecureStoreUtils } from '@/utils/SecureStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigators';
import { handleAuthError } from '@/utils/handleAuthError';

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    profileImage: string;
    location: string;
    balance: number;
    about: string;
    phone: string;
    skills: string[];
    totalProjects: number;
    successRate: number;
    website: string;
    rating: number;
    totalReviews: number;
}

export const useUser = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const userData = await SecureStoreUtils.getUserData();
                const token = await SecureStoreUtils.getToken();
                
                if (!userData?._id) {
                    throw new Error('User ID not found');
                }

                if (!token) {
                    throw new Error('Token not found');
                }
                
                const response = await fetch(`${baseUrl}/api/users/${userData._id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }
                
                const result = await response.json();

                if (result.success) {
                    return result.data as User;
                } else {
                    throw new Error(result.message || 'Failed to fetch user data');
                }
            } catch (err) {
                // Handle auth error dan auto logout jika perlu
                await handleAuthError(err, navigation);
                throw err;
            }
        },
        staleTime: 5 * 60 * 1000, // Data dianggap fresh selama 5 menit
    });
}; 