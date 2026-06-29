import "server-only";

/**
 * Checks the `x-the-edit-secret` request header against the `THE_EDIT_API_SECRET`
 * environment variable on mutable API routes.
 *
 * Behavior:
 * - If `THE_EDIT_API_SECRET` is not set → returns null (allow, local dev mode).
 * - If the header matches the secret → returns null (authorized).
 * - Otherwise → returns a 401 Response (reject).
 *
 * Usage in a route handler:
 *   const authError = getApiSecretError(request);
 *   if (authError) return authError;
 */
export function getApiSecretError(request: Request): Response | null {
  const secret = process.env.THE_EDIT_API_SECRET;

  if (!secret) {
    return null;
  }

  const provided = request.headers.get("x-the-edit-secret");

  if (provided === secret) {
    return null;
  }

  return Response.json(
    { ok: false, error: "Unauthorized." },
    { status: 401 },
  );
}
