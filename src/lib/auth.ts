import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;

        // Store tokens in Setting table for server-side sync engine
        const settings = [
          { key: "google_access_token", value: account.access_token ?? "" },
          { key: "google_refresh_token", value: account.refresh_token ?? "" },
          { key: "google_token_expiry", value: String(account.expires_at ?? "") },
          { key: "google_email", value: token.email ?? "" },
        ];

        for (const { key, value } of settings) {
          await db.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.gmailConnected = !!token.accessToken;
      return session;
    },
  },
});
