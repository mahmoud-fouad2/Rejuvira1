import { Fragment } from "react";

import { parseJournalInline, parseJournalText } from "@/lib/journal-content";
import { sanitizeHtml } from "@/lib/sanitize-html";

function InlineText({ text }: { text: string }) {
  return parseJournalInline(text).map((part, index) =>
    part.strong ? (
      <strong key={index}>{part.text}</strong>
    ) : (
      <Fragment key={index}>{part.text}</Fragment>
    ),
  );
}

export function JournalBody({
  body,
  title,
}: {
  body: readonly string[];
  title: string;
}) {
  return (
    <div className="rv-journal-prose text-ink-strong/90 text-base leading-[2] md:text-lg md:leading-[2.2]">
      {body.map((content, contentIndex) => {
        const looksLikeHtml =
          /<\/?(?:p|h2|h3|h4|ul|ol|li|blockquote|figure|img|hr|div|strong|em|a)\b/i.test(
            content,
          );
        if (looksLikeHtml) {
          // Sanitize rich HTML on read too; never interpret legacy text as raw HTML.
          return (
            <div
              key={contentIndex}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
            />
          );
        }
        return parseJournalText(content, title).map((block, index) => {
          const key = `${contentIndex}-${index}`;
          if (block.kind === "heading") {
            const Heading = `h${block.level}` as "h2" | "h3" | "h4";
            return (
              <Heading key={key}>
                <InlineText text={block.text} />
              </Heading>
            );
          }
          if (block.kind === "list") {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <InlineText text={item} />
                  </li>
                ))}
              </List>
            );
          }
          return (
            <p key={key}>
              <InlineText text={block.text} />
            </p>
          );
        });
      })}
    </div>
  );
}
