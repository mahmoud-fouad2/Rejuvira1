/** Only a full commit hash is public; reject arbitrary environment contents. */
export function releaseRevision(value: string | undefined): string | null {
  return value?.length === 40 && /^[a-f0-9]{40}$/i.test(value)
    ? value.toLowerCase()
    : null;
}
