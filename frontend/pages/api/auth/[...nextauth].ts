import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import app from "../../../../backend/server";
// @ts-ignore
import { supabase } from "../../../../backend/utils/supabase";
// @ts-ignore
import { generateToken } from "../../../../backend/utils/jwt";

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

        if (account || !token.backendToken || typeof token.backendToken !== "string" || token.backendToken.startsWith("google_oauth_")) {
          try {
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
                  name: googleProfile.name || `${googleProfile.given_name || 'User'} ${googleProfile.family_name || ''}`.trim(),
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
                name: dbUser.name || `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim(),
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
          email: backendUser?.email || (token as any).email || session.user?.email,
          name: backendUser?.name || (token as any).name || session.user?.name,
        } as typeof session.user;
        (session as any).accessToken = (token as any).backendToken;
        (session as any).authError = (token as any).backendSyncError;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV !== "production",
});

// NextAuth only handles these specific actions
const nextAuthActions = new Set([
  "signin", "signout", "session", "csrf",
  "providers", "callback", "_log", "error",
]);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const nextauthQuery = req.query.nextauth;
  const action = Array.isArray(nextauthQuery) ? nextauthQuery[0] : nextauthQuery;

  // Route NextAuth actions (Google OAuth, session, etc.) to NextAuth
  if (action && nextAuthActions.has(action)) {
    return nextAuthHandler(req, res);
  }

  // Route everything else (login, register, me, etc.) to Express backend
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
    externalResolver: true,
  },
};
