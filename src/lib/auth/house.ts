/**
 * Customer-facing sign-in methods. Dependency-free so the login page and the
 * popup can share the ids without pulling in the auth server.
 *
 * Google, X, Facebook and Microsoft are Better Auth social providers
 * (`/api/auth/callback/<id>`). Instagram is a generic OAuth provider
 * (`/api/auth/oauth2/callback/instagram`) because Meta does not offer it as a
 * standard social login. Google and X fall back to the shared broker only when
 * Bricksplaza has not supplied its own client yet — that fallback is what makes
 * the permission screen say "xAI".
 */
export const HOUSE_SOCIAL_IDS = ["google", "twitter", "facebook", "microsoft"] as const;

export type SignInChoice = {
  id: string;
  label: string;
  /** `social` → Better Auth social. `oauth2` → generic OAuth (broker or Instagram). */
  mode: "social" | "oauth2";
  /** True when this button uses Bricksplaza's own app, so the consent screen can name Bricksplaza. */
  branded: boolean;
  /** False when the provider cannot start (no Bricksplaza client and no broker fallback). */
  available: boolean;
};

export function isHouseSocial(providerId: string): boolean {
  return (HOUSE_SOCIAL_IDS as readonly string[]).includes(providerId);
}
