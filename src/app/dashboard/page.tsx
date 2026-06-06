import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import {
  merchantProfiles,
  devices,
  aiDecisions,
  transactions,
  webhooks
} from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import DashboardClient from './dashboard-client';

export const revalidate = 0; // Live data reload

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  // Find or create profile (with a 6-digit pairing code)
  let profile = await db.query.merchantProfiles.findFirst({
    where: eq(merchantProfiles.userId, session.user.id),
  });

  if (!profile) {
    const merchantCode = Math.floor(100000 + Math.random() * 900000).toString();
    const [newProfile] = await db
      .insert(merchantProfiles)
      .values({
        userId: session.user.id,
        merchantName: session.user.name || 'My Shop',
        email: session.user.email || 'merchant@example.com',
        upiId: session.user.email?.split('@')[0] + '@upi',
        merchantCode,
      })
      .returning();
    profile = newProfile;
  }

  // Calculate Metrics
  const txCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(eq(transactions.merchantProfileId, profile.id));
  const totalTransactions = Number(txCountResult[0]?.count || 0);

  const parsedTxResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(and(eq(transactions.merchantProfileId, profile.id), eq(transactions.status, 'parsed')));
  const successfulReconciled = Number(parsedTxResult[0]?.count || 0);

  const devicesCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(devices)
    .where(eq(devices.merchantProfileId, profile.id));
  const connectedDevices = Number(devicesCountResult[0]?.count || 0);

  // Fetch recent AI parsed transactions
  const recentTransactions = await db
    .select({
      id: transactions.id,
      rawSms: transactions.rawSms,
      amount: transactions.amount,
      utr: transactions.utr,
      sender: transactions.sender,
      timestamp: transactions.timestamp,
      status: transactions.status,
      isCredit: aiDecisions.isCredit,
      confidence: aiDecisions.confidence,
      reasoning: aiDecisions.reasoning,
    })
    .from(transactions)
    .innerJoin(aiDecisions, eq(transactions.id, aiDecisions.transactionId))
    .where(eq(transactions.merchantProfileId, profile.id))
    .orderBy(desc(transactions.createdAt))
    .limit(10);

  // Get active webhook config
  const webhookConfig = await db.query.webhooks.findFirst({
    where: eq(webhooks.merchantProfileId, profile.id),
  });

  const serializedTransactions = recentTransactions.map(tx => ({
    id: tx.id,
    rawSms: tx.rawSms,
    amount: tx.amount,
    utr: tx.utr,
    sender: tx.sender,
    timestamp: tx.timestamp.toISOString(),
    status: tx.status,
    isCredit: tx.isCredit,
    confidence: typeof tx.confidence === 'string' ? parseFloat(tx.confidence) : Number(tx.confidence),
    reasoning: Array.isArray(tx.reasoning) ? (tx.reasoning as string[]) : [],
  }));

  return (
    <DashboardClient
      profile={{
        id: profile.id,
        merchantName: profile.merchantName,
        upiId: profile.upiId,
        merchantCode: profile.merchantCode,
        email: profile.email
      }}
      initialStats={{
        totalTransactions,
        successfulReconciled,
        connectedDevices
      }}
      initialTransactions={serializedTransactions}
      webhookUrl={webhookConfig?.url || null}
      webhookSecret={webhookConfig?.secret || null}
    />
  );
}
