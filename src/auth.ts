import { UserRole } from "@prisma/client";
import { headers } from "next/headers";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { recordAppLog } from "@/lib/app-log";
import { extractClientIp, rateLimit } from "@/lib/rate-limit";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const validRoles = new Set(Object.values(UserRole));

function resolveUserRole(value: unknown): UserRole {
  if (typeof value === "string" && validRoles.has(value as UserRole)) {
    return value as UserRole;
  }

  return UserRole.VIEWER;
}

function readBootstrapCredentials() {
  const email = (
    process.env.ADMIN_BOOTSTRAP_EMAIL ?? process.env.ADMIN_SEED_EMAIL ?? ""
  )
    .trim()
    .toLowerCase();
  const password = (
    process.env.ADMIN_BOOTSTRAP_PASSWORD ?? process.env.ADMIN_SEED_PASSWORD ?? ""
  ).trim();
  const name = (
    process.env.ADMIN_BOOTSTRAP_NAME ?? process.env.ADMIN_SEED_NAME ?? "Rejuvera Super Admin"
  ).trim();

  if (!email || !password) return null;
  return { email, password, name };
}

async function tryBootstrapLogin(email: string, password: string) {
  const bootstrap = readBootstrapCredentials();
  if (!bootstrap) {
    console.warn(
      "[auth] No ADMIN_BOOTSTRAP_EMAIL/ADMIN_BOOTSTRAP_PASSWORD configured.",
    );
    return null;
  }

  if (bootstrap.email !== email.trim().toLowerCase()) return null;
  if (bootstrap.password !== password) return null;

  try {
    const hashedPassword = await hash(bootstrap.password, 12);
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
  } catch (error) {
    console.error("[auth] Bootstrap upsert failed, signing in without DB record", error);
    // Fall back to an in-memory session so admin can still sign in even when
    // the database is unreachable.
    return {
      id: `bootstrap:${bootstrap.email}`,
      name: bootstrap.name,
      email: bootstrap.email,
      role: UserRole.SUPER_ADMIN,
    };
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

        // Throttle: at most 8 attempts / 5 minutes per IP, and 8 per email.
        try {
          const headerStore = await headers();
          const clientIp = extractClientIp(headerStore);
          const ipLimit = rateLimit({
            key: `login:ip:${clientIp}`,
            limit: 8,
            windowSeconds: 300,
          });
          const emailLimit = rateLimit({
            key: `login:email:${email}`,
            limit: 8,
            windowSeconds: 300,
          });
          if (!ipLimit.ok || !emailLimit.ok) {
            await recordAppLog({
              level: "warn",
              kind: "auth.rate-limit",
              message: "Login rate limit hit",
              meta: {
                ip: clientIp,
                email,
                retryAfter: Math.max(ipLimit.retryAfter, emailLimit.retryAfter),
              },
            });
            return null;
          }
        } catch {
          // headers() can fail outside request scope; ignore.
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            const isValidPassword = await compare(password, user.hashedPassword);
            if (isValidPassword) {
              await prisma.user
                .update({
                  where: { id: user.id },
                  data: { lastLoginAt: new Date() },
                })
                .catch((err) => console.warn("[auth] lastLoginAt update failed", err));

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
            console.warn("[auth] Password mismatch for", email);
          } else {
            console.warn("[auth] No DB user for", email, "— attempting bootstrap");
          }
        } catch (error) {
          console.error("[auth] DB lookup failed, attempting bootstrap", error);
        }

        return tryBootstrapLogin(email, password);
      },
    }),
  ],
});
