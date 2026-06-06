import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { merchantProfiles, devices } from '@/db/schema';
import { eq } from 'drizzle-orm';
import DeviceList from './device-list';
import { Smartphone, HelpCircle } from 'lucide-react';

export const revalidate = 0; // Disable cache for devices page

export default async function DevicesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const profile = await db.query.merchantProfiles.findFirst({
    where: eq(merchantProfiles.userId, session.user.id),
  });

  if (!profile) return null;

  // Query already paired devices
  const pairedDevices = await db.query.devices.findMany({
    where: eq(devices.merchantProfileId, profile.id),
  });

  // Serialise dates to ISO string to avoid serialisation issues in Client Components
  const serializedDevices = pairedDevices.map(d => ({
    id: d.id,
    deviceId: d.deviceId,
    deviceName: d.deviceName,
    status: 'paired', // default status
    lastSyncAt: null, // simplified devices structure
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Smartphone className="text-cyan-400" />
          Paired Devices
        </h1>
        <p className="text-slate-450 text-xs mt-1">Manage linked devices running the Android companion alert sync listener.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Columns: Paired Devices list */}
        <div className="xl:col-span-2 space-y-6">
          <DeviceList initialDevices={serializedDevices} />
        </div>

        {/* Right Column: Pairing Info */}
        <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 space-y-6 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
            <HelpCircle size={16} className="text-cyan-400" />
            Linking Instructions
          </h3>
          
          <div className="space-y-3 text-slate-400 leading-relaxed">
            <p>1. Open the OpenPay Companion App on your Android device.</p>
            <p>2. Go to settings/pairing view in the app.</p>
            <p>3. Input this 6-digit merchant pairing code:</p>
          </div>

          {/* Pair Code Display */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 font-bold text-white text-lg tracking-widest text-center">
            {profile.merchantCode}
          </div>

          <div className="space-y-2 border-t border-slate-905 pt-4 text-[10px] text-slate-500 leading-relaxed font-sans">
            <p>• The code is unique to your developer console account.</p>
            <p>• Linked devices will automatically sync banking notifications to your event log stream.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
