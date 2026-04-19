const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"

export function generateRsvpSlug(length = 12): string {
  let s = ""
  for (let i = 0; i < length; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return s
}
