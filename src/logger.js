/**
 * Loguj błąd do konsoli lub zewnętrznego systemu.
 * @param {string} message - Wiadomość błędu.
 * @param {Error} error - Obiekt błędu (opcjonalnie).
 */
export function logError(message, error = null) {
    if (error) {
      console.error(`${message}`, error);
    } else {
      console.error(`${message}`);
    }
  
    // Możliwość rozszerzenia o logowanie do zewnętrznego systemu, np. Sentry
    // Sentry.captureException(error);
  }
  