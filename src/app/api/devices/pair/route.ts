import { NextResponse } from 'next/server';
import { db } from '@/db';
import { devices, merchantProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { merchantCode, deviceId, deviceName } = body;

    if (!deviceId || !deviceName || !merchantCode) {
      return NextResponse.json(
        { error: 'Missing required parameters: merchantCode, deviceId, deviceName' },
        { status: 400 }
      );
    }

    // Find the merchant profile matching the 6-digit code
    const profile = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.merchantCode, merchantCode.trim().toUpperCase()),
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Invalid pairing code. Merchant not found.' },
        { status: 404 }
      );
    }

    // Register or update device association
    const existingDevice = await db.query.devices.findFirst({
      where: eq(devices.deviceId, deviceId),
    });

    if (existingDevice) {
      await db
        .update(devices)
        .set({
          merchantProfileId: profile.id,
          deviceName,
        })
        .where(eq(devices.id, existingDevice.id));
    } else {
      await db.insert(devices).values({
        merchantProfileId: profile.id,
        deviceId,
        deviceName,
      });
    }

    return NextResponse.json({
      success: true,
      merchantId: profile.id,
      merchantName: profile.merchantName,
    });
  } catch (error: any) {
    console.error('Device pairing failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
