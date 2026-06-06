'use client';

import React, { useState } from 'react';
import { User, Shield, Key, Copy, Check, Save, Loader2 } from 'lucide-react';

interface ProfileClientProps {
  profile: {
    merchantName: string;
    upiId: string;
    merchantCode: string;
    email: string;
  };
}

export default function ProfileClient({ profile }: ProfileClientProps) {
  const [merchantName, setMerchantName] = useState(profile.merchantName);
  const [upiId, setUpiId] = useState(profile.upiId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.merchantCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName || !upiId) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ merchantName, upiId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Merchant profile settings saved successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Settings Form */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <User size={18} className="text-cyan-400" />
            Merchant Profile Details
          </h3>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-xs rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl p-3 mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Merchant Name */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Merchant Business Name
              </label>
              <input
                type="text"
                placeholder="My Business"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-805 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-cyan-500 font-semibold"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                The name displayed on linked devices and in forwarded webhooks.
              </span>
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                UPI ID (Virtual Payment Address)
              </label>
              <input
                type="text"
                placeholder="merchant@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-805 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-cyan-500 font-mono"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                The target UPI ID where customer funds will be credited (e.g. business@okaxis, shop@paytm).
              </span>
            </div>

            {/* Contact Email (Read-only) */}
            <div>
              <label className="block text-slate-450 text-xs font-semibold uppercase tracking-wider mb-2">
                Contact Email Address (Read-only)
              </label>
              <input
                type="email"
                value={profile.email}
                className="w-full bg-slate-950/40 border border-slate-900 rounded-xl py-3 px-4 text-slate-500 text-sm cursor-not-allowed outline-none"
                disabled
              />
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all text-xs"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Connection Info Panel */}
      <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 backdrop-blur-md space-y-6 font-mono text-xs text-slate-400">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
          <Shield size={18} className="text-cyan-400" />
          Device Sync Code
        </h3>
        
        <p className="leading-relaxed">
          Input this 6-digit merchant code in the Android Companion app to pair it and authenticate transaction uploads.
        </p>

        {/* Code Card */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Key size={14} className="text-slate-505" />
            <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-sans">
              Merchant Pairing Code
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-950 border border-slate-805 rounded-xl px-4 py-3 font-bold text-white text-lg tracking-widest text-center">
              {profile.merchantCode}
            </div>
            <button
              onClick={handleCopy}
              className="p-3 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-450 hover:text-white rounded-xl transition-all"
              title="Copy Code"
            >
              {copied ? <Check size={16} className="text-emerald-450" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-4 text-[10px] text-slate-500 space-y-2 font-sans">
          <p>• Used to link SMS syncing daemons to this dashboard.</p>
          <p>• Uniquely assigned per developer console profile.</p>
        </div>
      </div>
    </div>
  );
}
