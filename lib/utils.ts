export function getCategoryCount(
  categoryId: string,
  sites: { category: unknown }[],
): number {
  if (!sites || !categoryId) return 0;
  return sites.filter((site) => {
    const cat = site.category as { _id?: string } | string | null;
    const catId = (cat && typeof cat === "object" && "_id" in cat ? cat._id : cat) as string | undefined;
    return String(catId) === String(categoryId);
  }).length;
}
