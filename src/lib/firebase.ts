import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore/lite';
import { NoticeItem, UserProfile } from '../types';
import { isDesignatedAdminEmail } from './authStorage';

/**
 * Accounts, notices and inquiries for the static site. Admin rights come from the email list in
 * authStorage.ts and are enforced again by firestore.rules (keep both lists the same).
 */
const app = initializeApp({
  apiKey: 'AIzaSyD7IXSPdleaFGENCy0wyRVQnctCLfslj0M',
  authDomain: 'ambient-post-1kpr3.firebaseapp.com',
  projectId: 'ambient-post-1kpr3',
  storageBucket: 'ambient-post-1kpr3.firebasestorage.app',
  messagingSenderId: '711747484809',
  appId: '1:711747484809:web:e18c7af3aed0bca72c9a58',
});
const auth = getAuth(app);
const db = getFirestore(app, 'ai-studio-aihubbyyool-2181b7bf-b2a5-4f18-9c43-11428d556435');

// Kakao Developers → 앱 → 플랫폼 키 → REST API 키 "AI Hub 웹" (client secret off, redirect URI = the Pages URL).
// Empty means the button says "준비 중".
export const KAKAO_REST_API_KEY = 'a8392d5aa02499f47ed62258771d575e';
export const isKakaoReady = () => Boolean(KAKAO_REST_API_KEY);

export type Provider = 'google' | 'kakao';

export interface HubUser {
  uid: string;
  name: string;
  email: string;
  photo: string;
  provider: Provider;
  status: 'active' | 'suspended';
  createdAt?: string;
  lastLoginAt?: string;
  memo?: string;
}

export type InquiryStatus = 'open' | 'in_progress' | 'done';

export interface HubInquiry {
  id: string;
  uid: string;
  name: string;
  email: string;
  type: string;
  title: string;
  message: string;
  status: InquiryStatus;
  memo: string;
  createdAt?: string;
}

const iso = (t?: Timestamp | null) => (t && typeof t.toDate === 'function' ? t.toDate().toISOString() : undefined);
const dateOnly = (s?: string) => (s ? s.slice(0, 10).replace(/-/g, '.') : undefined);

/** adminEmail is the signed-in Google address; Kakao accounts never get admin rights. */
function toProfile(u: HubUser, adminEmail: string): UserProfile {
  const isAdmin = isDesignatedAdminEmail(adminEmail);
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.name,
    photoURL: u.photo || undefined,
    role: isAdmin ? 'ADMIN' : 'USER',
    isAdmin,
    status: 'ACTIVE',
    joinedAt: dateOnly(u.createdAt),
    lastActiveAt: dateOnly(u.lastLoginAt),
  };
}

// ── Sign-in ──────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(auth, provider);
}

const KAKAO_STATE_KEY = 'aihub_kakao_state';
const KAKAO_PROFILE_KEY = 'aihub_kakao_profile';
const kakaoRedirectUri = () => window.location.origin + (import.meta as any).env.BASE_URL;

/** Sends the browser to Kakao's consent page; it comes back with ?code=… (see finishKakaoLogin). */
export function startKakaoLogin(): void {
  const state = Math.random().toString(36).slice(2);
  sessionStorage.setItem(KAKAO_STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: kakaoRedirectUri(),
    response_type: 'code',
    state,
  });
  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
}

/**
 * Completes a Kakao login after the redirect. Kakao identities are kept on an anonymous Firebase
 * account, so they can send inquiries; admin rights need a Google account.
 */
export async function finishKakaoLogin(): Promise<'none' | 'ok'> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) return 'none';
  window.history.replaceState(null, '', window.location.pathname + window.location.hash);
  if (state !== sessionStorage.getItem(KAKAO_STATE_KEY)) throw new Error('expired');
  sessionStorage.removeItem(KAKAO_STATE_KEY);

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: new URLSearchParams({ grant_type: 'authorization_code', client_id: KAKAO_REST_API_KEY, redirect_uri: kakaoRedirectUri(), code }),
  });
  const token = await tokenRes.json();
  if (!tokenRes.ok || !token.access_token) throw new Error('failed');
  const meRes = await fetch('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${token.access_token}` } });
  const me = await meRes.json();
  const profile = me?.kakao_account?.profile || {};
  sessionStorage.setItem(
    KAKAO_PROFILE_KEY,
    JSON.stringify({
      name: String(profile.nickname || '카카오 사용자').slice(0, 40),
      photo: String(profile.profile_image_url || '').slice(0, 500),
      email: String(me?.kakao_account?.email || '').slice(0, 120),
    })
  );
  await signInAnonymously(auth);
  return 'ok';
}

