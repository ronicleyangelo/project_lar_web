export interface User {
  id: string;
  email: string;
  phone: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  profile?: ClientProfile | ProviderProfile;
}

export interface ClientProfile {
  id: string;
  userId: string;
  fullName: string;
  neighborhood: string;
  city: string;
  fullAddress: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  fullName: string;
  bio: string;
  photoUrl: string | null;
  neighborhood: string;
  city: string;
  serviceRadiusKm: number;
  isVerified: boolean;
  trustScore: number;
  reviewCount: number;
  user: { email: string };
  services?: Array<{ id: string; categoryId: string; basePrice: number }>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterClientPayload {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  neighborhood: string;
  city: string;
  fullAddress: string;
}

export interface RegisterProviderPayload {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  bio: string;
  city: string;
  neighborhood: string;
  serviceRadiusKm: number;
  categoryIds: string[];
}
