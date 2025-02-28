interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "freelancer" | "client";
  profileImage: string;
  location: string;
  about: string;
  phone: string;
  skills: string[];
  companyName: string;
  industry: string;
  // ... properti lainnya
} 