export const signOutHub = () => signOut(auth);

/**
 * Follows the Firebase session: creates the user document on first sign-in, refreshes lastLoginAt,
 * and signs suspended accounts straight back out.
 */
export type SessionNotice = 'suspended' | 'failed';

export function watchSession(onChange: (user: UserProfile | null, notice?: SessionNotice) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) return onChange(null);
    try {
      const ref = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(ref);
      const isKakao = fbUser.isAnonymous;
      if (isKakao && !snap.exists() && !sessionStorage.getItem(KAKAO_PROFILE_KEY)) {
        // An anonymous session without a finished Kakao login is not an account.
        await signOut(auth);
        return onChange(null);
      }
      const kakao = isKakao ? JSON.parse(sessionStorage.getItem(KAKAO_PROFILE_KEY) || '{}') : {};
      sessionStorage.removeItem(KAKAO_PROFILE_KEY);
      // Same limits as firestore.rules (name ≤ 60, photo ≤ 2048), or the write is refused and sign-in fails.
      const photo = (isKakao ? kakao.photo : fbUser.photoURL) || '';
      const fresh = {
        name: ((isKakao ? kakao.name : fbUser.displayName) || (fbUser.email || '').split('@')[0] || '사용자').slice(0, 60),
        photo: photo.length <= 2048 ? photo : '',
      };
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: fbUser.uid,
          ...fresh,
          email: isKakao ? kakao.email || '' : fbUser.email || '',
          provider: isKakao ? 'kakao' : 'google',
          status: 'active',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        if (snap.data().status === 'suspended') {
          await signOut(auth);
          return onChange(null, 'suspended');
        }
        await updateDoc(ref, { ...(isKakao ? {} : fresh), lastLoginAt: serverTimestamp() });
      }
      const data = (await getDoc(ref)).data() as any;
      onChange(toProfile({ ...data, createdAt: iso(data.createdAt), lastLoginAt: iso(data.lastLoginAt) }, isKakao ? '' : fbUser.email || ''));
    } catch (e) {
      console.error('[AUTH] session sync failed', e);
      onChange(null, 'failed');
    }
  });
}

// ── Notices ──────────────────────────────────────────────────────────

export async function listNotices(): Promise<NoticeItem[]> {
  const snap = await getDocs(query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(100)));
  const items = snap.docs.map((d) => {
    const x = d.data() as any;
    return {
      id: d.id,
      title: x.title,
      content: x.content,
      category: x.category,
      author: x.author,
      isPinned: !!x.pinned,
      createdAt: iso(x.createdAt) || new Date().toISOString(),
      updatedAt: iso(x.updatedAt),
      status: 'PUBLISHED' as const,
    };
  });
  return items.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
}

export interface NoticeInput {
  title: string;
  content: string;
  category: NoticeItem['category'];
  pinned: boolean;
}

