import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { merchantProfiles, devices } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

function generateMerchantCode(): string {
  // Generates e.g. 582914
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.userId, session.user.id),
    });

    // Auto-create default profile on first load
    if (!profile) {
      const merchantCode = generateMerchantCode();
      const [newProfile] = await db
        .insert(merchantProfiles)
        .values({
          userId: session.user.id,
          merchantName: session.user.name || 'My Shop',
          email: session.user.email || 'merchant@example.com',
          upiId: 'merchant@upi',
          merchantCode,
        })
        .returning();
      
      profile = newProfile;
    }

    // Get devices list
    const devicesList = await db.query.devices.findMany({
      where: eq(devices.merchantProfileId, profile.id),
    });

    return NextResponse.json({
      success: true,
      profile,
      devicesCount: devicesList.length,
    });
  } catch (error: any) {
    console.error('Get profile failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { merchantName, upiId } = body;

    if (!merchantName || !upiId) {
      return NextResponse.json({ error: 'Missing merchantName or upiId' }, { status: 400 });
    }

    const profile = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.userId, session.user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 });
    }

    const [updated] = await db
      .update(merchantProfiles)
      .set({
        merchantName,
        upiId,
        updatedAt: new Date(),
      })
      .where(eq(merchantProfiles.id, profile.id))
      .returning();

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    console.error('Update profile failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
