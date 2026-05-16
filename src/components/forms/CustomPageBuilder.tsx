"use client";

import { useMemo, useState } from "react";

import { ImagePicker } from "@/components/admin/ImagePicker";

type BlockKind = "hero" | "text" | "image" | "cta" | "services" | "faq";

type BuilderBlock = {
  id: string;
  kind: BlockKind;
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  buttonLabel?: string;
  buttonHref?: string;
  accent?: string;
};

const blockLibrary: Array<{
  kind: BlockKind;
  label: string;
  hint: string;
}> = [
  { kind: "hero", label: "Hero", hint: "عنوان رئيسي وزر حجز" },
  { kind: "text", label: "Text", hint: "محتوى نصي منظم" },
  { kind: "image", label: "Image", hint: "صورة بعرض الصفحة" },
  { kind: "cta", label: "CTA", hint: "دعوة للحجز" },
  { kind: "services", label: "Services", hint: "كروت خدمات" },
  { kind: "faq", label: "FAQ", hint: "أسئلة شائعة" },
];

const presets: Record<BlockKind, Omit<BuilderBlock, "id" | "kind">> = {
  hero: {
    title: "خطة علاجية مصممة بعناية",
    subtitle: "ريجوفيرا",
    body: "صفحة مخصصة تعرض الخدمة أو العرض الطبي بلغة واضحة وتصميم متوازن يساعد الزائر على اتخاذ القرار.",
    imageUrl: "/media/curated/clinic-treatment-room.jpeg",
    buttonLabel: "احجزي موعدك",
    buttonHref: "/contact",
    accent: "#4a2476",
  },
  text: {
    title: "لماذا هذه الصفحة؟",
    body: "اكتبي هنا شرحًا واضحًا للميزة أو الخدمة. اجعلي الفقرة قصيرة، مباشرة، ومرتبطة بما يحتاجه الزائر قبل التواصل.",
    accent: "#4a2476",
  },
  image: {
    title: "صورة داعمة",
    imageUrl: "/media/curated/service-skin-rejuvenation.webp",
    body: "وصف قصير للصورة أو الحالة.",
    accent: "#4a2476",
  },
  cta: {
    title: "اعرفي الخيار الأنسب لحالتك",
    body: "تواصلي مع الفريق لترتيب استشارة واضحة ومناسبة.",
    buttonLabel: "التواصل والحجز",
    buttonHref: "/contact",
    accent: "#4a2476",
  },
  services: {
    title: "خدمات مرتبطة",
    body: "تجديد البشرة المتقدم|خطة متدرجة لتحسين نضارة البشرة\nإزالة الشعر بالليزر|جلسات منظمة حسب نوع البشرة\nتناغم الوجه بالحقن|تحسين محسوب يحافظ على الملامح",
    accent: "#4a2476",
  },
  faq: {
    title: "أسئلة شائعة",
    body: "هل أحتاج إلى استشارة قبل الإجراء؟|نعم، التقييم يساعد على اختيار الخطة الأنسب.\nمتى تظهر النتيجة؟|يختلف ذلك حسب الإجراء وطبيعة الحالة.\nهل يمكن تعديل الصفحة لاحقًا؟|نعم، يمكن تعديل البلوكات وإعادة ترتيبها من لوحة التحكم.",
    accent: "#4a2476",
  },
};

function uid() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphHtml(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function parsePairs(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, body = ""] = line.split("|");
      return { title: title?.trim() ?? "", body: body.trim() };
    })
    .filter((item) => item.title);
}

