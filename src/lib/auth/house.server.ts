/**
 * Bricksplaza-owned OAuth apps. The name on Google, X, Facebook, Microsoft and
 * Instagram's permission screen is the name registered on THAT app — code cannot
 * rename xAI's shared client. Set the app name to "Bricksplaza" in each console,
 * then put the client id and secret on the server.
 *
 * Callbacks (append to the public site origin, no trailing slash on the origin):
 *   Google     /api/auth/callback/google
 *   X          /api/auth/callback/twitter
 *   Facebook   /api/auth/callback/facebook
 *   Microsoft  /api/auth/callback/microsoft
 *   Instagram  /api/auth/oauth2/callback/instagram
 */
import type { SignInChoice } from "./house";

type Pair = { clientId: string; clientSecret: string };

function pair(idKey: string, secretKey: string): Pair | null {
  const clientId = process.env[idKey]?.trim();
  const clientSecret = process.env[secretKey]?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function houseSocialProviders() {
  const google = pair("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET");
  const twitter = pair("TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET");
  const facebook = pair("FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET");
  const microsoft = pair("MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET");
  const tenantId = process.env.MICROSOFT_TENANT_ID?.trim() || "common";

  return {
    ...(google ? { google: { ...google, prompt: "select_account" as const } } : {}),
    ...(twitter ? { twitter } : {}),
    ...(facebook ? { facebook } : {}),
    ...(microsoft ? { microsoft: { ...microsoft, tenantId, prompt: "select_account" as const } } : {}),
  };
}

/** Instagram Login (professional accounts). Personal Instagram accounts cannot use this. */
export function instagramOAuthConfig() {
  const creds = pair("INSTAGRAM_CLIENT_ID", "INSTAGRAM_CLIENT_SECRET");
  if (!creds) return null;
  return {
    providerId: "instagram",
    clientId: creds.clientId,
    clientSecret: creds.clientSecret,
    authorizationUrl: "https://www.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    scopes: ["instagram_business_basic"],
    pkce: false,
    async getToken({
      code,
      redirectURI,
    }: {
      code: string;
      redirectURI: string;
    }) {
      const body = new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectURI,
        code,
      });
      const res = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      });
      const json = (await res.json().catch(() => null)) as {
        access_token?: string;
        user_id?: string | number;
        expires_in?: number;
        data?: Array<{ access_token?: string; user_id?: string | number; expires_in?: number }>;
        error_message?: string;
      } | null;
      const row = json?.access_token ? json : json?.data?.[0];
      if (!row?.access_token) {
        throw new Error(json?.error_message || "instagram_token_failed");
      }
      return {
        accessToken: row.access_token,
        accessTokenExpiresAt: row.expires_in ? new Date(Date.now() + row.expires_in * 1000) : undefined,
        scopes: ["instagram_business_basic"],
        raw: { user_id: row.user_id },
      };
    },
    async getUserInfo(tokens: { accessToken?: string }) {
      if (!tokens.accessToken) return null;
      const url = new URL("https://graph.instagram.com/me");
      url.searchParams.set("fields", "id,username,name,profile_picture_url");
      url.searchParams.set("access_token", tokens.accessToken);
      const res = await fetch(url);
      if (!res.ok) return null;
      const profile = (await res.json()) as {
        id?: string;
        username?: string;
        name?: string;
        profile_picture_url?: string;
      };
      const id = String(profile.id || "").trim();
      if (!id) return null;
      const username = profile.username?.trim() || id;
      return {
        id,
        name: profile.name?.trim() || username,
        // Instagram does not share an email. A reserved domain keeps the account
        // unique without pretending we can write to the person.
        email: `${id}@users.instagram.invalid`,
        image: profile.profile_picture_url,
        emailVerified: false,
      };
    },
  };
}

export function signInChoices(): SignInChoice[] {
  const google = Boolean(pair("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"));
  const twitter = Boolean(pair("TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"));
  const facebook = Boolean(pair("FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET"));
  const instagram = Boolean(pair("INSTAGRAM_CLIENT_ID", "INSTAGRAM_CLIENT_SECRET"));
  const microsoft = Boolean(pair("MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"));

  return [
    google
      ? { id: "google", label: "Google", mode: "social", branded: true, available: true }
      : { id: "grok-google", label: "Google", mode: "oauth2", branded: false, available: true },
    twitter
      ? { id: "twitter", label: "X", mode: "social", branded: true, available: true }
      : { id: "grok-x", label: "X", mode: "oauth2", branded: false, available: true },
    {
      id: "facebook",
      label: "Facebook",
      mode: "social",
      branded: facebook,
      available: facebook,
    },
    {
      id: "instagram",
      label: "Instagram",
      mode: "oauth2",
      branded: instagram,
      available: instagram,
    },
    {
      id: "microsoft",
      label: "Microsoft",
      mode: "social",
      branded: microsoft,
      available: microsoft,
    },
  ];
}
