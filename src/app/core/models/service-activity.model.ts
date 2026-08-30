export interface ServiceActivity {
  id: string;
  code: string;
  name: string;
  description: string | null;
  includedByDefault: boolean;
  suggestedMinutes: number;
  defaultExtraPrice: number;
}
