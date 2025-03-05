import { useQuery } from '@tanstack/react-query';
import { baseUrl } from '@/constant/baseUrl';
import { SecureStoreUtils } from '@/utils/SecureStore';

export interface Service {
    _id: string;
    freelancerId?: string;
    title: string;
    description: string;
    price: number;
    deliveryTime?: string;
    category?: string;
    images: string[];
    rating?: number;
    reviews?: number;
    includes?: string[];
    requirements?: string[];
    createdAt: string;
    updatedAt: string;
}

interface User {
    _id: string;
    fullName: string;
    email: string;
    password: string;
    role: string;
    profileImage: string;
    location: string;
    createdAt: string;
    updatedAt: string;
    balance: number;
    about: string;
    phone: string;
    skills: string[];
    totalProjects: number;
    companyName: string;
    industry: string;
    website: string;
    rating: number;
    totalReviews: number;
    services: Service[];
}

export const useUser = () => {
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
            } catch (error) {
                console.error('Error fetching user data:', error);
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 menit
    });
};