export async function saveNotice(input: NoticeInput, author: string, id?: string): Promise<void> {
  if (id) {
    await updateDoc(doc(db, 'notices', id), { ...input, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, 'notices'), { ...input, author, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export const deleteNotice = (id: string) => deleteDoc(doc(db, 'notices', id));

// ── Users (admin) ────────────────────────────────────────────────────

export async function listUsers(): Promise<HubUser[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('lastLoginAt', 'desc'), limit(500)));
  return snap.docs.map((d) => {
    const x = d.data() as any;
    return { ...x, uid: d.id, memo: x.memo || '', createdAt: iso(x.createdAt), lastLoginAt: iso(x.lastLoginAt) };
  });
}

export const updateUser = (uid: string, patch: { status?: HubUser['status']; memo?: string }) => updateDoc(doc(db, 'users', uid), patch);

// ── Bookmarks ────────────────────────────────────────────────────────
// One document per account: bookmarks/{uid} = { ids: '3,75,102', updatedAt }. A plain id list keeps the rule to one regex.

const BOOKMARK_LIMIT = 300;

export async function loadBookmarks(): Promise<number[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('signed out');
  const snap = await getDoc(doc(db, 'bookmarks', uid));
  const ids = String(snap.data()?.ids || '');
  return ids ? ids.split(',').map(Number) : [];
}

let queuedBookmarks: number[] | null = null;
let savingBookmarks = false;

/** Saves the latest list. Calls made during a save collapse into one more write, so writes never land out of order. */
export function saveBookmarks(ids: number[]): void {
  queuedBookmarks = ids;
  if (savingBookmarks) return;
  savingBookmarks = true;
  (async () => {
    while (queuedBookmarks) {
      const next = queuedBookmarks;
      queuedBookmarks = null;
      const uid = auth.currentUser?.uid;
      if (!uid) break;
      const clean = next.filter((id) => Number.isSafeInteger(id) && id >= 0).slice(-BOOKMARK_LIMIT);
      try {
        await setDoc(doc(db, 'bookmarks', uid), { ids: clean.join(','), updatedAt: serverTimestamp() });
      } catch (e) {
        console.error('[BOOKMARKS] save failed', e);
      }
    }
    queuedBookmarks = null;
    savingBookmarks = false;
  })();
}

// ── Inquiries ────────────────────────────────────────────────────────

export const INQUIRY_LIMIT = { perDay: 5, gapMs: 60_000 };

/**
 * Files an inquiry. firestore.rules allow one a minute and five a day per account, so the counter in
 * inquiryLimits/{uid} is written in the same batch; a refused batch throws Error('rate-limit').
 */
export async function submitInquiry(input: { type: string; title: string; message: string; name: string; email: string }): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('signed out');
  const limitRef = doc(db, 'inquiryLimits', uid);
  const limit = (await getDoc(limitRef)).data();
  const now = Date.now();
  const sameDay = !!limit && now < limit.windowStart.toMillis() + 86_400_000;
  if ((limit && now < limit.lastAt.toMillis() + INQUIRY_LIMIT.gapMs) || (sameDay && limit.count >= INQUIRY_LIMIT.perDay)) {
    throw new Error('rate-limit');
  }
  const batch = writeBatch(db);
  batch.set(
    limitRef,
    sameDay
      ? { lastAt: serverTimestamp(), windowStart: limit.windowStart, count: limit.count + 1 }
      : { lastAt: serverTimestamp(), windowStart: serverTimestamp(), count: 1 }
  );
  batch.set(doc(collection(db, 'inquiries')), {
    uid,
    name: input.name.slice(0, 40),
    email: input.email.slice(0, 120),
    type: input.type.slice(0, 30),
    title: input.title.slice(0, 100),
    message: input.message.slice(0, 3000),
    status: 'open',
    memo: '',
    createdAt: serverTimestamp(),
  });
  try {
    await batch.commit();
  } catch (e: any) {
    // The rules refuse the batch when the server clock says the limit is reached.
    throw new Error(String(e?.code || '').includes('permission-denied') ? 'rate-limit' : 'failed');
  }
}

// ── Account deletion ─────────────────────────────────────────────────

/**
 * Deletes the signed-in member: bookmarks, profile, then the sign-in account. Google asks for a fresh
 * sign-in first. Inquiries stay for the period in the privacy policy.
 */
export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('signed out');
  if (!user.isAnonymous) await reauthenticateWithPopup(user, new GoogleAuthProvider());
  await deleteDoc(doc(db, 'bookmarks', user.uid));
  await deleteDoc(doc(db, 'users', user.uid));
  await deleteUser(user);
}

export async function listInquiries(): Promise<HubInquiry[]> {
  const snap = await getDocs(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(300)));
  return snap.docs.map((d) => {
    const x = d.data() as any;
    return { ...x, id: d.id, createdAt: iso(x.createdAt) };
  });
}

export const updateInquiry = (id: string, patch: { status?: InquiryStatus; memo?: string }) =>
  updateDoc(doc(db, 'inquiries', id), patch);

export const deleteInquiry = (id: string) => deleteDoc(doc(db, 'inquiries', id));
