
/**
 * LOCAL MOCK AUTHENTICATION SERVICE
 * Implements an observer pattern to allow real-time auth state updates.
 */

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

const STORAGE_USERS = 'curricuforge_mock_users';
const STORAGE_SESSION = 'curricuforge_mock_session';

type AuthCallback = (user: User | null) => void;
let authListeners: AuthCallback[] = [];

// Fallback UUID generator if crypto.randomUUID is unavailable
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getUsers = (): any[] => {
  const data = localStorage.getItem(STORAGE_USERS);
  return data ? JSON.parse(data) : [];
};

const notifyListeners = (user: User | null) => {
  authListeners.forEach(callback => callback(user));
};

export const onAuthStateChanged = (callback: AuthCallback) => {
  authListeners.push(callback);
  
  // Provide initial state from storage
  const session = localStorage.getItem(STORAGE_SESSION);
  callback(session ? JSON.parse(session) : null);
  
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(l => l !== callback);
  };
};

export const signIn = async (email: string, pass: string) => {
  // Artificial delay for realism
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === pass);
  
  if (!user) {
    throw new Error("Invalid email or password.");
  }
  
  const sessionUser: User = { uid: user.uid, email: user.email, displayName: user.displayName };
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(sessionUser));
  notifyListeners(sessionUser);
};

export const signUp = async (email: string, pass: string, name: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error("Email already registered.");
  }
  
  const newUser = {
    uid: generateId(),
    email,
    password: pass,
    displayName: name
  };
  
  const updatedUsers = [...users, newUser];
  localStorage.setItem(STORAGE_USERS, JSON.stringify(updatedUsers));
  
  const sessionUser: User = { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName };
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(sessionUser));
  notifyListeners(sessionUser);
};

export const signOut = async () => {
  localStorage.removeItem(STORAGE_SESSION);
  notifyListeners(null);
};

export const auth = { currentUser: null };
