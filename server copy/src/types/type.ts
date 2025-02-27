import { ObjectId } from "mongodb";

export type CustomResponse<T> = {
  statusCode: number;
  message?: string;
  data?: T;
  error?: string;
};

export type User = {
  _id: ObjectId;
  fullName: string;
  email: string;
  password: string;
  role: "freelancer" | "client";
  profileImage?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  balance?: number;

  // Shared fields
  about?: string;
  phone?: string;

  // Freelancer specific fields
  hourlyRate?: number;
  skills?: string[];
  totalProjects?: number;
  successRate?: number;
  completedProjects?: ObjectId[];

  // Client specific fields
  companyName?: string;
  industry?: string;
  website?: string;
  totalPostedProjects?: number;

  // Rating system
  rating?: number;
  totalReviews?: number;
};

export type Project = {
  _id: ObjectId;
  clientId: ObjectId;
  title: string;
  description?: string;
  budget: number;
  category: string;
  location?: string;
  duration?: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  requirements: string[];
  image: string[];
  createdAt: string;
  updatedAt: string;
  assignedFreelancer?: User[];
  features: ProjectFeature[];
  progress: number;
};

export type ProjectFeature = {
  _id?: ObjectId;
  title: string;
  description: string;
  completedDate?: Date;
  image?: string;
};

export type Service = {
  _id?: ObjectId;
  freelancerId: ObjectId;
  title: string;
  description?: string;
  price: number;
  deliveryTime?: string;
  category?: string;
  images: string[];
  rating: number;
  reviews: number;
  includes: string[];
  requirements: string[];
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  _id?: ObjectId;
  senderId: ObjectId;
  receiverId: ObjectId;
  text: string;
  createdAt: string;
  read: boolean;
};

export type Review = {
  _id?: ObjectId;
  projectId?: ObjectId;
  serviceId?: ObjectId;
  reviewerId?: ObjectId;
  receiverId?: ObjectId;
  rating: number;
  comment?: string;
  createdAt: string;
};
