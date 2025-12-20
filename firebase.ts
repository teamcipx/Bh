
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
  notice: "🚀 Welcome to CoinEarn! Watch, Invite & Earn daily.",
  banner_url: "https://images.unsplash.com/photo-1611974717424-35843a84fd20?auto=format&fit=crop&w=800&q=80",
  banner_link: "https://t.me/AdearnX_bot",
  ad_reward: 100,
  min_withdrawal: 5000
};

const WELCOME_BONUS_BASE = 1000;
const REFERRAL_BONUS = 500;

const generateReferralCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', uid.toString());
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data() as UserData;
      
      // FIX: Handle users registered before the referralCode update
      if (!data.referralCode || data.referralCount === undefined) {
        const updates: any = {};
        if (!data.referralCode) updates.referralCode = generateReferralCode();
        if (data.referralCount === undefined) updates.referralCount = 0;
        
        await updateDoc(userRef, updates);
        return { ...data, ...updates };
      }
      
      return data;
    }
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

export const registerUser = async (uid: string, details: Partial<UserData>): Promise<UserData> => {
  const userId = uid.toString();
  try {
    const existing = await getUserData(userId);
    if (existing) return existing;

    const newUser: UserData = {
      uid: userId,
      firstName: details.firstName || 'User',
      lastName: details.lastName || '',
      username: details.username || 'user',
      balance: WELCOME_BONUS_BASE,
      total_watched: 0,
      referred_by: null,
      referralCode: generateReferralCode(),
      referralCount: 0,
      hasSubmittedCode: false,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'users', userId), newUser);
    
    await addBotMessage(userId, `🎉 Welcome aboard, ${details.firstName}!`);
    await addBotMessage(userId, `💰 I've credited ${WELCOME_BONUS_BASE} coins to your wallet.`);
    await addBotMessage(userId, `💡 Use a 4-digit referral code in the 'Invite' tab for +${REFERRAL_BONUS} bonus!`);
    
    return newUser;
  } catch (error: any) {
    console.error("Registration error:", error);
    return { uid: userId, balance: 0, total_watched: 0, referred_by: null, createdAt: Date.now(), referralCode: '0000', referralCount: 0 };
  }
};

export const submitReferralCode = async (uid: string, shortCode: string): Promise<{success: boolean, message: string}> => {
  try {
    const userId = uid.toString();
    const cleanCode = shortCode.trim();
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { success: false, message: "User not found." };
    
    const userData = userSnap.data() as UserData;
    if (userData.referred_by || userData.hasSubmittedCode) {
      return { success: false, message: "You can only use a code once." };
    }

    if (userData.referralCode === cleanCode) {
      return { success: false, message: "You cannot use your own code." };
    }

    // Find referrer by short code
    const q = query(collection(db, 'users'), where('referralCode', '==', cleanCode), limit(1));
    const snap = await getDocs(q);
    
    if (snap.empty) return { success: false, message: "Invalid Code." };

    const referrerDoc = snap.docs[0];
    const referrerId = referrerDoc.id;
    const referrerRef = doc(db, 'users', referrerId);

    // Update Referrer
    await updateDoc(referrerRef, { 
      balance: increment(REFERRAL_BONUS),
      referralCount: increment(1)
    });
    await addBotMessage(referrerId, `🎊 Someone used your code! +${REFERRAL_BONUS} coins added.`);

    // Update User
    await updateDoc(userRef, { 
      balance: increment(REFERRAL_BONUS),
      referred_by: referrerId,
      hasSubmittedCode: true
    });
    await addBotMessage(userId, `✅ +${REFERRAL_BONUS} coins for using a referral code!`);

    return { success: true, message: "Success! +500 Coins added." };
  } catch (e) {
    return { success: false, message: "System error." };
  }
};

export const getReferralHistory = async (uid: string): Promise<UserData[]> => {
  try {
    const q = query(collection(db, 'users'), where('referred_by', '==', uid.toString()), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as UserData).sort((a,b) => b.createdAt - a.createdAt);
  } catch (e) {
    return [];
  }
};

export const updateAdWatch = async (uid: string, reward: number, referredBy: string | null) => {
  try {
    const userRef = doc(db, 'users', uid.toString());
    await updateDoc(userRef, {
      balance: increment(reward),
      total_watched: increment(1)
    });
    
    await addBotMessage(uid, `✅ +${reward} coins for watching an ad!`);

    if (referredBy) {
      const commission = Math.floor(reward * 0.1);
      if (commission > 0) {
        await updateDoc(doc(db, 'users', referredBy.toString()), { balance: increment(commission) });
      }
    }
  } catch (err) { console.error(err); }
};

export const getMessages = async (uid: string): Promise<Message[]> => {
  try {
    const q = query(collection(db, 'users', uid.toString(), 'messages'), orderBy('timestamp', 'desc'), limit(30));
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

export const updateAppSettings = async (newSettings: Partial<AppSettings>) => {
  try {
    await setDoc(doc(db, 'settings', 'config'), newSettings, { merge: true });
  } catch (e) { throw e; }
};

export const createWithdrawal = async (request: WithdrawalRequest) => {
  try {
    await addDoc(collection(db, 'withdrawals'), request);
    await updateDoc(doc(db, 'users', request.user_id), { balance: increment(-request.amount) });
    await addBotMessage(request.user_id, `💸 Withdrawal request submitted: ${request.amount} coins.`);
  } catch (err) { console.error(err); }
};

export const getWithdrawalHistory = async (uid: string): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(collection(db, 'withdrawals'), where('user_id', '==', uid.toString()));
    const snap = await getDocs(q);
    const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
    return results.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) { 
    console.error("Error fetching withdrawal history:", e);
    return []; 
  }
};

export const getAllWithdrawals = async (): Promise<WithdrawalRequest[]> => {
  try {
    const q = query(collection(db, 'withdrawals'), limit(100));
    const snap = await getDocs(q);
    const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
    return results.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) { return []; }
};

export const updateWithdrawalStatus = async (id: string, status: 'completed' | 'rejected', userId: string, amount: number) => {
  try {
    const ref = doc(db, 'withdrawals', id);
    await updateDoc(ref, { status });
    
    if (status === 'rejected') {
      await updateDoc(doc(db, 'users', userId), { balance: increment(amount) });
      await addBotMessage(userId, `❌ Withdrawal rejected. ${amount} coins returned to balance.`);
    } else {
      await addBotMessage(userId, `✅ Withdrawal request of ${amount} coins marked as completed.`);
    }
  } catch (e) { throw e; }
};
