
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
  getDocs,
  limit
} from 'firebase/firestore';
import { UserData, AppSettings, WithdrawalRequest, Message } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyCJAd3sdsoFKUcza2z-9VYlfIkm1BL4kd4",
  authDomain: "ttggg-9f560.firebaseapp.com",
  projectId: "ttggg-9f560",
  storageBucket: "ttggg-9f560.firebasestorage.app",
  messagingSenderId: "504881045098",
  appId: "1:504881045098:web:d96ebbb5cc2a86d0377413"
};

const app = initializeApp(firebaseConfig);
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

const WELCOME_BONUS_BASE = 1000;
const REFERRAL_BONUS = 500;

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) return userSnap.data() as UserData;
  } catch (error) { console.error("Error fetching user:", error); }
  return null;
};

export const addBotMessage = async (uid: string, text: string) => {
  try {
    await addDoc(collection(db, 'users', uid, 'messages'), {
      text,
      timestamp: Date.now(),
      type: 'bot'
    });
  } catch (e) { console.error("Error adding message:", e); }
};

export const registerUser = async (uid: string, referralCode: string | null, details: Partial<UserData>): Promise<UserData> => {
  try {
    const existing = await getUserData(uid);
    if (existing) return existing;

    let balance = WELCOME_BONUS_BASE;
    let referred_by = null;

    if (referralCode && referralCode !== uid) {
      const referrerRef = doc(db, 'users', referralCode);
      const referrerSnap = await getDoc(referrerRef);
      if (referrerSnap.exists()) {
        balance += REFERRAL_BONUS; // Referred user gets extra 500
        referred_by = referralCode;
        
        await updateDoc(referrerRef, { balance: increment(REFERRAL_BONUS) });
        await addBotMessage(referralCode, "🎉 New Referral! Someone joined using your link. You earned 500 coins.");
      }
    }

    const newUser: UserData = {
      uid,
      firstName: details.firstName || '',
      lastName: details.lastName || '',
      username: details.username || '',
      balance,
      total_watched: 0,
      referred_by,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'users', uid), newUser);
    await addBotMessage(uid, `👋 Welcome to CoinEarn! You received ${balance} coins as a welcome bonus! 💰`);
    
    return newUser;
  } catch (error: any) {
    console.error("Registration error:", error);
    return { uid, balance: 0, total_watched: 0, referred_by: null, createdAt: Date.now() };
  }
};

export const updateAdWatch = async (uid: string, reward: number, referredBy: string | null) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      balance: increment(reward),
      total_watched: increment(1)
    });
    await addBotMessage(uid, `📺 Ad watched! +${reward} coins added to your wallet.`);

    if (referredBy) {
      const commission = Math.floor(reward * 0.1);
      if (commission > 0) {
        await updateDoc(doc(db, 'users', referredBy), { balance: increment(commission) });
      }
    }
  } catch (err) { console.error("Ad update error:", err); }
};

export const getMessages = async (uid: string): Promise<Message[]> => {
  try {
    const q = query(collection(db, 'users', uid, 'messages'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
  } catch (e) { return []; }
};

export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const snap = await getDoc(doc(db, 'settings', 'config'));
    if (snap.exists()) return snap.data() as AppSettings;
  } catch (error) {}
  return DEFAULT_SETTINGS;
};

export const createWithdrawal = async (request: WithdrawalRequest) => {
  try {
    await addDoc(collection(db, 'withdrawals'), request);
    await updateDoc(doc(db, 'users', request.user_id), { balance: increment(-request.amount) });
    await addBotMessage(request.user_id, `💸 Withdrawal of ${request.amount} coins is pending review.`);
  } catch (err) { console.error(err); }
};

export const getWithdrawalHistory = async (uid: string): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(collection(db, 'withdrawals'), where('user_id', '==', uid), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
  } catch (e) { return []; }
};
