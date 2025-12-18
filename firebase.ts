
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
    const userRef = doc(db, 'users', uid.toString());
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) return userSnap.data() as UserData;
  } catch (error) { console.error("Error fetching user:", error); }
  return null;
};

export const addBotMessage = async (uid: string, text: string) => {
  try {
    await addDoc(collection(db, 'users', uid.toString(), 'messages'), {
      text,
      timestamp: Date.now(),
      type: 'bot'
    });
  } catch (e) { console.error("Error adding message:", e); }
};

export const registerUser = async (uid: string, referralCode: string | null, details: Partial<UserData>): Promise<UserData> => {
  const userId = uid.toString();
  try {
    const existing = await getUserData(userId);
    if (existing) return existing;

    let balance = WELCOME_BONUS_BASE;
    let referred_by = null;

    // Logic: If referred, New User gets 1000 + 500 = 1500. Referrer gets 500.
    if (referralCode && referralCode.trim() !== "" && referralCode.toString() !== userId) {
      const referrerId = referralCode.toString();
      const referrerRef = doc(db, 'users', referrerId);
      const referrerSnap = await getDoc(referrerRef);
      
      if (referrerSnap.exists()) {
        referred_by = referrerId;
        balance += REFERRAL_BONUS; // Give referee extra 500
        
        // Give referrer 500 coins bonus
        await updateDoc(referrerRef, { 
          balance: increment(REFERRAL_BONUS) 
        });
        
        // Notify referrer in their app chat
        await addBotMessage(referrerId, `🎉 Success! A new friend joined using your link. You've earned a +500 coins referral bonus!`);
      }
    }

    const newUser: UserData = {
      uid: userId,
      firstName: details.firstName || 'User',
      lastName: details.lastName || '',
      username: details.username || 'user',
      balance,
      total_watched: 0,
      referred_by,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'users', userId), newUser);
    
    // Welcome message for the new user
    await addBotMessage(userId, `👋 Welcome to CoinEarn, ${details.firstName || 'User'}!`);
    await addBotMessage(userId, `💰 You've started with a balance of ${balance} coins. Watch ads to grow your wallet!`);
    
    return newUser;
  } catch (error: any) {
    console.error("Registration error:", error);
    return { uid: userId, balance: 0, total_watched: 0, referred_by: null, createdAt: Date.now() };
  }
};

export const updateAdWatch = async (uid: string, reward: number, referredBy: string | null) => {
  try {
    const userRef = doc(db, 'users', uid.toString());
    await updateDoc(userRef, {
      balance: increment(reward),
      total_watched: increment(1)
    });
    
    // Send a message notification for every ad watched
    await addBotMessage(uid, `✅ Ad Reward Claimed: +${reward} coins added. Keep it up!`);

    if (referredBy) {
      const commission = Math.floor(reward * 0.1);
      if (commission > 0) {
        await updateDoc(doc(db, 'users', referredBy.toString()), { balance: increment(commission) });
      }
    }
  } catch (err) { console.error("Ad update error:", err); }
};

export const getMessages = async (uid: string): Promise<Message[]> => {
  try {
    const q = query(collection(db, 'users', uid.toString(), 'messages'), orderBy('timestamp', 'desc'), limit(50));
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
    await addBotMessage(request.user_id, `💸 Withdrawal request for ${request.amount} coins is now pending review.`);
  } catch (err) { console.error(err); }
};

export const getWithdrawalHistory = async (uid: string): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(collection(db, 'withdrawals'), where('user_id', '==', uid.toString()), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
  } catch (e) { return []; }
};
