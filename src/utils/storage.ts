// Enhanced local storage utilities for persisting user data with 24-hour retention
const STORAGE_KEY = 'anonymous_chat_data';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface StoredData {
  timestamp: number;
  expiresAt: number;
  userData: {
    currentUser: any;
    chatPartners: any[];
    privateChats: any[];
    notifications: any[];
    usedUsernames: string[];
    sessionData: any;
  };
}

export function saveUserData(data: any): void {
  try {
    const now = Date.now();
    const storageData: StoredData = {
      timestamp: now,
      expiresAt: now + STORAGE_EXPIRY,
      userData: {
        currentUser: data.currentUser,
        chatPartners: data.chatPartners || [],
        privateChats: data.privateChats || [],
        notifications: data.notifications || [],
        usedUsernames: data.usedUsernames || [],
        sessionData: data.sessionData || {}
      }
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    console.log('User data saved to localStorage for 24 hours');
    
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(storageData),
      storageArea: localStorage
    }));
  } catch (error) {
    console.warn('Failed to save user data:', error);
  }
}

export function loadUserData(): any | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const storageData: StoredData = JSON.parse(stored);
    const now = Date.now();
    
    // Check if data is expired (older than 24 hours)
    if (now > storageData.expiresAt) {
      console.log('User data expired, clearing storage');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    console.log('Loading user data from localStorage');
    const userData = storageData.userData;
    
    // Convert date strings back to Date objects
    if (userData.privateChats) {
      userData.privateChats.forEach((chat: any) => {
        if (chat.messages) {
          chat.messages.forEach((msg: any) => {
            msg.timestamp = new Date(msg.timestamp);
          });
        }
        chat.createdAt = new Date(chat.createdAt);
        if (chat.lastActivity) {
          chat.lastActivity = new Date(chat.lastActivity);
        }
      });
    }

    if (userData.notifications) {
      userData.notifications.forEach((notif: any) => {
        notif.timestamp = new Date(notif.timestamp);
      });
    }

    if (userData.currentUser && userData.currentUser.lastSeen) {
      userData.currentUser.lastSeen = new Date(userData.currentUser.lastSeen);
    }

    return userData;
  } catch (error) {
    console.warn('Failed to load user data:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearUserData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('User data cleared from localStorage');
    
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: null,
      storageArea: localStorage
    }));
  } catch (error) {
    console.warn('Failed to clear user data:', error);
  }
}

export function getDataExpiryTime(): Date | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const storageData: StoredData = JSON.parse(stored);
    return new Date(storageData.expiresAt);
  } catch (error) {
    return null;
  }
}

export function getRemainingTime(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;

    const storageData: StoredData = JSON.parse(stored);
    const remaining = storageData.expiresAt - Date.now();
    return Math.max(0, remaining);
  } catch (error) {
    return 0;
  }
}

export function extendDataExpiry(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const storageData: StoredData = JSON.parse(stored);
    const now = Date.now();
    storageData.timestamp = now;
    storageData.expiresAt = now + STORAGE_EXPIRY;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    console.log('Data expiry extended for another 24 hours');
  } catch (error) {
    console.warn('Failed to extend data expiry:', error);
  }
}

// Auto-save user data periodically
export function startAutoSave(getUserData: () => any): () => void {
  const interval = setInterval(() => {
    const userData = getUserData();
    if (userData) {
      saveUserData(userData);
    }
  }, 60000); // Save every minute

  return () => clearInterval(interval);
}