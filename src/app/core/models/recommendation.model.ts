import { ProviderProfile } from './user.model';

export interface Recommendation {
  provider: ProviderProfile;
  totalScore: number;
  isNewProvider: boolean;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  adjustedRatingScore: number;
  distanceScore: number;
  completionScore: number;
  availabilityScore: number;
  responseScore: number;
  rehireScore: number;
  priceScore: number;
}

export interface SearchParams {
  categoryId: string;
  city: string;
  neighborhood: string;
  minBudget?: number;
  maxBudget?: number;
}