function renderBlock(block: BuilderBlock) {
  const accent = escapeHtml(block.accent || "#4a2476");
  const title = escapeHtml(block.title);
  const subtitle = escapeHtml(block.subtitle || "");
  const body = block.body || "";
  const image = escapeHtml(block.imageUrl || "/media/curated/clinic-treatment-room.jpeg");
  const buttonLabel = escapeHtml(block.buttonLabel || "احجزي موعدك");
  const buttonHref = escapeHtml(block.buttonHref || "/contact");

  if (block.kind === "hero") {
    return `<section class="rv-builder-section rv-builder-hero" style="--builder-accent:${accent}"><div><small>${subtitle}</small><h1>${title}</h1>${paragraphHtml(body)}<a href="${buttonHref}">${buttonLabel}</a></div><figure><img src="${image}" alt="${title}" loading="lazy" decoding="async"></figure></section>`;
  }
  if (block.kind === "text") {
    return `<section class="rv-builder-section rv-builder-text" style="--builder-accent:${accent}"><h2>${title}</h2><div>${paragraphHtml(body)}</div></section>`;
  }
  if (block.kind === "image") {
    return `<section class="rv-builder-section rv-builder-image" style="--builder-accent:${accent}"><figure><img src="${image}" alt="${title}" loading="lazy" decoding="async"><figcaption>${title}${body ? ` - ${escapeHtml(body)}` : ""}</figcaption></figure></section>`;
  }
  if (block.kind === "cta") {
    return `<section class="rv-builder-section rv-builder-cta" style="--builder-accent:${accent}"><h2>${title}</h2>${paragraphHtml(body)}<a href="${buttonHref}">${buttonLabel}</a></section>`;
  }
  if (block.kind === "services") {
    const cards = parsePairs(body)
      .map(
        (item) =>
          `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`,
      )
      .join("");
    return `<section class="rv-builder-section rv-builder-services" style="--builder-accent:${accent}"><h2>${title}</h2><div>${cards}</div></section>`;
  }
  const faqs = parsePairs(body)
    .map(
      (item) =>
        `<details><summary>${escapeHtml(item.title)}</summary><p>${escapeHtml(item.body)}</p></details>`,
    )
    .join("");
  return `<section class="rv-builder-section rv-builder-faq" style="--builder-accent:${accent}"><h2>${title}</h2><div>${faqs}</div></section>`;
}

function renderPage(blocks: BuilderBlock[]) {
  const encodedBlocks = encodeURIComponent(JSON.stringify(blocks));
  return `<div class="rv-builder-page" data-blocks="${encodedBlocks}">${blocks.map(renderBlock).join("")}</div>`;
}

function createBlock(kind: BlockKind): BuilderBlock {
  return { id: uid(), kind, ...presets[kind] };
}

function initialBlocks(html?: string): BuilderBlock[] {
  if (html?.includes("rv-builder-page")) {
    const encoded = html.match(/data-blocks="([^"]+)"/)?.[1];
    if (encoded) {
      try {
        const parsed = JSON.parse(decodeURIComponent(encoded)) as BuilderBlock[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((block) => block.id && block.kind && block.title);
        }
      } catch {
        return [createBlock("hero"), createBlock("text"), createBlock("cta")];
      }
    }
    return [createBlock("hero"), createBlock("text"), createBlock("cta")];
  }
  if (html?.trim()) {
    return [
      {
        ...createBlock("text"),
        title: "محتوى الصفحة الحالي",
        body: "تم الاحتفاظ بالمحتوى الحالي في حقل HTML. يمكنك بناء نسخة جديدة من البلوكات وحفظها عند الجاهزية.",
      },
    ];
  }
  return [createBlock("hero"), createBlock("services"), createBlock("faq"), createBlock("cta")];
}

