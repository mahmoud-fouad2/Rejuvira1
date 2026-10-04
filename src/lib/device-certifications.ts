/** Remove a known supplier/editor instruction, without asserting approval. */
export function publicDeviceCertifications(items: readonly string[]) {
  return items.filter(
    (item) => !/add\s+sfda\s+approval\s+if\s+available/i.test(item),
  );
}
