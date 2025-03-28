
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove, update, onValue, off } from "firebase/database";

// Firebase configuration - these are public keys so it's safe to include them in the client code
const firebaseConfig = {
  apiKey: "AIzaSyCdaxU8gm8cqSS7QrVs-wROeJxANFvf5yc",
  authDomain: "content-calendar-app-75cde.firebaseapp.com",
  projectId: "content-calendar-app-75cde",
  storageBucket: "content-calendar-app-75cde.appspot.com",
  messagingSenderId: "433142818266",
  appId: "1:433142818266:web:d21775d901ec50ad29e0f1",
  databaseURL: "https://content-calendar-app-75cde-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Firebase wrapper functions to maintain similar API to localStorage but with cloud persistence
export const firebaseDB = {
  // Settings functions
  getSettings: async () => {
    try {
      const settingsRef = ref(database, 'settings');
      const snapshot = await get(settingsRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error("Error getting settings:", error);
      // Fall back to localStorage if Firebase fails
      const storedSettings = localStorage.getItem('appSettings');
      return storedSettings ? JSON.parse(storedSettings) : null;
    }
  },
  
  setSettings: async (settings) => {
    try {
      const settingsRef = ref(database, 'settings');
      await set(settingsRef, settings);
      // Also update localStorage as a backup
      localStorage.setItem('appSettings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error("Error setting settings:", error);
      return false;
    }
  },
  
  // Calendar posts functions
  getPosts: async () => {
    try {
      const postsRef = ref(database, 'calendarPosts');
      const snapshot = await get(postsRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return [];
    } catch (error) {
      console.error("Error getting calendar posts:", error);
      // Fall back to localStorage if Firebase fails
      const storedPosts = localStorage.getItem('calendarPosts');
      return storedPosts ? JSON.parse(storedPosts) : [];
    }
  },
  
  setPosts: async (posts) => {
    try {
      const postsRef = ref(database, 'calendarPosts');
      await set(postsRef, posts);
      // Also update localStorage as a backup
      localStorage.setItem('calendarPosts', JSON.stringify(posts));
      return true;
    } catch (error) {
      console.error("Error setting calendar posts:", error);
      return false;
    }
  },
  
  // Client authentication
  setClientAuthentication: async (clientId, authenticated) => {
    try {
      const authRef = ref(database, `clientAuth/${clientId}`);
      await set(authRef, authenticated);
      // Also update localStorage as a backup
      localStorage.setItem(`client_auth_${clientId}`, authenticated ? 'true' : 'false');
      return true;
    } catch (error) {
      console.error("Error setting client authentication:", error);
      return false;
    }
  },
  
  getClientAuthentication: async (clientId) => {
    try {
      const authRef = ref(database, `clientAuth/${clientId}`);
      const snapshot = await get(authRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return false;
    } catch (error) {
      console.error("Error getting client authentication:", error);
      // Fall back to localStorage if Firebase fails
      return localStorage.getItem(`client_auth_${clientId}`) === 'true';
    }
  },
  
  // Real-time subscribers
  subscribeToSettings: (callback) => {
    const settingsRef = ref(database, 'settings');
    onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
    return () => off(settingsRef);
  },
  
  subscribeToPosts: (callback) => {
    const postsRef = ref(database, 'calendarPosts');
    onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback([]);
      }
    });
    return () => off(postsRef);
  }
};

// Initialize with data from localStorage if Firebase is empty
const initializeFromLocalStorage = async () => {
  try {
    // Check if settings exist in Firebase
    const settingsRef = ref(database, 'settings');
    const settingsSnapshot = await get(settingsRef);
    
    if (!settingsSnapshot.exists()) {
      const storedSettings = localStorage.getItem('appSettings');
      if (storedSettings) {
        await set(settingsRef, JSON.parse(storedSettings));
      }
    }
    
    // Check if posts exist in Firebase
    const postsRef = ref(database, 'calendarPosts');
    const postsSnapshot = await get(postsRef);
    
    if (!postsSnapshot.exists()) {
      const storedPosts = localStorage.getItem('calendarPosts');
      if (storedPosts) {
        await set(postsRef, JSON.parse(storedPosts));
      }
    }
  } catch (error) {
    console.error("Error initializing from localStorage:", error);
  }
};

// Run initialization
initializeFromLocalStorage();

// Export database instance for direct access if needed
export { database };
