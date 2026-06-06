import React from 'react';
import { BookOpen, Smartphone, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BookOpen className="text-indigo-400" />
          Integration Documentation
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Complete step-by-step guide to configure OpenPay, link devices, and verify payment webhooks in production.
        </p>
      </div>

      {/* The Architecture Flow */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How OpenPay Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
            <span className="text-xs text-indigo-400 font-extrabold uppercase">1. Trigger</span>
            <p className="text-sm font-bold text-white mt-1">UPI Payment</p>
            <p className="text-xs text-neutral-500 mt-1">User scans UPI QR and transfers money</p>
          </div>
          <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
            <span className="text-xs text-indigo-400 font-extrabold uppercase">2. Capture</span>
            <p className="text-sm font-bold text-white mt-1">SMS Received</p>
            <p className="text-xs text-neutral-500 mt-1">Merchant's phone receives bank credit alert</p>
          </div>
          <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
            <span className="text-xs text-indigo-400 font-extrabold uppercase">3. Sync & AI</span>
            <p className="text-sm font-bold text-white mt-1">OpenPay Ingestion</p>
            <p className="text-xs text-neutral-500 mt-1">App forwards SMS; AI extracts UTR & amount</p>
          </div>
          <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
            <span className="text-xs text-indigo-400 font-extrabold uppercase">4. Dispatch</span>
            <p className="text-sm font-bold text-white mt-1">Webhook Sent</p>
            <p className="text-xs text-neutral-500 mt-1">Outbound HTTP post updates consumer DB</p>
          </div>
        </div>
      </div>

      {/* Step by Step Guide */}
      <div className="space-y-6">
        {/* Step 1 */}
        <section className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">1</div>
            <h3 className="text-lg font-bold text-white">Configure Merchant Profile</h3>
          </div>
          <p className="text-sm text-neutral-400 pl-11">
            Before linking any device, configure your business identification so that payments can be correctly routed to you.
          </p>
          <ul className="list-disc pl-16 text-sm text-neutral-400 space-y-1">
            <li>Go to the <span className="text-indigo-400 font-semibold">Profile</span> tab on the left sidebar.</li>
            <li>Enter your <span className="text-white font-semibold">Merchant UPI ID (VPA)</span> (e.g., <code className="bg-neutral-900 px-1 py-0.5 rounded text-neutral-350 text-xs">shopname@okhdfcbank</code>) and Merchant Name.</li>
            <li>Note down your <span className="text-white font-semibold">6-digit connection code</span> shown in the Profile panel. This is your authentication key.</li>
          </ul>
        </section>

        {/* Step 2 */}
        <section className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">2</div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Install & Pair the Android App
              <Smartphone size={16} className="text-neutral-500" />
            </h3>
          </div>
          <p className="text-sm text-neutral-400 pl-11">
            The companion Android application acts as your physical hardware terminal, reading incoming notifications in the background.
          </p>
          <ul className="list-disc pl-16 text-sm text-neutral-400 space-y-1">
            <li>Build the Android companion app using the prompt provided in Google AI Studio or compile it locally.</li>
            <li>Install the APK on the Android device that holds the SIM card linked to your merchant bank account.</li>
            <li>Open the app, enter your <span className="text-white font-semibold">6-digit Connection Code</span>, and click <span className="text-indigo-400 font-semibold">Link Device</span>.</li>
            <li>Grant <span className="text-emerald-400 font-semibold">SMS permission</span> (RECEIVE_SMS) when prompted by the app so it can capture incoming credit messages.</li>
          </ul>
        </section>

        {/* Step 3 */}
        <section className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">3</div>
            <h3 className="text-lg font-bold text-white">Configure Outbound Webhook</h3>
          </div>
          <p className="text-sm text-neutral-400 pl-11">
            When a payment matches, OpenPay will notify your target consumer application (e.g. your credits shop) in real-time.
          </p>
          <ul className="list-disc pl-16 text-sm text-neutral-400 space-y-1">
            <li>Go to the <span className="text-indigo-400 font-semibold">Webhooks</span> page.</li>
            <li>Add the URL of your app's webhook route (e.g., <code className="bg-neutral-900 px-1 py-0.5 rounded text-neutral-350 text-xs">https://your-app.com/api/webhooks/openpay</code>).</li>
            <li>Copy the generated <span className="text-white font-semibold">Webhook Secret Key</span> (<code className="bg-neutral-900 px-1 py-0.5 rounded text-indigo-300 text-xs">whsec_...</code>) and place it in your consumer app's environment variables.</li>
          </ul>
        </section>

        {/* Step 4 */}
        <section className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">4</div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Verify Webhook Signature
              <ShieldCheck size={16} className="text-emerald-400" />
            </h3>
          </div>
          <p className="text-sm text-neutral-400 pl-11 font-medium">
            To prevent fraud, your webhook receiver endpoint must verify the signature header <code className="bg-neutral-950 text-indigo-400 px-1.5 py-0.5 rounded text-xs">X-OpenPay-Signature</code>.
          </p>
          
          <div className="pl-11 space-y-4">
            {/* Code example */}
            <div>
              <p className="text-xs text-neutral-400 mb-1 font-mono">Example: Node.js (Next.js API Route / Express)</p>
              <pre className="bg-neutral-950 p-4 border border-neutral-900 rounded-xl text-xs font-mono text-neutral-350 overflow-x-auto">
{`import crypto from 'crypto';

export async function POST(req: Request) {
  const signature = req.headers.get('x-openpay-signature');
  const rawBody = await req.text(); // Verify raw string body

  const secret = process.env.OPENPAY_WEBHOOK_SECRET; //whsec_...
  
  const expectedSignature = crypto
    .createHmac('sha256', secret || '')
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    return new Response('Unauthorized - Signature mismatch', { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  if (payload.event === 'payment.received') {
    const { amount, utr, sender } = payload;
    console.log(\`Received verified UPI payment of ₹\${amount} via UTR \${utr}\`);
    
    // Process payment / credit user balance here...
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}`}
              </pre>
            </div>

            <div>
              <p className="text-xs text-neutral-400 mb-1 font-mono">Example: Python (FastAPI / Flask)</p>
              <pre className="bg-neutral-950 p-4 border border-neutral-900 rounded-xl text-xs font-mono text-neutral-350 overflow-x-auto">
{`import hmac
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
    # process payment...
    return {"success": True}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">5</div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Implement Micro-Discount Reconciliation
              <RefreshCw size={16} className="text-cyan-400" />
            </h3>
          </div>
          <div className="text-sm text-neutral-400 pl-11 space-y-2">
            <p>
              Since Indian banks do not always print custom remarks/order IDs in their credit SMS notifications, the most reliable way to match payments automatically is using <span className="text-indigo-400 font-bold">Micro-Discounts</span>:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 mt-2">
              <li>
                User clicks buy on a <span className="text-white font-semibold">₹10.00</span> package.
              </li>
              <li>
                Your app generates a random subtraction offset between <span className="text-white font-semibold">₹0.01 and ₹0.10</span> (e.g. ₹0.04).
              </li>
              <li>
                Present a UPI QR Code requesting the exact unique value: <span className="text-emerald-400 font-bold">₹9.96</span>. Save the order in your database as pending with this unique amount.
              </li>
              <li>
                When the user pays, the bank SMS says <code className="bg-neutral-900/60 text-white px-1 rounded">Credited with Rs. 9.96</code>. 
              </li>
              <li>
                OpenPay matches the SMS, fires a webhook payload with amount <code className="bg-neutral-900/60 text-white px-1 rounded">"9.96"</code>. Your webhook handler queries your database for the pending order worth exactly <code className="bg-neutral-900/60 text-white px-1 rounded">9.96</code>, updates it to complete, and deposits credits!
              </li>
            </ol>
          </div>
        </section>
      </div>

      {/* Checklist banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 to-violet-950/20 border border-indigo-900/30 rounded-2xl p-6 flex gap-4 items-start">
        <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-white">Verification Checklist</h4>
          <p className="text-xs text-neutral-400 mt-1">
            To ensure 100% success, make sure your phone receives SMS alerts instantly and has constant internet connection. Turn off battery optimization for the OpenPay companion app so Android doesn't put the background broadcast receiver to sleep.
          </p>
        </div>
      </div>
    </div>
  );
}
