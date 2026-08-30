import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config. No database adapter, no bcrypt — this is what the
 * middleware loads. The full config (with the Credentials provider) lives in
 * `src/auth.ts` and is used by server components / route handlers.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/skills",
  "/analyze",
  "/analysis",
  "/progress",
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = PROTECTED_PREFIXES.some((p) =>
        nextUrl.pathname.startsWith(p),
      );
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
