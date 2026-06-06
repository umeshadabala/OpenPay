import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { webhooks, merchantProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 });
    }

    const profile = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.userId, session.user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 });
    }

    // Generate or update webhook secret
    const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');

    const existingWebhook = await db.query.webhooks.findFirst({
      where: eq(webhooks.merchantProfileId, profile.id),
    });

    let config = null;

    if (existingWebhook) {
      const [updated] = await db
        .update(webhooks)
        .set({
          url,
          secret,
          updatedAt: new Date(),
        })
        .where(eq(webhooks.id, existingWebhook.id))
        .returning();
      config = updated;
    } else {
      const [created] = await db
        .insert(webhooks)
        .values({
          merchantProfileId: profile.id,
          url,
          secret,
        })
        .returning();
      config = created;
    }

    return NextResponse.json({ success: true, webhook: config });
  } catch (error: any) {
    console.error('Save webhook config failed:', error);
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
      return NextResponse.json({ webhook: null });
    }

    const config = await db.query.webhooks.findFirst({
      where: eq(webhooks.merchantProfileId, profile.id),
    });

    return NextResponse.json({ success: true, webhook: config });
  } catch (error: any) {
    console.error('Get webhook config failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.userId, session.user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 });
    }

    await db.delete(webhooks).where(eq(webhooks.merchantProfileId, profile.id));

    return NextResponse.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error: any) {
    console.error('Delete webhook failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
