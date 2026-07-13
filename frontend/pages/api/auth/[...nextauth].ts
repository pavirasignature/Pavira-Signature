import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import app from "../../../../backend/server";

const getBackendUrl = () => {
  const explicitUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (explicitUrl) {
    return explicitUrl.replace(/\/api\/?$/, "");
  }
  return "http://localhost:5000";
};

const nextAuthHandler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-google-client-secret",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback-nextauth-secret-for-pavira-signature-luxury",
  callbacks: {
    async jwt({ token, account, profile }) {
      const googleProfile = profile as any;
      if (account?.provider === "google" && googleProfile) {
        const googleId = googleProfile.sub || googleProfile.id;
        token.id = googleId as string;
        token.email = googleProfile.email as string;
        token.name = googleProfile.name as string;
        token.picture = googleProfile.picture as string;
        token.googleId = googleId;
        token.firstName = googleProfile.given_name as string;
        token.lastName = googleProfile.family_name as string;

        if (!token.backendToken) {
          try {
            const backendBaseUrl = getBackendUrl();
            const response = await fetch(`${backendBaseUrl}/api/auth/google`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: googleProfile.email,
                firstName: googleProfile.given_name,
                lastName: googleProfile.family_name,
                googleId,
                photoUrl: googleProfile.picture,
              }),
            });

            const data = await response.json();
            if (response.ok && data?.success && data?.data) {
              token.backendToken = data.data.token;
              token.backendUser = data.data.user;
            }
          } catch (error) {
            console.error("NextAuth Google backend sync failed:", error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: (token as any).id,
          googleId: (token as any).googleId,
          firstName: (token as any).firstName,
          lastName: (token as any).lastName,
          picture: (token as any).picture || session.user?.image,
          email: (token as any).email || session.user?.email,
          name: (token as any).name || session.user?.name,
        } as typeof session.user;
        (session as any).accessToken = (token as any).backendToken;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV !== "production",
});

const nextAuthActions = new Set([
  "signin",
  "signout",
  "session",
  "csrf",
  "providers",
  "callback",
  "_log",
  "error"
]);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const nextauthQuery = req.query.nextauth;
  const action = Array.isArray(nextauthQuery) ? nextauthQuery[0] : nextauthQuery;

  if (action && nextAuthActions.has(action)) {
    return nextAuthHandler(req, res);
  }

  // Otherwise, it's a backend Express route (like login, register, me, verify-email, etc.)
  try {
    return new Promise<void>((resolve, reject) => {
      // Express handler expects (req, res, next)
      app(req, res, (err: any) => {
        if (err) {
          console.error("Express App Error within NextAuth route:", err);
          res.status(500).json({ error: "Express App Error", details: err.message || String(err) });
          return resolve();
        }
        return resolve();
      });
    });
  } catch (error: any) {
    console.error("Failed to route to backend/server from NextAuth page:", error);
    res.status(500).json({
      error: "Failed to route to backend/server",
      message: error.message,
      stack: error.stack,
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // Let Express or NextAuth handle body parsing from request stream
    externalResolver: true,
  },
};
