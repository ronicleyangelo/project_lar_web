export interface AccountSettings {
  id: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  googleLinked: boolean;
  hasPassword: boolean;
  profileVisible: boolean;
  allowRecommendations: boolean;
  createdAt: string;
  deletionRequestedAt: string | null;
  scheduledDeletionAt: string | null;
}
