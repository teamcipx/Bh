
export interface UserData {
  uid: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  balance: number;
  total_watched: number;
  referred_by: string | null; // UID of the person who referred this user
  referralCode: string; // The 4-digit short code
  referralCount: number; // Number of people this user has referred
  hasSubmittedCode?: boolean;
  createdAt: number;
}

export interface Message {
  id?: string;
  text: string;
  timestamp: number;
  type: 'system' | 'bot';
}

export interface WithdrawalRequest {
  id?: string;
  user_id: string;
  amount: number;
  method: string;
  details: string;
  status: 'pending' | 'completed' | 'rejected';
  timestamp: number;
}

export interface AppSettings {
  notice: string;
  banner_url: string;
  banner_link: string;
  ad_reward: number;
  min_withdrawal: number;
}

export type Tab = 'home' | 'chat' | 'referral' | 'withdraw' | 'profile' | 'admin';
