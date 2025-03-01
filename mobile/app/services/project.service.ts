import { baseUrl } from "@/constant/baseUrl";
import { SecureStoreUtils } from "@/utils/SecureStore";

interface CreateProjectPayload {
  title: string;
  description: string;
  budget: string;
  category: string;
  location: string;
  duration: string;
  requirements: string;
  images: string[];
}

export const ProjectService = {
  createProject: async (data: CreateProjectPayload) => {
    try {
      const token = await SecureStoreUtils.getToken();
      const userData = await SecureStoreUtils.getUserData();
      
      // Upload images ke cloudinary terlebih dahulu
      const formData = new FormData();
      data.images.forEach((image, index) => {
        formData.append('images', {
          uri: image,
          type: 'image/jpeg',
          name: `project_image_${index}.jpg`
        });
      });

      const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) {
        throw new Error('Failed to upload images');
      }

      // Create project dengan image URLs dari cloudinary
      const response = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          clientId: userData?._id,
          images: uploadResult.data,
          budget: parseInt(data.budget),
          status: 'pending_payment'
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to create project');
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  createPayment: async (projectId: string, amount: number) => {
    try {
      const token = await SecureStoreUtils.getToken();
      const response = await fetch(`${baseUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          amount
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to create payment');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
};