export function CustomPageBuilder({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [blocks, setBlocks] = useState<BuilderBlock[]>(() =>
    initialBlocks(defaultValue),
  );
  const [selectedId, setSelectedId] = useState(blocks[0]?.id ?? "");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const selected = blocks.find((block) => block.id === selectedId) ?? blocks[0];
  const html = useMemo(() => renderPage(blocks), [blocks]);

  function add(kind: BlockKind) {
    const next = createBlock(kind);
    setBlocks((current) => [...current, next]);
    setSelectedId(next.id);
  }

  function update(id: string, patch: Partial<BuilderBlock>) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, ...patch } : block)),
    );
  }

  function remove(id: string) {
    setBlocks((current) => {
      const next = current.filter((block) => block.id !== id);
      setSelectedId(next[0]?.id ?? "");
      return next;
    });
  }

  function move(id: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      if (!item) return current;
      next.splice(target, 0, item);
      return next;
    });
  }

  function dropOn(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    setBlocks((current) => {
      const dragged = current.find((block) => block.id === draggedId);
      if (!dragged) return current;
      const without = current.filter((block) => block.id !== draggedId);
      const targetIndex = without.findIndex((block) => block.id === targetId);
      if (targetIndex < 0) return current;
      const next = [...without];
      next.splice(targetIndex, 0, dragged);
      return next;
    });
    setDraggedId(null);
  }

  return (
    <div className="pagecraft-admin">
      <input type="hidden" name={name} value={html} />
      <aside className="pagecraft-panel">
        <div className="pagecraft-panel__header">العناصر</div>
        <div className="pagecraft-elements">
          {blockLibrary.map((item) => (
            <button key={item.kind} type="button" onClick={() => add(item.kind)}>
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
            </button>
          ))}
        </div>
        <div className="pagecraft-panel__header">المقاس</div>
        <div className="pagecraft-devices">
          {(["desktop", "tablet", "mobile"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={mode === item ? "is-active" : ""}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      <main className="pagecraft-canvas-wrap">
        <div className={`pagecraft-canvas is-${mode}`}>
          {blocks.map((block, index) => (
            <section
              key={block.id}
              draggable
              onDragStart={() => setDraggedId(block.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOn(block.id)}
              onClick={() => setSelectedId(block.id)}
              className={`pagecraft-block ${selectedId === block.id ? "is-selected" : ""}`}
            >
              <div className="pagecraft-block__tools">
                <button type="button" onClick={() => move(block.id, -1)} disabled={index === 0}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(block.id, 1)}
                  disabled={index === blocks.length - 1}
                >
                  ↓
                </button>
                <button type="button" onClick={() => remove(block.id)}>
                  حذف
                </button>
              </div>
              <div dangerouslySetInnerHTML={{ __html: renderBlock(block) }} />
            </section>
          ))}
        </div>
      </main>

      <aside className="pagecraft-panel">
        <div className="pagecraft-panel__header">الخصائص</div>
        {selected ? (
          <div className="pagecraft-props">
            <label>
              <span>العنوان</span>
              <input
                value={selected.title}
                onChange={(event) =>
                  update(selected.id, { title: event.target.value })
                }
              />
            </label>
            <label>
              <span>وصف قصير</span>
              <input
                value={selected.subtitle ?? ""}
                onChange={(event) =>
                  update(selected.id, { subtitle: event.target.value })
                }
              />
            </label>
            <label>
              <span>المحتوى</span>
              <textarea
                value={selected.body ?? ""}
                rows={selected.kind === "services" || selected.kind === "faq" ? 7 : 5}
                onChange={(event) =>
                  update(selected.id, { body: event.target.value })
                }
              />
            </label>
            {selected.kind === "hero" || selected.kind === "image" ? (
              <ImagePicker
                name={`builder-${selected.id}-image`}
                label="الصورة"
                defaultValue={selected.imageUrl ?? ""}
                namespace="pages"
                aspect={16 / 9}
                onChange={(url) => update(selected.id, { imageUrl: url })}
              />
            ) : null}
            {selected.kind === "hero" || selected.kind === "cta" ? (
              <div className="grid gap-2">
                <label>
                  <span>نص الزر</span>
                  <input
                    value={selected.buttonLabel ?? ""}
                    onChange={(event) =>
                      update(selected.id, { buttonLabel: event.target.value })
                    }
                  />
                </label>
                <label>
                  <span>رابط الزر</span>
                  <input
                    dir="ltr"
                    value={selected.buttonHref ?? ""}
                    onChange={(event) =>
                      update(selected.id, { buttonHref: event.target.value })
                    }
                  />
                </label>
              </div>
            ) : null}
            <label>
              <span>لون الهوية</span>
              <input
                type="color"
                value={selected.accent ?? "#4a2476"}
                onChange={(event) =>
                  update(selected.id, { accent: event.target.value })
                }
              />
            </label>
          </div>
        ) : (
          <p className="pagecraft-empty">اختاري بلوك للتعديل.</p>
        )}
      </aside>
    </div>
  );
}
