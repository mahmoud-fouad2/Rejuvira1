import { Prisma } from "@prisma/client";

export function adminActionErrorMessage(
  error: unknown,
  fallback = "تعذر حفظ التغييرات. حاول مرة أخرى.",
): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(", ")
        : "unique field";
      return `القيمة مستخدمة بالفعل (${target}). غيّر الرابط أو الاسم ثم حاول مرة أخرى.`;
    }
    if (error.code === "P2025") {
      return "العنصر المطلوب غير موجود أو تم حذفه بالفعل.";
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
