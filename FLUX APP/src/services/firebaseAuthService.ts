import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebaseConfig';
import { UserProfile, UserVaultData, UserSession } from '../types';
import {
  getUserVaultData,
  saveUserVaultData,
  getRegisteredUsers,
} from './authService';
import { INITIAL_TRANSACTIONS } from '../data/defaultTransactions';
import { INITIAL_CREDIT_CARDS, INITIAL_FRIEND_BORROWINGS } from '../data/defaultBorrowings';
import { INITIAL_TODOS } from '../data/defaultTodos';
import { INITIAL_SALARY_CONFIG } from '../data/defaultSalary';
import { DEFAULT_CURRENCY } from '../utils/currencies';

const USERS_REGISTRY_KEY = 'flux_users_registry';
const ACTIVE_SESSION_KEY = 'flux_active_session';

/**
 * Sign in using Firebase Google Authentication (Free tier Spark plan)
 * Creates or restores user credential profile & vault in Firestore.
 */
export async function loginWithFirebaseGoogle(): Promise<{ user: UserProfile; vault: UserVaultData }> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const fbUser = cred.user;

    if (!fbUser) {
      throw new Error('Firebase authentication failed: No user returned.');
    }

    const email = fbUser.email || '';
    const uid = fbUser.uid;
    const displayName = fbUser.displayName || email.split('@')[0] || 'Firebase User';
    const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    const cleanLoginId = emailPrefix.length >= 3 ? emailPrefix : `usr_${uid.slice(0, 8)}`;

    const userDocRef = doc(db, 'users', uid);
    const vaultDocRef = doc(db, 'vaults', uid);

    let existingProfile: UserProfile | null = null;
    let existingVault: UserVaultData | null = null;

    // Fetch existing user profile from Firestore if it exists
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        existingProfile = snap.data() as UserProfile;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }

    // Fetch existing user vault from Firestore if it exists
    try {
      const vSnap = await getDoc(vaultDocRef);
      if (vSnap.exists()) {
        const data = vSnap.data();
        existingVault = {
          transactions: Array.isArray(data.transactions) ? data.transactions : [],
          creditCards: Array.isArray(data.creditCards) ? data.creditCards : [],
          friendBorrowings: Array.isArray(data.friendBorrowings) ? data.friendBorrowings : [],
          todos: Array.isArray(data.todos) ? data.todos : [],
          salaryConfig: data.salaryConfig || INITIAL_SALARY_CONFIG,
          currency: data.currency || DEFAULT_CURRENCY,
          uiColor: data.uiColor || 'indigo',
          headerStyle: data.headerStyle || 'pure-light',
          theme: data.theme || 'light',
          googleSheetSync: data.googleSheetSync,
          firebaseSyncedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `vaults/${uid}`);
    }

    // Determine Master Admin status
    const isAdmin =
      email.toLowerCase() === 'surajdubey033@gmail.com' ||
      cleanLoginId === 'admin' ||
      existingProfile?.role === 'admin';

    // Construct or update UserProfile
    const userProfile: UserProfile = {
      id: uid,
      firebaseUid: uid,
      loginId: existingProfile?.loginId || cleanLoginId,
      name: displayName,
      email: email,
      avatarColor: existingProfile?.avatarColor || '#4f46e5',
      role: isAdmin ? 'admin' : (existingProfile?.role || 'user'),
      status: 'active',
      passwordHash: existingProfile?.passwordHash || 'firebase_managed',
      salt: existingProfile?.salt || 'firebase_managed',
      authProvider: 'firebase_google',
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      vaultVersion: (existingProfile?.vaultVersion || 0) + 1,
      notes: `Authenticated via Firebase Google Account: ${email}`,
    };

    // If no vault in Firestore, prepare initial or cached vault
    const userVault: UserVaultData = existingVault || {
      transactions: INITIAL_TRANSACTIONS,
      creditCards: INITIAL_CREDIT_CARDS,
      friendBorrowings: INITIAL_FRIEND_BORROWINGS,
      todos: INITIAL_TODOS,
      salaryConfig: INITIAL_SALARY_CONFIG,
      currency: DEFAULT_CURRENCY,
      uiColor: 'indigo',
      headerStyle: 'pure-light',
      theme: 'light',
      firebaseSyncedAt: new Date().toISOString(),
    };

    // Save profile to Firestore
    try {
      await setDoc(userDocRef, userProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }

    // Save vault to Firestore
    try {
      await setDoc(vaultDocRef, {
        userId: uid,
        loginId: userProfile.loginId,
        transactions: userVault.transactions,
        creditCards: userVault.creditCards,
        friendBorrowings: userVault.friendBorrowings,
        todos: userVault.todos,
        salaryConfig: userVault.salaryConfig,
        currency: userVault.currency,
        uiColor: userVault.uiColor,
        headerStyle: userVault.headerStyle,
        theme: userVault.theme,
        googleSheetSync: userVault.googleSheetSync || null,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `vaults/${uid}`);
    }

    // Also persist in local user registry for seamless offline resilience
    const localUsers = getRegisteredUsers();
    const existingIdx = localUsers.findIndex((u) => u.id === uid || u.loginId.toLowerCase() === userProfile.loginId.toLowerCase());
    if (existingIdx >= 0) {
      localUsers[existingIdx] = userProfile;
    } else {
      localUsers.push(userProfile);
    }
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(localUsers));

    // Save local vault
    saveUserVaultData(userProfile.loginId, userVault);

    // Save active session
    const session: UserSession = {
      loginId: userProfile.loginId,
      token: `flux_fb_${uid}_${Date.now()}`,
      loginTime: new Date().toISOString(),
      authProvider: 'firebase_google',
      firebaseUid: uid,
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));

    return { user: userProfile, vault: userVault };
  } catch (error) {
    console.error('Firebase Google Sign-In failed:', error);
    throw error;
  }
}

/**
 * Sync active user vault to Firestore
 */
export async function syncVaultToFirestore(user: UserProfile, vault: UserVaultData): Promise<void> {
  const targetId = user.firebaseUid || user.id;
  if (!targetId) return;

  const vaultDocRef = doc(db, 'vaults', targetId);
  try {
    await setDoc(vaultDocRef, {
      userId: targetId,
      loginId: user.loginId,
      transactions: vault.transactions,
      creditCards: vault.creditCards,
      friendBorrowings: vault.friendBorrowings,
      todos: vault.todos,
      salaryConfig: vault.salaryConfig,
      currency: vault.currency,
      uiColor: vault.uiColor,
      headerStyle: vault.headerStyle,
      theme: vault.theme,
      googleSheetSync: vault.googleSheetSync || null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `vaults/${targetId}`);
  }
}

/**
 * Sign out of Firebase Auth
 */
export async function logoutFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.error('Firebase sign out error:', e);
  }
}

/**
 * Listen to Firebase Auth state
 */
export function subscribeToFirebaseAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
