import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { devices, merchantProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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
      return NextResponse.json({ devices: [] });
    }

    const list = await db.query.devices.findMany({
      where: eq(devices.merchantProfileId, profile.id),
    });

    return NextResponse.json({ success: true, devices: list });
  } catch (error: any) {
    console.error('Get devices failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('id');

    if (!deviceId) {
      return NextResponse.json({ error: 'Missing device ID' }, { status: 400 });
    }

    const profile = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.userId, session.user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 });
    }

    await db
      .delete(devices)
      .where(
        and(
          eq(devices.id, deviceId),
          eq(devices.merchantProfileId, profile.id)
        )
      );

    return NextResponse.json({ success: true, message: 'Device unpaired successfully' });
  } catch (error: any) {
    console.error('Unpair device failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
