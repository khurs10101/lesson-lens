/**
 * Feature flags safe for both client and server use.
 * All values derive from NEXT_PUBLIC_ env vars.
 *
 * To enable auth: set NEXT_PUBLIC_AUTH_ENABLED=true in .env.local
 *   (also requires NEXTAUTH_SECRET + DATABASE_URL to be configured)
 */

export const IS_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

/** True when running in demo mode (no real Bedrock calls). */
export const IS_DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";
