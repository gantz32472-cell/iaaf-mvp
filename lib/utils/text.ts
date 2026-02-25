export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .replace(/[^\p{L}\p{N}\s#]/gu, " ")
    .split(" ")
    .filter(Boolean);
}

export function jaccardSimilarity(a: string, b: string): number {
  const aSet = new Set(tokenize(a));
  const bSet = new Set(tokenize(b));
  if (!aSet.size && !bSet.size) return 1;
  if (!aSet.size || !bSet.size) return 0;
  let intersection = 0;
  for (const token of aSet) if (bSet.has(token)) intersection++;
  const union = new Set([...aSet, ...bSet]).size;
  return intersection / union;
}
