
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

export const hapticFeedback = () => {
  try {
    tg?.HapticFeedback?.impactOccurred('medium');
  } catch (e) {
    console.warn("Haptic feedback not supported");
  }
};

export const shareApp = (userId: string) => {
  const link = `https://t.me/AdearnX_bot/app`;
  const text = `Join CoinEarn and start earning daily coins! 💸\n\nUse my Referral Code to get +500 coins instantly: ${userId}`;
  try {
    tg?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
  } catch (e) {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
  }
};

export const closeApp = () => {
  tg?.close();
};

export const showAlert = (message: string) => {
  try {
    if (tg?.showAlert) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  } catch (e) {
    alert(message);
  }
};
