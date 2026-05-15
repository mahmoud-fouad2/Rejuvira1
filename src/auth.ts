import { UserRole } from "@prisma/client";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const validRoles = new Set(Object.values(UserRole));

function resolveUserRole(value: unknown): UserRole {
  if (typeof value === "string" && validRoles.has(value as UserRole)) {
    return value as UserRole;
  }

  return UserRole.VIEWER;
}

function readBootstrapCredentials() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase()
    ?? process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim()
    ?? process.env.ADMIN_SEED_PASSWORD?.trim();
  const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim()
    ?? process.env.ADMIN_SEED_NAME?.trim()
    ?? "Rejuvira Super Admin";

  if (!email || !password) return null;
  return { email, password, name };
}

async function ensureBootstrapUser(email: string, password: string) {
  const bootstrap = readBootstrapCredentials();
  if (!bootstrap) return null;
  if (bootstrap.email !== email.trim().toLowerCase()) return null;
  if (bootstrap.password !== password) return null;

  const hashedPassword = await hash(bootstrap.password, 12);
  try {
    const user = await prisma.user.upsert({
      where: { email: bootstrap.email },
      update: {
        hashedPassword,
        role: UserRole.SUPER_ADMIN,
        lastLoginAt: new Date(),
      },
      create: {
        email: bootstrap.email,
        name: bootstrap.name,
        hashedPassword,
        role: UserRole.SUPER_ADMIN,
        lastLoginAt: new Date(),
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(authSecret ? { secret: authSecret } : {}),
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = resolveUserRole(token.role);
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Admin credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        if (!email || !password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            const isValidPassword = await compare(password, user.hashedPassword);
            if (isValidPassword) {
              await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
              });

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          }
        } catch (error) {
          console.error("[auth] DB lookup failed", error);
        }

        return ensureBootstrapUser(email, password);
      },
    }),
  ],
});
