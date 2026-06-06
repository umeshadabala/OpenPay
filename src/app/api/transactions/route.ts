import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import {
  transactions,
  devices,
  merchantProfiles,
  aiDecisions,
  webhooks,
} from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { parseTransactionAgent } from '@/lib/agent';
import { sendWebhook } from '@/lib/webhook-sender';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { merchantCode, smsText, timestamp, deviceId, deviceName, senderHeader } = body;

    if (!smsText) {
      return NextResponse.json({ error: 'Missing smsText' }, { status: 400 });
    }

    let merchantId: string | null = null;
    let merchantCodeVal: string | null = null;
    let deviceDbId: string | null = null;

    // 1. Authenticate using merchantCode uploaded by Android Companion App
    if (merchantCode) {
      const profile = await db.query.merchantProfiles.findFirst({
        where: eq(merchantProfiles.merchantCode, merchantCode.trim().toUpperCase()),
      });

      if (!profile) {
        return NextResponse.json({ error: 'Unauthorized: Invalid merchant code' }, { status: 401 });
      }

      merchantId = profile.id;
      merchantCodeVal = profile.merchantCode;

      // Log/register device dynamically during sync/upload
      if (deviceId && deviceName) {
        const existingDevice = await db.query.devices.findFirst({
          where: eq(devices.deviceId, deviceId),
        });

        if (existingDevice) {
          await db
            .update(devices)
            .set({ merchantProfileId: profile.id, deviceName })
            .where(eq(devices.id, existingDevice.id));
          deviceDbId = existingDevice.id;
        } else {
          const [newDevice] = await db
            .insert(devices)
            .values({
              merchantProfileId: profile.id,
              deviceId,
              deviceName,
            })
            .returning();
          deviceDbId = newDevice.id;
        }
      }
    } else {
      // 2. Fallback to session credentials (for web-based dashboard testing/auditing)
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const profile = await db.query.merchantProfiles.findFirst({
          where: eq(merchantProfiles.userId, session.user.id),
        });

        if (profile) {
          merchantId = profile.id;
          merchantCodeVal = profile.merchantCode;
        }
      }
    }

    if (!merchantId || !merchantCodeVal) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing merchantCode or session context' },
        { status: 401 }
      );
    }

    // Call Payment Notification Parsing Agent (AI or Fallback)
    const parsingResult = await parseTransactionAgent(smsText, senderHeader || 'BANK_ALERT');

    const txTime = timestamp ? new Date(timestamp) : new Date();

    // Insert transaction log
    const [transaction] = await db
      .insert(transactions)
      .values({
        deviceId: deviceDbId,
        merchantProfileId: merchantId,
        utr: parsingResult.parsedUtr,
        amount: parsingResult.parsedAmount,
        rawSms: smsText,
        sender: parsingResult.parsedSender || senderHeader || 'BANK_ALERT',
        timestamp: txTime,
        status: parsingResult.isCredit && parsingResult.confidence >= 0.8 ? 'parsed' : 'ignored',
      })
      .returning();

    // Save AI decision
    await db.insert(aiDecisions).values({
      transactionId: transaction.id,
      isCredit: parsingResult.isCredit,
      parsedAmount: parsingResult.parsedAmount,
      parsedUtr: parsingResult.parsedUtr,
      parsedSender: parsingResult.parsedSender,
      confidence: parsingResult.confidence.toFixed(2),
      reasoning: parsingResult.reasoning,
    });

    // Fire webhook if it's a verified credit payment
    if (parsingResult.isCredit && parsingResult.confidence >= 0.8 && parsingResult.parsedAmount) {
      const webhookConfig = await db.query.webhooks.findFirst({
        where: eq(webhooks.merchantProfileId, merchantId),
      });

      if (webhookConfig) {
        // Construct standard webhook payload
        const payload = {
          event: 'payment.received' as const,
          merchantCode: merchantCodeVal,
          amount: parsingResult.parsedAmount,
          utr: parsingResult.parsedUtr,
          sender: parsingResult.parsedSender || 'UNKNOWN',
          rawSms: smsText,
          timestamp: txTime.toISOString(),
          reasoning: parsingResult.reasoning,
        };

        // Sign and POST webhook async
        sendWebhook(webhookConfig.url, webhookConfig.secret, payload).catch(err =>
          console.error('Failed to trigger merchant webhook:', err)
        );
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      parsing: parsingResult,
    });
  } catch (error: any) {
    console.error('Transaction upload ingestion failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.userId, session.user.id),
    });

    if (!profile) {
      return NextResponse.json({ transactions: [] });
    }

    const list = await db.query.transactions.findMany({
      where: eq(transactions.merchantProfileId, profile.id),
      orderBy: [desc(transactions.createdAt)],
      with: {
        device: true,
        aiDecisions: true,
      },
    });

    return NextResponse.json({ transactions: list });
  } catch (error: any) {
    console.error('Get transactions logs failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
