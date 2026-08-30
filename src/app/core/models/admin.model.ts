export interface AdminMetrics {
  totalUsers: number;
  totalClients: number;
  totalProviders: number;
  totalRequests: number;
  openRequests: number;
  totalQuotes: number;
  totalAppointments: number;
  activeAppointments: number;
  completedAppointments: number;
  totalReviews: number;
  pendingReviews: number;
  suspendedUsers: number;
  conversionRate: string;
  completionRate: string;
}

export interface AdminProvider {
  id: string;
  fullName: string;
  photoUrl?: string | null;
  verificationStatus: string;
  verificationNote?: string | null;
  bio?: string | null;
  serviceRadiusKm?: number;
  trustScore?: number;
  reviewCount?: number;
  propertyTypes?: string[];
  acceptsPets?: boolean;
  submittedForReviewAt?: string | null;
  createdAt?: string;
  user: { email: string; phone: string; status: string; emailVerified?: boolean; phoneVerified?: boolean; createdAt?: string };
  services: Array<{ basePrice: number; description?: string | null; category: { name: string } }>;
  coverageAreas: Array<{ city: string; neighborhood: string }>;
  activities: Array<{ extraPrice?: number | null; activity: { code?: string; name: string; description?: string | null } }>;
  availabilities?: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
}
