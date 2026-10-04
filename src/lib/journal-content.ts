export type JournalTextBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; level: 2 | 3 | 4; text: string }
  | { kind: "list"; ordered: boolean; items: string[] };

/** Legacy imports contain Markdown separated by literal <br> tags.
 * Parse text only: HTML remains text and React escapes it at render time.
 */
export function parseJournalText(
  input: string,
  title = "",
): JournalTextBlock[] {
  const lines = input.replace(/<br\s*\/?\s*>/gi, "\n").split(/\r?\n/);
  const blocks: JournalTextBlock[] = [];
  let paragraph: string[] = [];
  let list: Extract<JournalTextBlock, { kind: "list" }> | undefined;
  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = undefined;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const text = heading[2] ?? "";
      // The template already supplies the article's H1.
      if (blocks.length === 0 && text.trim() === title.trim()) continue;
      blocks.push({
        kind: "heading",
        level: Math.max(2, heading[1]?.length ?? 2) as 2 | 3 | 4,
        text,
      });
      continue;
    }
    const item = /^(?:[-*]\s+|\d+[.)]\s+)(.+)$/.exec(line);
    if (item) {
      flushParagraph();
      const ordered = /^\d/.test(line);
      if (list && list.ordered !== ordered) flushList();
      list ??= { kind: "list", ordered, items: [] };
      list.items.push(item[1] ?? "");
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function parseJournalInline(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) => ({
      text:
        part.startsWith("**") && part.endsWith("**") ? part.slice(2, -2) : part,
      strong: part.startsWith("**") && part.endsWith("**"),
    }));
}

export function hasEnglishJournalContent(post: {
  titleEn?: string | null;
  excerptEn?: string | null;
  bodyEn?: readonly string[] | null;
}) {
  return Boolean(
    post.titleEn?.trim() &&
    post.excerptEn?.trim() &&
    post.bodyEn?.some((block) => block.trim()),
  );
}

/** An edit or republication must not replace an existing publication date. */
export function publicationDateForSave(
  status: string,
  existingDate: Date | null | undefined,
  now = new Date(),
): Date | undefined {
  return status === "PUBLISHED" && !existingDate ? now : undefined;
}

export function parseJournalPage(value: string | undefined): number | null {
  if (value === undefined || value === "") return 1;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
}

export function journalPagePath(page: number) {
  return page === 1 ? "/journal" : `/journal?page=${page}`;
}
