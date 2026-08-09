import { ProviderProfile, ClientProfile } from './user.model';

export interface Appointment {
  id: string;
  requestId: string;
  clientId: string;
  providerId: string;
  scheduledAt: string;
  status: string;
  provider?: ProviderProfile;
  client?: ClientProfile;
  review?: Review;
}

export interface Review {
  id: string;
  appointmentId: string;
  qualityRating: number;
  punctualityRating: number;
  communicationRating: number;
  careRating: number;
  costBenefitRating: number;
  averageScore: number;
  comment: string;
}

export interface CreateReviewPayload {
  appointmentId: string;
  qualityRating: number;
  punctualityRating: number;
  communicationRating: number;
  careRating: number;
  costBenefitRating: number;
  comment: string;
}
