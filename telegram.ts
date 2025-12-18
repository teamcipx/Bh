
declare global {
  interface Window {
    Telegram: any;
  }
}

export const tg = window.Telegram?.WebApp;

export const getTelegramUser = () => {
  return tg?.initDataUnsafe?.user || {
    id: 12345,
    first_name: 'Guest',
    last_name: 'User',
    username: 'guest_user'
  };
};

export const getStartParam = (): string | null => {
  return tg?.initDataUnsafe?.start_param || null;
};

export const hapticFeedback = () => {
  tg?.HapticFeedback?.impactOccurred('medium');
};

export const shareApp = (userId: string) => {
  const link = `https://t.me/AdearnX_bot/app?startapp=${userId}`;
  tg?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join this amazing app and earn coins!")}`);
};

export const closeApp = () => {
  tg?.close();
};

export const showAlert = (message: string) => {
  tg?.showAlert(message);
};
