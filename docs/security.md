# LessonLens — Security Audit Report

**Date:** 2026-03-13
**Scope:** Full codebase review — API routes, middleware, auth, client components, dependencies, configuration

---

## Summary

| Category | Status |
|----------|--------|
| Hardcoded secrets in source code | PASS |
| SQL injection | PASS |
| XSS (Cross-Site Scripting) | PASS |
| Authentication coverage | PARTIAL — 2 API routes unprotected |
| Cookie security | PASS |
| CSRF protection | PARTIAL — sameSite only, no explicit tokens |
| Rate limiting | MISSING |
| Content-Security-Policy headers | MISSING |
| Open redirect prevention | PASS |
| File upload validation | PASS |
| Dependency vulnerabilities | PASS |
| `.env` files committed to git | PASS — only `.env.example` tracked |

---

## Critical Issues

### 1. Unauthenticated API Endpoints — `/api/translate` and `/api/canvas`

**Severity:** HIGH
**Files:** `app/api/translate/route.ts`, `app/api/canvas/route.ts`

These endpoints have **no authentication checks**. While the gate middleware (`middleware.ts`) protects them when `GATE_TOKEN` is configured, they lack the `IS_AUTH_ENABLED` / `getServerSession()` checks present in other routes like `/api/adapt`, `/api/upload`, `/api/audio`, and `/api/refine`.

**Impact:**
- `/api/canvas` calls Amazon Nova Canvas (image generation) — an unauthenticated caller could run up AWS Bedrock costs
- `/api/translate` currently returns a placeholder, but would call Bedrock in production

**Comparison with protected routes:**

```typescript
// ✅ /api/adapt — properly protected
const session = IS_AUTH_ENABLED ? await getServerSession(authOptions) : null;
if (IS_AUTH_ENABLED && !session) {
  return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
}

// ❌ /api/canvas — no auth check
export async function POST(req: NextRequest) {
  // goes straight to business logic
}
```

**Recommendation:** Add the same `IS_AUTH_ENABLED` + `getServerSession()` guard used in `/api/adapt`.

---

### 2. No Rate Limiting

**Severity:** HIGH
**Affected:** All API routes

No rate limiting exists at the application level. Endpoints that call AWS services (`/api/adapt`, `/api/canvas`, `/api/audio`, `/api/upload`) can be called repeatedly, potentially causing:
- AWS cost spikes (Bedrock, Polly, S3)
- Resource exhaustion on the EC2 instance

**Recommendation:** Add rate limiting via middleware or a library like `@upstash/ratelimit`. At minimum, protect AI-calling routes with per-IP or per-session limits.

---

## Medium Issues

### 3. No Content-Security-Policy Headers

**Severity:** MEDIUM
**File:** `next.config.mjs`

No CSP headers are configured. While React provides built-in XSS protection via JSX escaping, CSP adds defense-in-depth against script injection.

**Recommendation:** Add security headers in `next.config.mjs`:

```javascript
const securityHeaders = [
  { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];
```

### 4. No CSRF Token Validation

**Severity:** MEDIUM
**File:** `middleware.ts`, `app/api/login/route.ts`

The gate login relies solely on `sameSite: "lax"` cookies for CSRF protection. This is acceptable for most cases but does not protect against top-level GET-based navigations.

**Mitigating factors:**
- All state-changing operations use POST (safe under `sameSite: "lax"`)
- No GET-based mutations

**Recommendation:** Consider adding a CSRF token for the login form if the app becomes public-facing.

### 5. Open Registration When Database Is Enabled

**Severity:** MEDIUM
**File:** `app/api/register/route.ts`

The registration endpoint has no invite-only gate, CAPTCHA, or rate limit. Anyone can create accounts when `IS_DB_ENABLED` is true.

**Mitigating factors:**
- Only active when a database is configured
- Validates email, name, password (min 8 chars)
- Checks for duplicate emails
- Passwords hashed with bcryptjs (salt 12)

**Recommendation:** Add email verification or CAPTCHA for production use.

---

## Low Issues / Observations

