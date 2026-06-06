import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { merchantProfiles, transactions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { History, Smartphone, Cpu, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

export const revalidate = 0; // Disable cache for transaction logs

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const profile = await db.query.merchantProfiles.findFirst({
    where: eq(merchantProfiles.userId, session.user.id),
  });

  if (!profile) return null;

  // Fetch transactions with related devices and AI decisions
  const txList = await db.query.transactions.findMany({
    where: eq(transactions.merchantProfileId, profile.id),
    orderBy: [desc(transactions.createdAt)],
    with: {
      device: true,
      aiDecisions: true,
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'parsed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            <CheckCircle2 size={10} />
            PARSED
          </span>
        );
      case 'ignored':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 font-mono">
            <AlertCircle size={10} />
            IGNORED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="text-cyan-400" />
          SMS Transaction Logs
        </h1>
        <p className="text-slate-450 text-xs mt-1">Audit trail of raw bank notifications captured by devices and parsed by AI.</p>
      </div>

      <div className="space-y-4">
        {txList.length === 0 ? (
          <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-12 text-center">
            <p className="text-slate-500 text-xs font-mono">openpay@transactions:~$ no_logs_found</p>
            <p className="text-slate-450 text-xs mt-2">Waiting for paired Android Companion devices to sync SMS alerts...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {txList.map((tx) => (
              <details
                key={tx.id}
                className="group bg-slate-900/10 hover:bg-slate-900/20 border border-slate-900 hover:border-slate-850 rounded-2xl overflow-hidden transition-all duration-200"
              >
                {/* Header (Summary) */}
                <summary className="list-none flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 cursor-pointer outline-none select-none font-mono text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-extrabold text-white text-sm">₹{tx.amount ? parseFloat(tx.amount).toFixed(2) : '0.00'}</span>
                    {getStatusBadge(tx.status)}
                    <span className="text-slate-500">UTR: {tx.utr || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="flex items-center gap-4 text-slate-500">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <Smartphone size={12} className="text-cyan-500" />
                        {tx.device?.deviceName || 'Web Simulator'}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(tx.timestamp).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-slate-505 group-open:rotate-180 transition-transform duration-200" />
                  </div>
                </summary>

                {/* Body (Expanded details) */}
                <div className="px-5 pb-5 border-t border-slate-900 pt-4 bg-slate-950/20 space-y-4 font-mono text-xs">
                  {/* SMS content */}
                  <div>
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 font-sans">
                      Raw SMS Notification
                    </span>
                    <p className="bg-slate-950 border border-slate-900 rounded-xl p-4 text-slate-350 italic leading-relaxed">
                      &quot;{tx.rawSms}&quot;
                    </p>
                  </div>

                  {/* AI Reconciliation Logs */}
                  {tx.aiDecisions && tx.aiDecisions.length > 0 ? (
                    tx.aiDecisions.map((decision) => (
                      <div
                        key={decision.id}
                        className="bg-slate-900/10 border border-slate-900 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <span className="inline-flex items-center gap-1 text-slate-450 font-semibold font-sans">
                            <Cpu size={14} className="text-cyan-400 animate-pulse" />
                            AI Parser Extraction Logs
                          </span>
                          <span className="text-slate-500">
                            Confidence: {Math.round(parseFloat(decision.confidence) * 100)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-400">
                          <div>
                            <span className="text-slate-500">Is Credit Alert:</span>{' '}
                            <span className={decision.isCredit ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                              {decision.isCredit ? 'YES' : 'NO'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Parsed Amount:</span>{' '}
                            <span className="text-white font-bold">₹{decision.parsedAmount ? parseFloat(decision.parsedAmount).toFixed(2) : '0.00'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Parsed UTR:</span>{' '}
                            <span className="text-white font-bold">{decision.parsedUtr || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-900 pt-3">
                          <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 font-sans">
                            Parsing Steps
                          </span>
                          <ul className="space-y-1 list-disc pl-4 text-slate-450">
                            {(decision.reasoning as string[]).map((reason, idx) => (
                              <li key={idx}>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-900/10 border border-slate-905 text-slate-500 text-xs rounded-xl">
                      Reconciliation parser did not generate matching logs for this sync event.
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
