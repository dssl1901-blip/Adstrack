const STORAGE_KEY = 'adscout_watchlist';

export function loadWatchlist() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWatchlist(entries) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage plein ou indisponible — on ignore silencieusement
  }
}

export function addToWatchlist(entry) {
  const entries = loadWatchlist();
  const withId = { ...entry, id: Date.now(), addedAt: new Date().toISOString() };
  const next = [withId, ...entries];
  saveWatchlist(next);
  return next;
}

export function isAlreadySaved(entries, adId) {
  return entries.some((e) => e.sourceAdId === adId);
}
