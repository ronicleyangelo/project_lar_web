export interface AppointmentStatusView {
  label: string;
  badgeClass: string;
  canStart: boolean;
  canComplete: boolean;
  canConfirm: boolean;
  canReview: boolean;
}

// O status chega da API como string; valores novos ou desconhecidos podem não
// existir ainda neste mapa, por isso a indexação pode legitimamente ser undefined.
export const APPOINTMENT_STATUS_VIEWS: Partial<Record<string, AppointmentStatusView>> = {
  SCHEDULED: { label: 'Agendado', badgeClass: 'bg-info text-white', canStart: true, canComplete: true, canConfirm: false, canReview: false },
  IN_PROGRESS: { label: 'Em andamento', badgeClass: 'bg-warning text-dark', canStart: false, canComplete: true, canConfirm: false, canReview: false },
  AWAITING_CONFIRMATION: { label: 'Aguardando confirmação', badgeClass: 'bg-warning text-dark', canStart: false, canComplete: false, canConfirm: true, canReview: false },
  COMPLETED: { label: 'Concluído', badgeClass: 'bg-success text-white', canStart: false, canComplete: false, canConfirm: false, canReview: true },
  CANCELLED: { label: 'Cancelado', badgeClass: 'bg-secondary text-white', canStart: false, canComplete: false, canConfirm: false, canReview: false },
  DISPUTED: { label: 'Em disputa', badgeClass: 'bg-danger text-white', canStart: false, canComplete: false, canConfirm: false, canReview: false },
};

export const REQUEST_STATUS_VIEWS: Record<string, { label: string; badgeClass: string; canAcceptQuote: boolean }> = {
  OPEN: { label: 'Aberto', badgeClass: 'bg-warning text-dark', canAcceptQuote: true },
  QUOTED: { label: 'Com propostas', badgeClass: 'bg-info text-white', canAcceptQuote: true },
  ACCEPTED: { label: 'Aceito', badgeClass: 'bg-success text-white', canAcceptQuote: false },
  COMPLETED: { label: 'Concluído', badgeClass: 'bg-success text-white', canAcceptQuote: false },
  CANCELLED: { label: 'Cancelado', badgeClass: 'bg-secondary text-white', canAcceptQuote: false },
};

export const VERIFICATION_STATUS_VIEWS: Record<string, { label: string; badgeClass: string; canReview: boolean }> = {
  DRAFT: { label: 'Rascunho', badgeClass: 'bg-secondary', canReview: false },
  PENDING_REVIEW: { label: 'Aguardando análise', badgeClass: 'bg-warning text-dark', canReview: true },
  CHANGES_REQUESTED: { label: 'Correções solicitadas', badgeClass: 'bg-info text-white', canReview: false },
  VERIFIED: { label: 'Aprovado', badgeClass: 'bg-success', canReview: false },
  REJECTED: { label: 'Reprovado', badgeClass: 'bg-danger', canReview: false },
};
