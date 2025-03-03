import { useState, useEffect, useCallback } from 'react';
import { SecureStoreUtils } from '@/utils/SecureStore';
import { baseUrl } from '@/constant/baseUrl';
import { useFocusEffect } from '@react-navigation/native';

export interface Service {
  _id: string;
  freelancerId: string;
  title: string;
  description: string;
  price: number;
  deliveryTime: string;
  category: string;
  images: string[];
  rating: number;
  reviews: number;
  includes: string[];
  requirements: string[];
  createdAt: string;
  updatedAt: string;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [])
  );

  const fetchServices = async () => {
    try {
      setLoading(true);
      const userData = await SecureStoreUtils.getUserData();
      const token = await SecureStoreUtils.getToken();
      
      if (!userData?._id) {
        throw new Error('User ID not found');
      }

      // Mengambil semua layanan
      const response = await fetch(`${baseUrl}/api/services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();

      if (result.success) {
        // Filter layanan berdasarkan freelancerId yang sama dengan user._id
        const userServices = result.data.filter(
          (service: Service) => service.freelancerId === userData._id
        );
        setServices(userServices);
      } else {
        throw new Error(result.message || 'Failed to fetch services');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { services, loading, error, refetch: fetchServices };
}; 