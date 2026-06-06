import React from 'react';
import { 
  BookOpen, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Terminal, 
  ArrowRightLeft 
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="space-y-10 max-w-5xl pb-24 text-neutral-350">
      {/* Header */}
      <div className="border-b border-neutral-900 pb-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <BookOpen className="text-indigo-400" size={32} />
          OpenPay Developer Documentation
        </h1>
        <p className="text-neutral-400 text-sm mt-2">
          A point-to-point guide explaining the OpenPay architecture, Android background listeners, webhook integration, and automatic reconciliation algorithms.
        </p>
      </div>

      {/* Section 1: System Architecture */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="text-indigo-400" size={20} />
          1. System Architecture & Lifecycle
        </h2>
        <p className="text-sm">
          OpenPay operates as an autonomous, self-hosted verification layer. It decouples payment notification capturing from your core backend logic by utilizing background SMS attribution.
        </p>
        
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">Phase A: Payment</div>
              <h4 className="text-sm font-bold text-white">UPI QR Generation</h4>
              <p className="text-xs text-neutral-500">
                Your application generates a standard UPI deep link/QR code requesting a specific, uniquely tracked amount.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">Phase B: Capture</div>
              <h4 className="text-sm font-bold text-white">Android Event Sync</h4>
              <p className="text-xs text-neutral-500">
                The customer pays. The merchant's phone receives an SMS notification from the bank, which is immediately forwarded by the OpenPay companion app.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">Phase C: Reason</div>
              <h4 className="text-sm font-bold text-white">AI / Rule Processing</h4>
              <p className="text-xs text-neutral-500">
                OpenPay ingests the SMS, extracts metadata (UTR, Amount, Bank) via rules or Gemini, and logs the transaction.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">Phase D: Dispatch</div>
              <h4 className="text-sm font-bold text-white">Signed Webhook</h4>
              <p className="text-xs text-neutral-500">
                OpenPay sends a signed webhook notification with transaction details to your core application servers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Android Companion App */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Smartphone className="text-indigo-400" size={20} />
          2. Android Companion App Architecture
        </h2>
        <p className="text-sm">
          The companion app acts as a hardware gateway. It monitors incoming bank SMS messages and pipes them to your self-hosted OpenPay instance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">SMS BroadcastReceiver Lifecycle</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The app registers a high-priority <code className="text-indigo-400 bg-neutral-950 px-1 py-0.5 rounded">BroadcastReceiver</code> for the <code className="text-neutral-300">android.provider.Telephony.SMS_RECEIVED</code> action. When the OS broadcasts an incoming SMS event, the receiver extracts the sender header (e.g. <code className="text-neutral-300">AD-HDFCBK</code>) and the message body.
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              To keep performance efficient and maintain privacy, the app parses only headers matching Indian financial institution templates (e.g., 2-character prefix followed by a dash and bank name like <code className="text-neutral-300">XX-XXXXXX</code>) or containing keywords like HDFC, SBI, ICICI, PAYTM.
            </p>
          </div>

          <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Android Background Constraints</h3>
            <div className="text-xs text-neutral-450 space-y-2">
              <div className="flex gap-2 items-start">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Battery Optimization:</strong> Android's Doze Mode and standby limits will delay or kill background SMS receivers. You must request battery optimization exclusion (Whitelist) on the device.
                </span>
              </div>
              <div className="flex gap-2 items-start">
                <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Foreground Service:</strong> The listener is backed by a persistent foreground service showing a notification to prevent the system garbage collector from reclaiming the listener resources.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Micro-Discount Reconciliation */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowRightLeft className="text-indigo-400" size={20} />
          3. Micro-Discount Reconciliation
        </h2>
        <div className="text-sm space-y-3">
          <p>
            UPI peer-to-peer or basic merchant VPAs do not attach custom order reference variables directly to the bank statement SMS. The SMS statement only contains: <strong>Amount</strong>, <strong>Timestamp</strong>, and the <strong>12-digit UTR (Unique Transaction Reference)</strong>.
          </p>
          <p>
            To automatically map a payment to a pending order on your server without asking users to copy and paste their transaction UTR, you must use a **Micro-Discount Pattern**.
          </p>
        </div>

        {/* Warning Callout */}
        <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle size={18} />
            Important Accounting & Bookkeeping Warnings
          </div>
          <ul className="list-disc pl-5 text-xs text-neutral-400 space-y-1">
            <li>
              <strong>Do not subtract values arbitrarily:</strong> The unique subtraction offset must be between <code className="text-white">₹0.01</code> and <code className="text-white">₹0.10</code>. Do not dynamically strip larger currency components without logging the exact discount inside your database.
            </li>
            <li>
              <strong>Double-entry Ledger Integrity:</strong> In your transaction ledger, write the base package price (e.g. ₹10.00), the exact generated discount (e.g. ₹0.04), and the final expected payment (e.g. ₹9.96) as distinct records. This ensures your bank reconciliations balance perfectly during tax audits.
            </li>
            <li>
              <strong>Strict Decimal Accuracy:</strong> Never use float types to represent monetary values. Floating-point math in databases or Node.js causes precision errors (e.g., <code className="text-rose-450">9.960000000000001</code>). Always store amounts using fixed-point decimals, such as <code className="text-white">NUMERIC(10, 2)</code> or integer cents.
            </li>
          </ul>
        </div>

        {/* Micro-Discount Matching Algorithm */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Reconciliation Lifecycle Example</h3>
          <div className="text-xs space-y-3">
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded bg-neutral-800 text-white flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <strong>Generate Payment request:</strong> A user requests to purchase an item costing ₹100.00.
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded bg-neutral-800 text-white flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <strong>Apply Micro-Discount:</strong> Your server generates a random discount value between 1 and 10 paise:
                <pre className="bg-neutral-950 p-2 border border-neutral-900 rounded font-mono text-indigo-400 mt-1 max-w-sm">
{`const baseAmount = 100.00;
const discountOffset = (Math.floor(Math.random() * 10) + 1) / 100; // e.g. 0.04
const expectedAmount = (baseAmount - discountOffset).toFixed(2); // "99.96"`}
                </pre>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded bg-neutral-800 text-white flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <strong>Generate UPI String:</strong> Encode the exact micro-discounted amount inside your deep link. You must instruct the user not to modify the payment amount.
                <code className="block bg-neutral-950 p-2 border border-neutral-900 rounded font-mono text-neutral-400 mt-1 text-[11px] break-all">
                  upi://pay?pa=merchant@bank&pn=MerchantName&am=99.96&tn=Order_ORD89128
                </code>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded bg-neutral-800 text-white flex items-center justify-center font-bold shrink-0">4</div>
              <div>
                <strong>Attribution and Expiry:</strong> Keep this unique amount locked for 15 minutes. If no payment arrives, expire the order so that the specific amount (e.g. ₹99.96) can be reused for another session.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Webhooks and Security */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="text-indigo-400" size={20} />
          4. Webhook Payload & Signature Verification
        </h2>
        <p className="text-sm">
          OpenPay triggers a POST request to your webhook URL for every confident UPI credit transaction matching your merchant profile. All webhook requests are signed using an HMAC-SHA256 signature containing your webhook secret.
        </p>

        <div className="space-y-4">
          {/* Payload schema */}
          <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-white">Webhook Payload Schema</h3>
            <p className="text-xs text-neutral-400">OpenPay sends the following JSON body:</p>
            <pre className="bg-neutral-950 p-4 border border-neutral-900 rounded-xl text-xs font-mono text-neutral-350 overflow-x-auto">
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

          {/* Nodejs verification */}
          <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-white">Node.js Webhook Receiver Handler</h3>
            <pre className="bg-neutral-950 p-4 border border-neutral-900 rounded-xl text-xs font-mono text-neutral-350 overflow-x-auto">
{`import crypto from 'crypto';

export async function POST(req: Request) {
  // 1. Retrieve the signature sent by OpenPay
  const signature = req.headers.get('x-openpay-signature');
  const rawBody = await req.text(); // Verify signature using the raw string request body

  const secret = process.env.OPENPAY_WEBHOOK_SECRET; // Configure this with your whsec_... key
  if (!secret) {
    return new Response('Server configuration missing', { status: 500 });
  }

  // 2. Re-hash raw body with the secret
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // 3. Prevent timing attacks by using secure comparison
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature || '', 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );

  if (!isValid) {
    return new Response('Signature verification failed', { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  if (payload.event === 'payment.received') {
    const { amount, utr } = payload;
    
    // 4. Query your DB for the pending order with this exact amount
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.amount, amount),
        eq(orders.status, 'pending')
      )
    });

    if (order) {
      // 5. Update order state and register transaction UTR
      await db.update(orders)
        .set({ status: 'success', utr: utr })
        .where(eq(orders.id, order.id));
        
      console.log(\`Successfully credited order \${order.id} for amount \${amount}\`);
    }
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Section 5: Integration Checklist */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-indigo-400" size={20} />
          5. Deployment & Testing Checklist
        </h2>
        <div className="bg-neutral-900/20 border border-neutral-900 rounded-xl p-5 space-y-3 text-sm">
          <p>Verify these steps to establish high reliability for your production payments loop:</p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>
                <strong>SMS permissions granted:</strong> Ensure the linked Android device has the SMS permissions granted manually in Settings if not prompted on the first launch.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>
                <strong>Unrestricted battery usage:</strong> In Android Settings → Apps → OpenPay Companion → Battery, set to "Unrestricted" to prevent OS sleep.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>
                <strong>Valid VPA registration:</strong> The UPI ID configured in the merchant profile matches your bank VPA exactly. Test with a tiny transaction from your personal app to make sure.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>
                <strong>Vercel cold start:</strong> Webhook endpoints must respond within 10 seconds. Keep your consumer app backend optimized to prevent timeouts.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
