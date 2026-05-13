import { readFileSync, writeFileSync } from "fs";

const files = [
  "src/components/home/DoctorQuotesRail.tsx",
  "src/components/home/HomeShowcaseDeck.tsx",
  "src/components/home/GalleryNarrativeRotator.tsx",
  "src/components/layout/SiteFooter.tsx",
];

const replacements = [
  ["rgba(74,44,125,", "rgba(30,13,78,"],
  ["rgba(74, 44, 125,", "rgba(30, 13, 78,"],
  ["rgba(107,63,160,", "rgba(61,34,114,"],
  ["rgba(107, 63, 160,", "rgba(61, 34, 114,"],
];

for (const file of files) {
  let content = readFileSync(file, "utf8");
  const original = content;
  for (const [from, to] of replacements) {
    while (content.includes(from)) {
      content = content.split(from).join(to);
    }
  }
  if (content !== original) {
    writeFileSync(file, content, "utf8");
    process.stdout.write("Updated: " + file + "\n");
  } else {
    process.stdout.write("No changes: " + file + "\n");
  }
}
