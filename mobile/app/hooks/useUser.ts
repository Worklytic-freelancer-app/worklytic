import { useState, useEffect } from 'react';
import { SecureStoreUtils } from '@/utils/SecureStore';
import { baseUrl } from '@/constant/baseUrl';

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

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await SecureStoreUtils.getUserData();
      const token = await SecureStoreUtils.getToken();
      // console.log(userData, "userData");
      // console.log(token, "token");
      
      if (!userData?._id) {
        throw new Error('User ID not found');
      }

      
      const response = await fetch(`${baseUrl}/api/users/${userData._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();

      // console.log(result, "result");

      if (result.success) {
        setUser(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, refetch: fetchUserData };
}; 