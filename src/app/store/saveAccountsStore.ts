// store/savedAccountsStore.ts
// Persists multiple account sessions to localStorage so users can switch
// between them without losing their account list.

export interface SavedAccount {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  provider?: string | null; // "github" | "google" | "discord"
}

const STORAGE_KEY = "voronoi_saved_accounts";

function load(): SavedAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedAccount[]) : [];
  } catch {
    return [];
  }
}

function save(accounts: SavedAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

/** Upsert an account into the saved list. Returns the new list. */
export function upsertSavedAccount(account: SavedAccount): SavedAccount[] {
  const accounts = load();
  const idx = accounts.findIndex((a) => a.id === account.id);
  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], ...account };
  } else {
    accounts.push(account);
  }
  save(accounts);
  return accounts;
}

/** Remove an account from the saved list. */
export function removeSavedAccount(id: string): SavedAccount[] {
  const accounts = load().filter((a) => a.id !== id);
  save(accounts);
  return accounts;
}

/** Read all saved accounts. */
export function getSavedAccounts(): SavedAccount[] {
  return load();
}