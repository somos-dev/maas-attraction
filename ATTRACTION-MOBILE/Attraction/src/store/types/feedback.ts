// src/store/types/feedback.ts
export interface Feedback {
  id?: number;         // opzionale: il serializer potrebbe non restituirlo
  text: string;
  created_at?: string; // opzionali: se il backend li espone
  updated_at?: string;
}

// La request deve combaciare con il serializer DRF (solo text)
export type FeedbackRequest = Pick<Feedback, "text">;

