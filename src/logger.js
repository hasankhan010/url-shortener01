const LOG_KEY = 'appLogs_v1';

export const Logger = {
  log(level, message, meta) {
    try {
      const current = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      current.push({
        level,
        message,
        meta: meta || null,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(LOG_KEY, JSON.stringify(current));
    } catch (e) {
      // silent fail to avoid console usage as per constraint
    }
  },
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    } catch {
      return [];
    }
  },
  clear() {
    localStorage.removeItem(LOG_KEY);
  }
};