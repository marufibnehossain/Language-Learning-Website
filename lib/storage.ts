// localStorage utilities for user data, wallet, transactions, and progress

import type {
  User,
  Wallet,
  CreditTransaction,
  Attempt,
  UserProgress,
} from './types';

const STORAGE_KEYS = {
  USER: 'langapp_user',
  WALLET: 'langapp_wallet',
  TRANSACTIONS: 'langapp_transactions',
  ATTEMPTS: 'langapp_attempts',
  PROGRESS: 'langapp_progress',
} as const;

// User
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// Wallet
export function getWallet(): Wallet | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.WALLET);
  return data ? JSON.parse(data) : null;
}

export function setWallet(wallet: Wallet): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
}

export function initializeWallet(): Wallet {
  const wallet: Wallet = {
    balance: 50,
    cap: 100,
    lastRefillDate: new Date().toISOString(),
  };
  setWallet(wallet);
  return wallet;
}

// Transactions
export function getTransactions(): CreditTransaction[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
}

export function addTransaction(transaction: CreditTransaction): void {
  if (typeof window === 'undefined') return;
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

// Attempts
export function getAttempts(): Attempt[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
  return data ? JSON.parse(data) : [];
}

export function addAttempt(attempt: Attempt): void {
  if (typeof window === 'undefined') return;
  const attempts = getAttempts();
  attempts.push(attempt);
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
}

export function getAttemptById(attemptId: string): Attempt | null {
  const attempts = getAttempts();
  return attempts.find((a) => a.id === attemptId) || null;
}

// Progress
export function getProgress(): UserProgress | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  return data ? JSON.parse(data) : null;
}

export function setProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

export function initializeProgress(userId: string): UserProgress {
  const progress: UserProgress = {
    userId,
    xp: 0,
    streak: 0,
    lastActiveDate: new Date().toISOString(),
    completedLessons: [],
    dailyXpGoal: 10,
  };
  setProgress(progress);
  return progress;
}
