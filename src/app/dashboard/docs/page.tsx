'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Smartphone, 
  ShieldCheck, 
  Code, 
  HelpCircle, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Server,
  Layers,
  Copy,
  Check
} from 'lucide-react';

type TabType = 'quickstart' | 'android' | 'api' | 'reconciliation';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('quickstart');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const tabs = [
    { id: 'quickstart', name: 'Getting Started', icon: BookOpen },
    { id: 'android', name: 'Android Agent', icon: Smartphone },
    { id: 'api', name: 'API & Webhooks', icon: Terminal },
    { id: 'reconciliation', name: 'Attribution Math', icon: Layers },
  ] as const;

  const nodeCode = `import crypto from 'crypto';

export async function POST(req: Request) {
  const signature = req.headers.get('x-openpay-signature');
  const rawBody = await req.text(); // Must read as raw text for HMAC validation

  const secret = process.env.OPENPAY_WEBHOOK_SECRET; //whsec_...
  if (!secret) return new Response('Missing secret', { status: 500 });

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature || '', 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );

  if (!isValid) return new Response('Invalid signature', { status: 401 });

  const payload = JSON.parse(rawBody);
  if (payload.event === 'payment.received') {
    const { amount, utr } = payload;
    // Reconcile in ledger: match amount & update order status to successful
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}`;

  const pythonCode = `import hmac
import hashlib
import json
from fastapi import Request, Header, HTTPException

@app.post("/api/webhooks/openpay")
async def openpay_webhook(request: Request, x_openpay_signature: str = Header(None)):
    raw_body = await request.body()
    secret = "whsec_your_secret_here".encode('utf-8')
    
    expected_sig = hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(x_openpay_signature, expected_sig):
        raise HTTPException(status_code=401, detail="Signature mismatch")
        
    payload = json.loads(raw_body)
    # Process payment...
    return {"success": True}`;

  return (
    <div className="max-w-6xl pb-24 text-neutral-300 font-sans">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-900 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              System Docs
            </span>
            <span className="text-xs text-neutral-500 font-mono">v1.0.0</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1.5 tracking-tight">OpenPay Developer Portal</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Technical integration specifications for Android background listener nodes and webhook attribution.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-900 overflow-x-auto gap-2 mb-8 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-3.5 border-b-2 text-sm font-semibold tracking-tight whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'border-indigo-500 text-white bg-indigo-500/[0.02]'
                  : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/[0.1]'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-neutral-500'} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="space-y-12">
        {/* ==================== QUICKSTART ==================== */}
        {activeTab === 'quickstart' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-lg font-bold text-white mb-2">Integration Overview</h2>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-3xl">
                OpenPay uses real-time SMS capture from a physical mobile device to reconcile UPI payments. It replaces costly merchant API gateways by attributions of standard push notifications.
              </p>
            </div>

            {/* Steps Container */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-neutral-900/30 border border-neutral-900 p-5 rounded-2xl">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Register Payee Identity</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Set up your business identifiers in the <a href="/dashboard/profile" className="text-indigo-400 hover:underline">Profile</a> tab. Provide your Merchant Name and Payee VPA (UPI ID). This determines where users send transactions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-neutral-900/30 border border-neutral-900 p-5 rounded-2xl">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Install Companion Gateway App</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Compile the companion app and install it on the Android phone containing the SIM card registered with your bank account. Use the 6-digit <span className="text-white font-semibold">Connection Code</span> visible on your dashboard to pair the terminal.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-neutral-900/30 border border-neutral-900 p-5 rounded-2xl">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Subscribe to Webhooks</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Configure your destination webhook endpoint in the <a href="/dashboard/webhooks" className="text-indigo-400 hover:underline">Webhooks</a> tab. Copy the generated signing secret to verify incoming HTTP calls.
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-indigo-400" />
                Connection Readiness Verification
              </h3>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Verify the phone has network service and receives bank SMS alerts instantly.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Confirm that the webhook endpoint responds to POST calls within 10 seconds.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Keep the Android foreground notification active to prevent system receiver sleep.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ==================== ANDROID AGENT ==================== */}
        {activeTab === 'android' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Background SMS Listener Pipeline</h2>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-3xl">
                The OpenPay companion app operates as a hardware proxy on top of standard Android runtime models. It watches for incoming transactional SMS patterns and pipes them to the backend API.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 space-y-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">Service Hook</span>
                <h3 className="text-sm font-bold text-white">AndroidManifest.xml Declarations</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  To register for global system alerts, the app requests the following low-level permissions:
                </p>
                <pre className="bg-neutral-950 p-3.5 border border-neutral-900 rounded-lg text-[11px] font-mono text-neutral-400 overflow-x-auto">
{`<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.INTERNET" />`}
                </pre>
              </div>

              <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-mono">Runtime Alert</span>
                <h3 className="text-sm font-bold text-white">Doze Mode & Standby Exemptions</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Modern Android operating systems enforce aggressive resource savings. If the screen is off for extended periods, standard network queues are frozen.
                </p>
                <div className="text-xs text-neutral-450 space-y-1.5 mt-1 bg-neutral-950/40 p-3 rounded-lg border border-neutral-900">
                  <div className="font-semibold text-white">Verification Steps:</div>
                  <div>1. Open Android Settings → Apps → OpenPay Companion.</div>
                  <div>2. Select Battery / Battery Saver.</div>
                  <div>3. Change preference to <strong>Unrestricted / No Restrictions</strong>.</div>
                </div>
              </div>
            </div>

            {/* Filter patterns */}
            <div className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-2">Ingestion Filter Headers</h3>
              <p className="text-xs text-neutral-400 mb-4">
                To guarantee user privacy, the agent local parser ignores personal or generic texts. It only registers messages starting with standard Indian transactional sender patterns:
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {['AX-SBIUPI', 'AD-HDFCBK', 'BP-ICICIB', 'BZ-AXISBK', 'PAYTM', 'PHONEPE'].map((item) => (
                  <span key={item} className="bg-neutral-950 px-3 py-1.5 border border-neutral-900 rounded-lg font-mono text-indigo-400">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== API & WEBHOOKS ==================== */}
        {activeTab === 'api' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">API Reference & Webhook Contract</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Connect your core servers using the standard JSON payload and secure signature model.
              </p>
            </div>

            {/* Endpoints */}
            <div className="space-y-4">
              {/* Endpoint 1 */}
              <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 font-mono">POST</span>
                  <code className="text-sm font-bold text-white">/api/transactions</code>
                </div>
                <p className="text-xs text-neutral-400">
                  Internal upload endpoint used by paired companion devices to ingest raw SMS alerts.
                </p>
              </div>

              {/* Endpoint 2 */}
              <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/20 font-mono">WEBHOOK</span>
                  <code className="text-sm font-bold text-white">payment.received</code>
                </div>
                <p className="text-xs text-neutral-400">
                  The payload fired to your configured destination URL when a verified credit transaction is attibuted by the AI engine.
                </p>
                
                {/* JSON Payload */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs text-neutral-500 font-mono">
                    <span>Webhook Payload Format</span>
                    <button 
                      onClick={() => copyToClipboard(
                        JSON.stringify({
                          event: "payment.received",
                          merchantCode: "145451",
                          amount: "99.96",
                          utr: "384918274019",
                          sender: "HDFCBK",
                          timestamp: "2026-06-06T12:00:00.000Z"
                        }, null, 2), "payload"
                      )}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {copiedText === 'payload' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedText === 'payload' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="bg-neutral-950 p-4 border border-neutral-900 rounded-xl text-xs font-mono text-indigo-300 overflow-x-auto">
{`{
  "event": "payment.received",
  "merchantCode": "145451",
  "amount": "99.96",
  "utr": "384918274019",
  "sender": "HDFCBK",
  "rawSms": "Alert: Your A/c has been Credited with Rs. 99.96 via UPI Ref 384918274019...",
  "timestamp": "2026-06-06T12:00:00.000Z",
  "reasoning": [
    "Credit keyword detected",
    "Amount 99.96 extracted from string",
    "UTR 384918274019 matches standard patterns"
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Signature Validation */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                HMAC-SHA256 Signature Verification
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                OpenPay signs every outbound POST payload. The SHA256 hex digest is passed in the header <code className="bg-neutral-950 text-indigo-400 px-1 py-0.5 rounded text-[11px]">x-openpay-signature</code>. Re-hash the raw body on your server using your webhook secret key to prevent forgery.
              </p>

              {/* Code tabs */}
              <div className="bg-neutral-900/10 border border-neutral-900 rounded-2xl overflow-hidden">
                <div className="bg-neutral-950 px-5 py-3 border-b border-neutral-900 flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-white">Node.js Verification Hook</span>
                  <button 
                    onClick={() => copyToClipboard(nodeCode, "node")}
                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors"
                  >
                    {copiedText === 'node' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedText === 'node' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-neutral-950 p-5 text-xs font-mono text-neutral-400 overflow-x-auto leading-relaxed">
                  {nodeCode}
                </pre>
              </div>

              <div className="bg-neutral-900/10 border border-neutral-900 rounded-2xl overflow-hidden">
                <div className="bg-neutral-950 px-5 py-3 border-b border-neutral-900 flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-white">Python FastAPI Hook</span>
                  <button 
                    onClick={() => copyToClipboard(pythonCode, "python")}
                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors"
                  >
                    {copiedText === 'python' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedText === 'python' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-neutral-950 p-5 text-xs font-mono text-neutral-400 overflow-x-auto leading-relaxed">
                  {pythonCode}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ==================== RECONCILIATION ==================== */}
        {activeTab === 'reconciliation' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Reconciliation & Micro-Discount Math</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                UPI statement alerts do not carry custom merchant data like transaction/order IDs. To guarantee instant automatic routing without manual verification, you must implement the Micro-Discount pattern.
              </p>
            </div>

            {/* Warning callout */}
            <div className="bg-amber-950/20 border border-amber-900/35 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                <AlertTriangle size={18} />
                Strict Bookkeeping & Ledger Rules
              </div>
              <ul className="list-disc pl-5 text-xs text-neutral-400 space-y-2">
                <li>
                  <strong>Fixed Bounds:</strong> Keep your subtraction offset bounded strictly between <code className="text-white">₹0.01</code> and <code className="text-white">₹0.10</code>. Do not scale offsets beyond these limits without explicit mapping records, or you will create arbitrary variations in pricing.
                </li>
                <li>
                  <strong>Double-Entry Integrity:</strong> Never adjust values silently. Your database ledger should show:
                  <div className="bg-neutral-950 p-3 border border-neutral-900 rounded-lg mt-1 font-mono text-neutral-400 grid grid-cols-3 gap-2">
                    <div>Base Price: ₹100.00</div>
                    <div>Applied Discount: ₹0.06</div>
                    <div className="text-indigo-400">Net Expected: ₹99.94</div>
                  </div>
                </li>
                <li>
                  <strong>Numeric Precision:</strong> Do not use floats (`double` / `real`) inside databases or backend logic. They suffer from rounding errors. Use exact scales like <code className="text-white">NUMERIC(10,2)</code> or save prices as integers representation of cents/paise.
                </li>
              </ul>
            </div>

            {/* Reconciliation Process Flow */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white">Reconciliation Lifecycle</h3>
              
              <div className="relative border-l border-neutral-900 pl-6 space-y-8">
                {/* Point 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-neutral-950 border border-neutral-900 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 1: Check-out Request</h4>
                  <p className="text-xs text-neutral-450 mt-1 max-w-2xl">
                    When a checkout session is initiated, calculate a random subtraction offset between 1 and 10 paise:
                    <br />
                    <code className="text-indigo-400 font-mono bg-neutral-950 border border-neutral-900 px-1 py-0.5 rounded text-[10px] mt-1 inline-block">
                      uniqueCheckoutPrice = basePrice - (Math.floor(Math.random() * 10) + 1) / 100
                    </code>
                  </p>
                </div>

                {/* Point 2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-neutral-950 border border-neutral-900 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 2: Reserve Allocation & Lease</h4>
                  <p className="text-xs text-neutral-450 mt-1 max-w-2xl">
                    Save the order in your database with the status <code className="text-neutral-300 bg-neutral-950 px-1 rounded text-[10px]">pending</code> and the exact <code className="text-neutral-300 bg-neutral-950 px-1 rounded text-[10px]">uniqueCheckoutPrice</code>. Set a strict expiration window of 15 minutes. This ensures that if the customer abandons checkout, that specific micro-amount is unlocked and can be safely leased for another user.
                  </p>
                </div>

                {/* Point 3 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-neutral-950 border border-neutral-900 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Step 3: Webhook Attribution Match</h4>
                  <p className="text-xs text-neutral-450 mt-1 max-w-2xl">
                    The user submits payment via UPI. The bank SMS is forwarded to OpenPay, triggering your webhook containing the exact amount paid (e.g. ₹99.94). Your server checks for a pending order matching that exact amount. If found, mark it as successful and register the transaction UTR.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
