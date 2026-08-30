export interface EditableProviderProfile {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  bio: string;
  photoUrl: string | null;
  city: string;
  neighborhood: string;
  serviceRadiusKm: number;
  propertyTypes: string[];
  acceptsPets: boolean;
  basePrice: number;
  activityIds: string[];
  isVerified: boolean;
  trustScore: number;
  reviewCount: number;
  verificationStatus: 'DRAFT' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'VERIFIED' | 'REJECTED';
  verificationNote: string | null;
  submittedForReviewAt: string | null;
}

export type UpdateProviderProfilePayload = Omit<EditableProviderProfile, 'id' | 'email' | 'isVerified' | 'trustScore' | 'reviewCount' | 'verificationStatus' | 'verificationNote' | 'submittedForReviewAt'>;
