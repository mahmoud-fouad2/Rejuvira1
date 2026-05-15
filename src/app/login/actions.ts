"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export type LoginActionState = {
  message: string;
};

export async function authenticate(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return {
      message: "يرجى إدخال البريد الإلكتروني وكلمة المرور بشكل صحيح.",
    };
  }

  try {
    await signIn("credentials", {
      email: email.trim(),
      password,
      redirectTo: "/admin",
    });

    return {
      message: "",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          message: "البريد أو كلمة المرور غير صحيحة.",
        };
      }

      return {
        message: "تعذر تسجيل الدخول حالياً. حاولي بعد قليل.",
      };
    }

    throw error;
  }
}
