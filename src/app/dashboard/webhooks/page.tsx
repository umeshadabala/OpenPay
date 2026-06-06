import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { merchantProfiles, webhooks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import WebhooksClient from './webhooks-client';
import { Webhook } from 'lucide-react';

export const revalidate = 0; // Disable cache for webhooks page

export default async function WebhooksPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const profile = await db.query.merchantProfiles.findFirst({
    where: eq(merchantProfiles.userId, session.user.id),
  });

  if (!profile) return null;

  const config = await db.query.webhooks.findFirst({
    where: eq(webhooks.merchantProfileId, profile.id),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Webhook className="text-cyan-400" />
          Webhook Integrations
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure target URLs to receive instant HTTP payment notifications.</p>
      </div>

      <WebhooksClient
        initialWebhook={
          config
            ? {
                url: config.url,
                secret: config.secret,
              }
            : null
        }
      />
    </div>
  );
}
