// Tipi per il feedback

export interface Feedback {
  id: number;
  user_id: number; // associato lato backend all'utente autenticato
  text: string;
  created_at: string;
}

export interface FeedbackRequest {
  text: string; // inviamo solo il testo, il backend ricava user_id
  user_id: number; // necessario per il backend attuale
}
