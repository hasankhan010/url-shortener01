const STORAGE_KEY = 'shortUrls_v1';

export function loadUrls() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveUrls(urls) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  } catch {}
}

export function findUrlByCode(code) {
  const urls = loadUrls();
  return urls.find(u => u.shortCode === code);
}