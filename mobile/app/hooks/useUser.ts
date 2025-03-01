import { useState, useEffect } from 'react';
import { SecureStoreUtils } from '@/utils/SecureStore';
import { baseUrl } from '@/constant/baseUrl';
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
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
        // Jika response tidak ok, cek apakah error auth
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Handle auth error dan auto logout jika perlu
      const isAuthError = await handleAuthError(err, navigation);
      
      if (!isAuthError) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, refetch: fetchUserData };
}; 