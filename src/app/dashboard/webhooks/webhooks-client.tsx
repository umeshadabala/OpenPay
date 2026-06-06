'use client';

import React, { useState } from 'react';
import { Webhook, Key, Check, Copy, Save, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';

interface WebhooksClientProps {
  initialWebhook: {
    url: string;
    secret: string;
  } | null;
}

export default function WebhooksClient({ initialWebhook }: WebhooksClientProps) {
  const [url, setUrl] = useState(initialWebhook?.url || '');
  const [secret, setSecret] = useState(initialWebhook?.secret || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // UI helpers
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const handleCopy = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !url.startsWith('http')) {
      setError('Please enter a valid HTTP/HTTPS URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to configure webhook');
      }

      setSecret(data.webhook.secret);
      setSuccess('Webhook configuration saved successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to disable webhooks? You will stop receiving payment.received events.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/webhooks', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to disable webhook');
      }

      setUrl('');
      setSecret('');
      setSuccess('Webhook integration disabled successfully.');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Configuration Form */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Webhook size={18} className="text-cyan-400" />
            Config Outbound Webhook
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

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Webhook Target URL
              </label>
              <input
                type="url"
                placeholder="https://your-api.com/webhooks/openpay"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-805 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-cyan-500"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                OpenPay sends POST payloads to this URL whenever a UPI payment SMS is successfully parsed.
              </span>
            </div>

            {secret && (
              <div className="space-y-2">
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  Signing Secret
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between bg-slate-950 border border-slate-805 rounded-xl px-4 py-3 font-mono text-sm text-slate-350">
                    <span>{showSecret ? secret : '••••••••••••••••••••••••••••••••••••'}</span>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-3 bg-slate-950 border border-slate-805 hover:bg-slate-900 text-slate-450 hover:text-white rounded-xl transition-all"
                    title="Copy Secret"
                  >
                    {copied ? <Check size={16} className="text-emerald-450" /> : <Copy size={16} />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Verify the signature in your API using HMAC-SHA256 of the raw body signed with this secret.
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-slate-900">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all text-xs"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Configuration
              </button>
              
              {initialWebhook && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-red-500/10 border border-slate-805 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all text-xs"
                >
                  <Trash2 size={14} />
                  Disable Webhook
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Integration Guide */}
      <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 backdrop-blur-md space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Key size={18} className="text-cyan-400" />
          Signature Verification
        </h3>
        <p className="text-xs text-slate-450 leading-relaxed">
          OpenPay includes an HMAC signature in the `X-OpenPay-Signature` header. 
          Use this snippet to verify requests on your backend:
        </p>

        <pre className="text-[10px] bg-slate-950 border border-slate-900 rounded-xl p-4 overflow-x-auto text-cyan-300 font-mono leading-relaxed">
{`const crypto = require('crypto');

// Middleware / route handler
function verifyOpenPaySignature(req, res) {
  const signature = req.headers['x-openpay-signature'];
  const secret = process.env.OPENPAY_WEBHOOK_SECRET;
  
  // Calculate signature on raw body buffer
  const computed = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
    
  if (signature !== computed) {
    return res.status(401).send('Invalid Signature');
  }
  
  // Signature is valid. Process event:
  const { event, merchantCode, amount, utr, sender } = req.body;
  if (event === 'payment.received') {
    // Verify and reconcile payment locally in your database!
  }
}`}
        </pre>
      </div>
    </div>
  );
}
