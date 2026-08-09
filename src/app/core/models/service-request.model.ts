import { Category } from './category.model';
import { ProviderProfile } from './user.model';

export interface ServiceRequest {
  id: string;
  clientId: string;
  categoryId: string;
  category: Category;
  description: string;
  neighborhood: string;
  city: string;
  scheduledDate: string;
  timeSlot: string;
  budgetLimit?: number;
  status: string;
  quotes: Quote[];
  approxDistanceKm?: number;
}

export interface Quote {
  id: string;
  requestId: string;
  providerId: string;
  provider: ProviderProfile;
  price: number;
  estimatedDuration: string;
  message: string;
  status: string;
}

export interface CreateRequestPayload {
  categoryId: string;
  city: string;
  neighborhood: string;
  scheduledDate: string;
  timeSlot: string;
  budgetLimit?: number;
  description: string;
}

export interface SendQuotePayload {
  requestId: string;
  price: number;
  estimatedDuration: string;
  message: string;
}
