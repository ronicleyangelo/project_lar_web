export interface User {
  id: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DELETION_PENDING';
  profile?: ClientProfile | ProviderProfile;
}

export interface ClientProfile {
  id: string;
  userId: string;
  fullName: string;
  neighborhood: string;
  city: string;
  fullAddress: string;
  user?: { avatarUrl?: string | null };
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
  propertyTypes: string[];
  acceptsPets: boolean;
  user: { email: string };
  services?: Array<{ id: string; categoryId: string; basePrice: number }>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GoogleProfile {
  email: string;
  fullName: string;
  picture?: string;
}

export interface GoogleAuthResponse {
  requiresOnboarding: boolean;
  token?: string;
  user?: User;
  onboardingToken?: string;
  googleProfile?: GoogleProfile;
}

export interface CompleteGoogleRegistrationPayload {
  onboardingToken: string;
  role: 'CLIENT' | 'PROVIDER';
  phone: string;
  fullName: string;
  neighborhood: string;
  city: string;
  fullAddress?: string;
  bio?: string;
  serviceRadiusKm?: number;
  categoryIds?: string[];
  propertyTypes?: string[];
  acceptsPets?: boolean;
  acceptPrivacy: boolean;
  acceptTerms: boolean;
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
  acceptPrivacy: boolean;
  acceptTerms: boolean;
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
  categoryIds?: string[];
  propertyTypes: string[];
  acceptsPets: boolean;
  acceptPrivacy: boolean;
  acceptTerms: boolean;
}
