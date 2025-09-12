// src/utils/errorHandler.ts

export type AuthAction = "login" | "register" | "refresh" | "logout";

export const mapAuthError = (error: any, action: AuthAction): string => {
  if (!error) return "";

  if ("status" in error) {
    switch (action) {
      case "register":
        switch (error.status) {
          case 400:
            return "Dati non validi o campi mancanti";
          case 409:
            return "Email o username già esistenti";
          case 422:
            return "Validazione fallita";
          default:
            return "Errore durante la registrazione";
        }

      case "login":
        switch (error.status) {
          case 400:
            return "Richiesta non valida (controlla email e password)";
          case 401:
            return "Credenziali non valide";
          default:
            return "Errore durante il login";
        }

      case "refresh":
        switch (error.status) {
          case 400:
            return "Token non valido o scaduto";
          case 401:
            return "Non autenticato";
          default:
            return "Errore durante il refresh del token";
        }

      case "logout":
        switch (error.status) {
          case 400:
            return "Token mancante o non valido";
          case 401:
            return "Non autenticato";
          default:
            return "Errore durante il logout";
        }

      default:
        return "Errore sconosciuto";
    }
  }

  if ("error" in error) {
    return "Errore di connessione, controlla la rete";
  }

  return "Errore imprevisto";
};
