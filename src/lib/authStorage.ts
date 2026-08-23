import { UserProfile } from '../types';

const USER_STORAGE_KEY = 'aihub_google_user';
const LEGACY_STORAGE_KEYS = ['ai_hub_google_user', 'google_user_profile'];

const ADMIN_EMAILS = [
  'ayun24song@gmail.com',
  'teamdevstudiont@gmail.com',
  'deer123424@gmail.com',
];

export function isDesignatedAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(normalized);
}

/**
 * Returns '-' for admin users or deer123424@gmail.com, or the formatted creation date.
 */
export function formatUserJoinedAt(email?: string, role?: string, joinedAt?: string, isAdmin?: boolean): string {
  const normalized = (email || '').toLowerCase().trim();
  if (normalized === 'deer123424@gmail.com' || isDesignatedAdminEmail(normalized) || role === 'ADMIN' || isAdmin) {
    return '-';
  }
  if (!joinedAt || joinedAt === 'N/A' || joinedAt === '가입일 정보 없음') {
    return '-';
  }
  return joinedAt;
}

/**
 * Saves authenticated user profile into localStorage securely and broadcasts changes.
 */
export function saveStoredUser(user: UserProfile): void {
  try {
    const email = user.email ? user.email.toLowerCase().trim() : '';
    // Must be in designated admin emails list to obtain admin privileges
    const isAdmin = isDesignatedAdminEmail(email) || user.role === 'ADMIN' || user.isAdmin === true;
    const isSpecialAccount = isAdmin || email === 'deer123424@gmail.com';

    const normalizedUser: UserProfile = {
      uid: user.uid || `user-${Date.now()}`,
      email: email,
      displayName: user.displayName || email.split('@')[0] || 'User',
      nickname: user.nickname,
      bio: user.bio,
      photoURL: user.photoURL,
      role: isAdmin ? 'ADMIN' : 'USER',
      isAdmin,
      status: user.status || 'ACTIVE',
      joinedAt: isSpecialAccount ? '-' : (user.joinedAt || new Date().toISOString().slice(0, 10).replace(/-/g, '.')),
      lastActiveAt: user.lastActiveAt || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      loginCount: user.loginCount || 1,
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));

    // Notify other components/subscribers in the current tab
    window.dispatchEvent(
      new CustomEvent('aihub_user_changed', { detail: normalizedUser })
    );
  } catch (e) {
    console.error('[AUTH STORAGE] Failed to save user session:', e);
  }
}

/**
 * Retrieves and validates the user profile from localStorage with fallback support.
 */
export function getStoredUser(): UserProfile | null {
  try {
    let raw = localStorage.getItem(USER_STORAGE_KEY);

    // Fallback check for legacy storage keys if primary key is missing
    if (!raw) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const fallbackRaw = localStorage.getItem(legacyKey);
        if (fallbackRaw) {
          raw = fallbackRaw;
          localStorage.setItem(USER_STORAGE_KEY, fallbackRaw);
          break;
        }
      }
    }

    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.email && typeof parsed.email === 'string') {
      const email = parsed.email.toLowerCase().trim();
      const isAdmin = isDesignatedAdminEmail(email) || parsed.role === 'ADMIN' || parsed.isAdmin === true;
      const isSpecialAccount = isAdmin || email === 'deer123424@gmail.com';

      return {
        uid: parsed.uid || `user-${Date.now()}`,
        email: email,
        displayName: parsed.displayName || email.split('@')[0],
        nickname: parsed.nickname,
        bio: parsed.bio,
        photoURL: parsed.photoURL,
        role: isAdmin ? 'ADMIN' : 'USER',
        isAdmin: isAdmin,
        status: parsed.status || 'ACTIVE',
        joinedAt: isSpecialAccount ? '-' : (parsed.joinedAt || '-'),
        lastActiveAt: parsed.lastActiveAt,
        loginCount: parsed.loginCount,
      };
    }
  } catch (e) {
    console.error('[AUTH STORAGE] Failed to retrieve saved user session:', e);
  }
  return null;
}

/**
 * Removes user session from localStorage and broadcasts logout event.
 */
export function clearStoredUser(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

    window.dispatchEvent(
      new CustomEvent('aihub_user_changed', { detail: null })
    );
  } catch (e) {
    console.error('[AUTH STORAGE] Failed to clear user session:', e);
  }
}
