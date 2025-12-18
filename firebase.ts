
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  increment,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { UserData, AppSettings, WithdrawalRequest } from './types';

// Firebase configuration
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
 * Using long-polling to ensure connectivity in restricted environments like Telegram's proxy.
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

    let initialBalance = 0;
    let validReferrer = false;

    // Dual Bonus Logic: Both get rewarded
    if (referralCode && referralCode !== uid) {
      const referrerRef = doc(db, 'users', referralCode);
      const referrerSnap = await getDoc(referrerRef);
      if (referrerSnap.exists()) {
        validReferrer = true;
        initialBalance = 250; // New user gets 250 coins
        
        // Referrer gets 500 coins bonus
        await updateDoc(referrerRef, {
          balance: increment(500)
        });
      }
    }

    const newUser: UserData = {
      uid,
      firstName: details.firstName || '',
      lastName: details.lastName || '',
      username: details.username || '',
      balance: initialBalance,
      total_watched: 0,
      referred_by: validReferrer ? referralCode : null,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'users', uid), newUser);
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

export const updateAdWatch = async (uid: string, reward: number, referredBy: string | null) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      balance: increment(reward),
      total_watched: increment(1)
    });

    if (referredBy) {
      const referrerRef = doc(db, 'users', referredBy);
      const commission = Math.floor(reward * 0.1); // 10% lifetime commission
      if (commission > 0) {
        await updateDoc(referrerRef, {
          balance: increment(commission)
        });
      }
    }
  } catch (err) {
    console.error("Failed to update ad watch:", err);
  }
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

export const getWithdrawalHistory = async (uid: string): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(
      collection(db, 'withdrawals'),
      where('user_id', '==', uid),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    return [];
  }
};
