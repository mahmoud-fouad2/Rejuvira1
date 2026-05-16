"use server";

import { signOut } from "@/auth";

/**
 * Server Action wrapper for NextAuth's signOut. Lets us put the sign-out
 * button in the admin topbar without dragging the SessionProvider client-side.
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
