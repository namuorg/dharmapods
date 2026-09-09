export function getGenderDistributionLabel(gender: string): string {
  const normalized = gender.trim();

  if (!normalized) return "Not specified";
  if (/^m(?:ale)?$/i.test(normalized)) return "Male";
  if (/^f(?:emale)?$/i.test(normalized)) return "Female";

  return normalized;
}
