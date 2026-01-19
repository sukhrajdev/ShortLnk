import crypto from "crypto";

export function generateShortCode(length) {
  // length = final string length
  // 8 → good default for short links

  const bytes = crypto.randomBytes(length);
  return bytes
    .toString("base64url") // URL-safe: A-Z a-z 0-9 - _
    .slice(0, length);
}
