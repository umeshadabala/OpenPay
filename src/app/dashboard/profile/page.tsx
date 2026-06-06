import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { merchantProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ProfileClient from './profile-client';
import { User } from 'lucide-react';

export const revalidate = 0; // Disable cache for profile page

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const profile = await db.query.merchantProfiles.findFirst({
    where: eq(merchantProfiles.userId, session.user.id),
  });

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="text-cyan-400" />
          Merchant Profile Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure your UPI credentials and manage developer credentials.</p>
      </div>

      <ProfileClient
        profile={{
          merchantName: profile.merchantName,
          upiId: profile.upiId,
          merchantCode: profile.merchantCode,
          email: profile.email,
        }}
      />
    </div>
  );
}
