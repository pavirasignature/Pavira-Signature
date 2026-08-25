import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextApiRequest, NextApiResponse } from "next";

// ─── Lazy-load backend modules (prevents module-load failures from breaking NextAuth) ─
// If the Express backend fails to load, NextAuth routes still work.
let _app: any = null;
let _supabase: any = null;
let _generateToken: any = null;

function getExpressApp() {
  if (!_app) {
    try {
      // @ts-ignore
      _app = require("../../../../backend/server");
    } catch (e) {
      console.error("[NextAuth] Failed to load Express backend:", e);
    }
  }
  return _app;
}

function getSupabase() {
  if (!_supabase) {
    try {
      // @ts-ignore
      _supabase = require("../../../../backend/utils/supabase").supabase;
    } catch (e) {
      console.error("[NextAuth] Failed to load Supabase client:", e);
    }
  }
  return _supabase;
}

function getGenerateToken() {
  if (!_generateToken) {
    try {
      // @ts-ignore
      _generateToken = require("../../../../backend/utils/jwt").generateToken;
    } catch (e) {
      console.error("[NextAuth] Failed to load JWT util:", e);
    }
  }
  return _generateToken;
}

// ─── NextAuth Handler (Google OAuth only) ────────────────────────────────────
const nextAuthHandler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "pavira_signature_nextauth_secret_key_32chars",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      const googleProfile = profile as any;
      if (account?.provider === "google" && googleProfile) {
        const googleId = googleProfile.sub || googleProfile.id;
        const normalizedEmail = (googleProfile.email || "").toLowerCase().trim();
        token.id = googleId as string;
        token.email = normalizedEmail;
        token.name = googleProfile.name as string;
        token.picture = googleProfile.picture as string;
        token.googleId = googleId;
        token.firstName = googleProfile.given_name as string;
        token.lastName = googleProfile.family_name as string;

        if (
          account ||
          !token.backendToken ||
          typeof token.backendToken !== "string" ||
          token.backendToken.startsWith("google_oauth_")
        ) {
          try {
            const supabase = getSupabase();
            const generateToken = getGenerateToken();

            if (!supabase || !generateToken) {
              throw new Error("Backend services unavailable");
            }

            let dbUser = null;

            const { data: usersByGoogleId } = await supabase
              .from("users")
              .select("*")
              .eq("googleId", googleId);

            if (usersByGoogleId && usersByGoogleId.length > 0) {
              dbUser = usersByGoogleId[0];
            } else if (normalizedEmail) {
              const { data: usersByEmail } = await supabase
                .from("users")
                .select("*")
                .ilike("email", normalizedEmail);

              if (usersByEmail && usersByEmail.length > 0) {
                const existingUser = usersByEmail[0];
                const { data: updatedUser } = await supabase
                  .from("users")
                  .update({ googleId, isVerified: true, isActive: true })
                  .eq("id", existingUser.id)
                  .select()
                  .single();
                dbUser = updatedUser || existingUser;
              } else {
                const userPayload = {
                  firstName: googleProfile.given_name || "User",
                  lastName: googleProfile.family_name || "",
                  name:
                    googleProfile.name ||
                    `${googleProfile.given_name || "User"} ${googleProfile.family_name || ""}`.trim(),
                  email: normalizedEmail,
                  password: `google_oauth_${googleId}_${Date.now()}`,
                  googleId,
                  role: "customer",
                  isBlocked: false,
                  isVerified: true,
                  isActive: true,
                };

                const { data: newUser, error: insertError } = await supabase
                  .from("users")
                  .insert([userPayload])
                  .select()
                  .single();

                if (insertError) {
                  console.error("Supabase Google User Insert Error:", insertError);
                }

                dbUser = newUser;
              }
            }

            if (dbUser) {
              token.backendToken = generateToken(dbUser.id);
              token.backendUser = {
                id: dbUser.id,
                email: dbUser.email,
                name:
                  dbUser.name ||
                  `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim(),
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
                image: dbUser.photoUrl || googleProfile.picture,
                role: dbUser.role || "customer",
                googleId: dbUser.googleId,
                isVerified: true,
              };
            } else {
              const fallbackId = googleId || `google_${Date.now()}`;
              token.backendToken = generateToken(fallbackId);
              token.backendUser = {
                id: fallbackId,
                email: normalizedEmail,
                name: googleProfile.name,
                firstName: googleProfile.given_name,
                lastName: googleProfile.family_name,
                image: googleProfile.picture,
                role: "customer",
                googleId,
                isVerified: true,
              };
            }
          } catch (error) {
            console.error("Supabase Google Auth Sync Error:", error);
            const generateToken = getGenerateToken();
            const fallbackId = googleId || `google_${Date.now()}`;
            token.backendToken = generateToken
              ? generateToken(fallbackId)
              : `fallback_${fallbackId}`;
            token.backendUser = {
              id: fallbackId,
              email: normalizedEmail,
              name: googleProfile.name,
              firstName: googleProfile.given_name,
              lastName: googleProfile.family_name,
              image: googleProfile.picture,
              role: "customer",
              googleId,
              isVerified: true,
            };
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        const backendUser = (token as any).backendUser;
        session.user = {
          ...session.user,
          ...(backendUser || {}),
          id: backendUser?.id || (token as any).id,
          googleId: (token as any).googleId,
          firstName: backendUser?.firstName || (token as any).firstName,
          lastName: backendUser?.lastName || (token as any).lastName,
          picture: (token as any).picture || session.user?.image,
          image: (token as any).picture || session.user?.image,
          email:
            backendUser?.email || (token as any).email || session.user?.email,
          name:
            backendUser?.name || (token as any).name || session.user?.name,
        } as typeof session.user;
        (session as any).accessToken = (token as any).backendToken;
        (session as any).authError = (token as any).backendSyncError;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV !== "production",
});

// ─── NextAuth action identifiers ─────────────────────────────────────────────
// Only these path segments should be handled by NextAuth.
// Everything else (e.g. /api/auth/login, /api/auth/register) is proxied to Express.
const nextAuthActions = new Set([
  "signin",
  "signout",
  "session",
  "csrf",
  "providers",
  "callback",
  "_log",
  "error",
]);

// ─── Manual body parser (stream → JSON/FormData) ─────────────────────────────
// Because bodyParser is disabled below (required for NextAuth's CSRF flow),
// we must manually read and parse the raw stream for Express passthrough routes.
function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // If stream was already consumed (e.g. in-process call), resolve empty
    if (!req.readable) return resolve(Buffer.alloc(0));
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function ensureBodyParsed(req: NextApiRequest): Promise<void> {
  // Skip if body already populated
  if (req.body !== undefined && req.body !== null) return;

  try {
    const rawBody = await readRawBody(req);
    if (rawBody.length === 0) {
      req.body = {};
      return;
    }

    const contentType = (req.headers["content-type"] || "").toLowerCase();

    if (contentType.includes("application/json")) {
      try {
        req.body = JSON.parse(rawBody.toString("utf-8"));
      } catch {
        req.body = {};
      }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(rawBody.toString("utf-8"));
      req.body = Object.fromEntries(params.entries());
    } else {
      // Leave raw for multipart/other — Express will handle
      req.body = rawBody;
    }
  } catch {
    req.body = {};
  }
}

// ─── Main route handler ───────────────────────────────────────────────────────
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const nextauthQuery = req.query.nextauth;
  const action = Array.isArray(nextauthQuery)
    ? nextauthQuery[0]
    : nextauthQuery;

  // ① Google OAuth, session, csrf, etc. → NextAuth
  if (action && nextAuthActions.has(action)) {
    return nextAuthHandler(req, res);
  }

  // ② Manual auth routes (/api/auth/login, /api/auth/register, etc.) → Express
  // Parse the raw body manually first (since bodyParser is false)
  await ensureBodyParsed(req);

  const app = getExpressApp();
  if (!app) {
    return res.status(503).json({
      success: false,
      message: "Backend service temporarily unavailable. Please try again.",
    });
  }

  return new Promise<void>((resolve) => {
    app(req, res, (err: any) => {
      if (err) {
        console.error("Express Auth Route Error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Server error", message: err.message });
        }
      }
      resolve();
    });
  });
}

export const config = {
  api: {
    /**
     * IMPORTANT: bodyParser MUST be false here.
     * NextAuth needs to read the raw body for CSRF token validation.
     * We manually parse the body in ensureBodyParsed() for Express routes.
     */
    bodyParser: false,
    externalResolver: true,
  },
};