### 6. Error Messages in API Routes

**Severity:** LOW

Error responses use generic messages (e.g., "Translation failed. Please try again.") which is good — no stack traces or internal details are leaked to clients.

### 7. AWS Credential Chain

**Severity:** INFO

All AWS services (Bedrock, Polly, S3) use the SDK default credential chain. No access keys are hardcoded or stored in source. On EC2, credentials come from the IAM Role via instance metadata. This is the recommended approach.

### 8. `serverExternalPackages` Warning

**Severity:** INFO
**File:** `next.config.mjs`

Next.js 14 shows "unrecognized key" warning for `serverExternalPackages`. This is harmless — the key is valid in Next.js 15. No security impact.

---

## What's Done Well

| Area | Details |
|------|---------|
| **No hardcoded secrets** | All credentials via environment variables |
| **SQL injection prevention** | Prisma ORM with parameterized queries throughout |
| **XSS prevention** | React JSX escaping, no `dangerouslySetInnerHTML`, no `eval()` |
| **Cookie security** | `httpOnly`, `sameSite: "lax"`, conditional `secure` flag |
| **Open redirect prevention** | Callback URL validated in `app/auth/signin/page.tsx` (rejects absolute/protocol-relative URLs) |
| **Password hashing** | bcryptjs with salt 12 in `/api/register` and `lib/auth.ts` |
| **File upload validation** | Whitelist (PDF, PNG, JPG, WEBP), 25 MB max, S3 presigned URLs expire in 1 hour |
| **SSML injection prevention** | `lib/polly.ts` escapes `&`, `<`, `>`, `"`, `'` before passing to Polly |
| **AI prompt safety** | `lib/prompts.ts` includes GROUNDING_RULES to prevent hallucination |
| **Ownership enforcement** | `lib/storage-server.ts` checks `userId` before updating lessons |
| **`.gitignore`** | Properly excludes `.env`, `.env*.local`, `node_modules` |
| **Git history cleanup** | Commits `2aa674e` and `c23c2bf` removed previously hardcoded credentials from docs |

---

## Files Reviewed

**API Routes:**
- `app/api/login/route.ts` — Gate login (POST, sets httpOnly cookie)
- `app/api/logout/route.ts` — Gate logout (clears cookie)
- `app/api/adapt/route.ts` — Lesson adaptation (auth-gated)
- `app/api/audio/route.ts` — Polly TTS (auth-gated)
- `app/api/refine/route.ts` — AI refinement (auth-gated)
- `app/api/upload/route.ts` — File upload to S3 (auth-gated)
- `app/api/translate/route.ts` — Translation (NO auth check)
- `app/api/canvas/route.ts` — Image generation (NO auth check)
- `app/api/register/route.ts` — User registration (DB-gated)
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handler

**Core Libraries:**
- `middleware.ts` — Gate cookie enforcement
- `lib/auth.ts` — NextAuth v4 config (JWT sessions, Google OAuth, credentials)
- `lib/db.ts` — Prisma v7 with pg driver adapter
- `lib/nova.ts` — Bedrock client (Nova Lite, Pro, Canvas)
- `lib/polly.ts` — Amazon Polly TTS with SSML escaping
- `lib/s3.ts` — S3 upload/download with presigned URLs
- `lib/storage.ts` — Client-side localStorage (lesson data only)
- `lib/storage-server.ts` — Server-side Prisma storage with ownership checks
- `lib/schemas.ts` — Zod validation schemas
- `lib/prompts.ts` — AI prompt templates with grounding rules
- `lib/flags.ts` — Feature flags (NEXT_PUBLIC_ only)

**Configuration:**
- `next.config.mjs`
- `.gitignore`
- `.env.example`
- `prisma/schema.prisma`

---

## Priority Actions

1. **Add auth checks** to `/api/translate` and `/api/canvas`
2. **Add rate limiting** to AI-calling API routes
3. **Add security headers** (CSP, X-Frame-Options, X-Content-Type-Options)
4. **Add email verification** to registration flow (if DB auth is used in production)
