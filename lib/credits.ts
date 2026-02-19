// Credit engine: daily refills, spending, transaction logging (DB-backed via Prisma)

import { prisma } from './prisma';

export const CREDIT_CONFIG = {
  STARTING_BALANCE: 50,
  CAP: 100,
  LESSON_COST: 5,
  DAILY_REFILL: 20,
  FIRST_LESSON_BONUS: 5,
} as const;

/**
 * Ensure a wallet exists for the given user
 */
export async function getOrCreateWallet(userId: string) {
  let wallet = await prisma.wallet.findUnique({ where: { userId } });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: CREDIT_CONFIG.STARTING_BALANCE,
        cap: CREDIT_CONFIG.CAP,
        lastRefillDate: new Date(),
      },
    });
  }

  return wallet;
}

function shouldApplyDailyRefill(lastRefillDate: Date): boolean {
  const lastRefill = new Date(lastRefillDate);
  const today = new Date();

  lastRefill.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return lastRefill.getTime() < today.getTime();
}

/**
 * Apply daily refill if needed for a user
 */
export async function applyDailyRefillForUser(userId: string) {
  const wallet = await getOrCreateWallet(userId);

  if (!shouldApplyDailyRefill(wallet.lastRefillDate)) {
    return { applied: false, newBalance: wallet.balance };
  }

  const newBalance = Math.min(
    wallet.balance + CREDIT_CONFIG.DAILY_REFILL,
    CREDIT_CONFIG.CAP,
  );

  const updated = await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: newBalance,
      lastRefillDate: new Date(),
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId,
      amount: CREDIT_CONFIG.DAILY_REFILL,
      type: 'REFILL',
      description: 'Daily credit refill',
    },
  });

  return { applied: true, newBalance: updated.balance };
}

/**
 * Get current wallet snapshot for a user
 */
export async function getWalletSnapshot(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  return {
    balance: wallet.balance,
    cap: wallet.cap,
    lastRefillDate: wallet.lastRefillDate,
  };
}

/**
 * Spend credits for a lesson attempt
 */
export async function spendCreditsForLessonForUser(userId: string, lessonId: string) {
  const wallet = await getOrCreateWallet(userId);

  if (wallet.balance < CREDIT_CONFIG.LESSON_COST) {
    return {
      success: false,
      newBalance: wallet.balance,
      message: 'Insufficient credits',
    };
  }

  const newBalance = wallet.balance - CREDIT_CONFIG.LESSON_COST;

  const updated = await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: newBalance,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId,
      amount: -CREDIT_CONFIG.LESSON_COST,
      type: 'SPENT',
      description: `Lesson attempt: ${lessonId}`,
      lessonId,
    },
  });

  return {
    success: true,
    newBalance: updated.balance,
  };
}

/**
 * Award bonus credits for first lesson of the day (simple implementation)
 */
export async function awardFirstLessonBonusForUser(userId: string) {
  const wallet = await getOrCreateWallet(userId);

  const newBalance = Math.min(
    wallet.balance + CREDIT_CONFIG.FIRST_LESSON_BONUS,
    CREDIT_CONFIG.CAP,
  );

  const updated = await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      balance: newBalance,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId,
      amount: CREDIT_CONFIG.FIRST_LESSON_BONUS,
      type: 'BONUS',
      description: 'First lesson of the day bonus',
    },
  });

  return {
    newBalance: updated.balance,
  };
}
