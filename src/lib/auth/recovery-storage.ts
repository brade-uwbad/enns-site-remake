export const RECOVERY_EMAIL_KEY = "admin-recovery-email";

const RECOVERY_EMAIL_EVENT = "admin-recovery-email-change";

function notifyRecoveryEmailChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(RECOVERY_EMAIL_EVENT));
  }
}

export function subscribeRecoveryEmail(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(RECOVERY_EMAIL_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(RECOVERY_EMAIL_EVENT, handler);
  };
}

export function setRecoveryEmail(email: string) {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(RECOVERY_EMAIL_KEY, email);
  notifyRecoveryEmailChange();
}

export function getRecoveryEmail(): string | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  return sessionStorage.getItem(RECOVERY_EMAIL_KEY);
}

export function clearRecoveryEmail() {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(RECOVERY_EMAIL_KEY);
  notifyRecoveryEmailChange();
}
