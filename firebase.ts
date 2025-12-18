
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  increment 
} from 'firebase/firestore';
import { UserData, AppSettings, WithdrawalRequest } from './types';

// Updated with user provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJAd3sdsoFKUcza2z-9VYlfIkm1BL4kd4",
  authDomain: "ttggg-9f560.firebaseapp.com",
  projectId: "ttggg-9f560",
  storageBucket: "ttggg-9f560.firebasestorage.app",
  messagingSenderId: "504881045098",
  appId: "1:504881045098:web:d96ebbb5cc2a86d0377413"
};

const app = initializeApp(firebaseConfig);

/**
 * Use long-polling to bypass potential WebSocket blocks in some network environments.
 */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const DEFAULT_SETTINGS: AppSettings = {
  notice: "Welcome to CoinEarn! Watch ads and earn real money daily.",
  banner_url: "https://picsum.photos/800/400?grayscale",
  banner_link: "https://t.me/AdearnX_bot",
  ad_reward: 100,
  min_withdrawal: 5000
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
  } catch (error) {
    console.warn("Firestore getUserData error (likely offline):", error);
  }
  return null;
};

export const registerUser = async (uid: string, referralCode: string | null, details: Partial<UserData>): Promise<UserData> => {
  try {
    const existing = await getUserData(uid);
    if (existing) return existing;

    const newUser: UserData = {
      uid,
      firstName: details.firstName || '',
      lastName: details.lastName || '',
      username: details.username || '',
      balance: 0,
      total_watched: 0,
      referred_by: referralCode,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'users', uid), newUser);

    if (referralCode) {
      const referrerRef = doc(db, 'users', referralCode);
      const referrerSnap = await getDoc(referrerRef);
      if (referrerSnap.exists()) {
        await updateDoc(referrerRef, {
          balance: increment(500)
        });
      }
    }
    return newUser;
  } catch (error: any) {
    console.error("Firestore registerUser error:", error);
    return {
      uid,
      firstName: details.firstName || 'Guest',
      lastName: details.lastName || '',
      username: details.username || 'guest',
      balance: 0,
      total_watched: 0,
      referred_by: null,
      createdAt: Date.now(),
    };
  }
};

export const updateAdWatch = async (uid: string, reward: number) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    balance: increment(reward),
    total_watched: increment(1)
  });
};

export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const settingsRef = doc(db, 'settings', 'config');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      return settingsSnap.data() as AppSettings;
    }
  } catch (error) {
    console.warn("Firestore getAppSettings error (using defaults):", error);
  }
  return DEFAULT_SETTINGS;
};

export const createWithdrawal = async (request: WithdrawalRequest) => {
  const userRef = doc(db, 'users', request.user_id);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const userData = userSnap.data() as UserData;
  if (userData.balance < request.amount) throw new Error("Insufficient balance");

  await addDoc(collection(db, 'withdrawals'), request);
  await updateDoc(userRef, {
    balance: increment(-request.amount)
  });
};
