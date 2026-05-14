import { ContentStatus } from "@prisma/client";
import Image from "next/image";

import {
  deleteJournalPostAction,
  updateJournalPostStatusAction,
} from "@/app/admin/journal/actions";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { JournalCreateForm } from "@/components/forms/JournalCreateForm";
import { getJournalPosts } from "@/lib/content-repository";

const publishableStatuses = [
  ContentStatus.DRAFT,
  ContentStatus.REVIEW,
  ContentStatus.PUBLISHED,
  ContentStatus.ARCHIVED,
] as const;

export default async function AdminJournalPage() {
  const posts = await getJournalPosts();

  return (
    <>
      <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
        <p className="eyebrow">Journal Module</p>
        <h1 className="text-ink mt-4 font-serif text-5xl tracking-[-0.05em]">
          إدارة المجلة الطبية
        </h1>
        <p className="text-ink-soft mt-4 max-w-3xl text-base leading-8">
          من هذه الوحدة تتم إدارة المقالات، مراجعة جاهزيتها، واعتماد النشر أو
          الأرشفة من مكان واحد.
        </p>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="surface-panel rounded-[2rem] p-6">
          <h2 className="text-ink font-serif text-3xl tracking-[-0.04em]">
            إضافة مسودة مقال
          </h2>
          <div className="mt-6">
            <JournalCreateForm />
          </div>
        </article>
        <div className="grid gap-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="surface-panel overflow-hidden rounded-[1.85rem] md:grid md:grid-cols-[11rem_1fr]"
            >
              <div className="relative min-h-44">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-ink text-lg font-semibold">
                      {post.title}
                    </p>
                    <p className="text-ink-soft mt-1 text-sm">
                      {post.category} · {post.readingTime}
                    </p>
                  </div>
                  <AdminStatusBadge status={ContentStatus.PUBLISHED} />
                </div>
                <p className="text-ink-soft mt-3 text-sm leading-7">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.relatedServiceSlugs.map((slug) => (
                    <span
                      key={slug}
                      className="border-line bg-surface text-ink-soft rounded-full border px-3 py-1 text-xs"
                    >
                      {slug}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {publishableStatuses.map((status) => (
                    <form
                      key={`${post.slug}-${status}`}
                      action={updateJournalPostStatusAction}
                    >
                      <input type="hidden" name="slug" value={post.slug} />
                      <input type="hidden" name="status" value={status} />
                      <button
                        type="submit"
                        className="border-line text-ink hover:bg-surface rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
                      >
                        {status === ContentStatus.DRAFT
                          ? "مسودة"
                          : status === ContentStatus.REVIEW
                            ? "قيد المراجعة"
                            : status === ContentStatus.PUBLISHED
                              ? "نشر"
                              : "أرشفة"}
                      </button>
                    </form>
                  ))}
                  <form action={deleteJournalPostAction}>
                    <input type="hidden" name="slug" value={post.slug} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                    >
                      حذف
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
