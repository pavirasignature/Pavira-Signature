import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextApiRequest, NextApiResponse } from "next";

const getBackendUrl = () => {
  const explicitUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (explicitUrl) {
    return explicitUrl.replace(/\/api\/?$/, "");
  }
  return "http://localhost:5000";
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
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

export default handler;
