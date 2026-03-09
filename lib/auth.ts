import { AuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma, IS_DB_ENABLED } from "./db";

/** Auth is only active when NEXTAUTH_SECRET + DATABASE_URL are both set */
export const IS_AUTH_ENABLED =
  !!process.env.NEXTAUTH_SECRET && IS_DB_ENABLED;

const providers: AuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Credentials provider always available when auth is enabled
providers.push(
  CredentialsProvider({
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      if (!IS_DB_ENABLED) return null;

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });
      if (!user?.password) return null;

      const valid = await bcrypt.compare(credentials.password, user.password);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  })
);

export const authOptions: AuthOptions = {
  adapter: IS_DB_ENABLED
    ? (PrismaAdapter(prisma) as AuthOptions["adapter"])
    : undefined,
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error — role added in credentials authorize
        token.role = user.role ?? "TEACHER";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "TEACHER";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/** Server-side helper — returns null if auth is disabled */
export async function getSession() {
  if (!IS_AUTH_ENABLED) return null;
  return getServerSession(authOptions);
}

/** Hash a plain-text password */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
