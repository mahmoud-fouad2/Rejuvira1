/** Site owner-confirmed editorial attribution. This is not a medical review claim. */
export function journalAuthors(siteName: string, siteUrl: string) {
  return [
    { "@type": "Person", name: "Mahmoud Fouad" },
    {
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: siteName,
      url: siteUrl,
    },
  ];
}
