export interface EntityActionResponse<T> {
  message: string;
  appointment?: T;
  quote?: T;
  review?: T;
}
