import { useSyncExternalStore } from "react";

import { getRecoveryEmail, subscribeRecoveryEmail } from "@/lib/auth/recovery-storage";

/** Recovery email from sessionStorage; server and first hydration pass use empty string. */
export function useRecoveryEmail(): string {
  return useSyncExternalStore(
    subscribeRecoveryEmail,
    () => getRecoveryEmail() ?? "",
    () => "",
  );
}
