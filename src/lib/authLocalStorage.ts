// ============================================================
// Local mock auth persistence (demo / offline)
// ============================================================
import type { User } from '@/types';

const LS_KEY = 'creai_users';
const SESSION_KEY = 'creai_session';

export type StoredUserRecord = { password: string; user: User };

export function getUsers(): Record<string, StoredUserRecord> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}') as Record<string, StoredUserRecord>;
  } catch {
    return {};
  }
}

export function saveUsers(users: Record<string, StoredUserRecord>) {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

export function setSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): User | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as User | null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
