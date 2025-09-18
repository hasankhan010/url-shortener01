const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function generateShortCode(length = 6) {
  let s = '';
  for (let i = 0; i < length; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}
export function isValidShortcode(code) {
  if (!code) return false;
  return /^[A-Za-z0-9_-]{3,20}$/.test(code);
}