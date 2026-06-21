/** Free a unique slug when soft-deleting so MongoDB unique index does not block future updates. */
export function releaseSlug(slug: string, id: string): string {
  const suffix = `__deleted__${id}`;
  const maxBase = Math.max(1, 200 - suffix.length);
  return `${slug.slice(0, maxBase)}${suffix}`;
}
