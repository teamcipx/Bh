
export interface UserData {
  uid: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  balance: number;
  total_watched: number;
  referred_by: string | null;
  createdAt: number;
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

export type Tab = 'home' | 'referral' | 'withdraw' | 'profile';
