/**
 * Shared between the server and the browser (no secrets here).
 *
 * A documents session normally carries the confirmed email. When the portal is
 * unlocked with the shared access password instead, the session carries this
 * label, so the page can say how it was unlocked and downloads are still logged.
 */
export const PASSWORD_SESSION_LABEL = "access password";

export function isPasswordSession(email: string | null | undefined): boolean {
  return email === PASSWORD_SESSION_LABEL;
}
