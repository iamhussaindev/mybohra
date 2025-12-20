/**
 * Label replacement mappings
 * Add more label replacements here as needed
 */
const LABEL_REPLACEMENTS: Record<string, string> = {
  "Matami Noha Arabic": "Arabic Noha",
  // Add more replacements here in the future
  // "Old Label": "New Label",
}

/**
 * Formats a label by applying replacements
 * @param label - The original label text
 * @returns The formatted label with replacements applied
 */
export function formatLabel(label: string): string {
  if (!label) return label

  // Check if there's a direct replacement
  if (LABEL_REPLACEMENTS[label]) {
    return LABEL_REPLACEMENTS[label]
  }

  // Check for case-insensitive partial matches
  const normalizedLabel = label.trim()
  const replacement = Object.entries(LABEL_REPLACEMENTS).find(([key]) =>
    normalizedLabel.toLowerCase().includes(key.toLowerCase()),
  )

  if (replacement) {
    return normalizedLabel.replace(new RegExp(replacement[0], "gi"), replacement[1])
  }

  return label
}
