import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  Smartphone,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Zap,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-radial-[at_top] from-cyan-500/10 via-blue-500/5 to-transparent -z-10 blur-3xl" />

      {/* Navigation Header */}
      <header className="max-w-6xl mx-auto w-full px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="font-bold text-white tracking-wider text-sm">OP</span>
          </div>
          <span className="font-black text-white text-lg tracking-tight">OpenPay</span>
        </div>

        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition-all font-semibold"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm bg-slate-900 border border-slate-805 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-all font-semibold"
          >
            Register
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center space-y-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-550/20 text-cyan-400 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
          <Zap size={10} />
          Open-Source UPI Infrastructure
        </span>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Autonomous UPI Payment <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            Reconciliation Engine
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          OpenPay helps developers automatically attribute offline UPI payments to online orders in seconds. No payment gateway. No transactional fees. Reconciled autonomously by AI agents.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/25 transition-all text-sm w-full sm:w-auto justify-center"
          >
            Go to Console
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-800 text-slate-355 hover:text-white rounded-2xl transition-all text-sm w-full sm:w-auto justify-center font-semibold"
          >
            Register Account
          </Link>
        </div>
      </section>

      {/* How it works Architecture section */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full space-y-12">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Attribution in Four Steps</h2>
          <p className="text-slate-500 text-sm mt-1">From user scan to database credit verification.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-neutral-900/10 border border-neutral-900 rounded-3xl p-6 backdrop-blur-md hover:border-neutral-850 transition-all duration-300 relative group">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-4">
              <Smartphone size={20} />
            </div>
            <h4 className="font-extrabold text-white text-sm mb-2">1. Link Companion App</h4>
            <p className="text-xs text-neutral-450 leading-relaxed">
              Enter your unique 6-digit connection token in the companion Android application to link your phone.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-neutral-900/10 border border-neutral-900 rounded-3xl p-6 backdrop-blur-md hover:border-neutral-850 transition-all duration-300 relative group">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-4">
              <QrCode size={20} />
            </div>
            <h4 className="font-extrabold text-white text-sm mb-2">2. Customers Pay</h4>
            <p className="text-xs text-neutral-450 leading-relaxed">
              Generate standard UPI payment links on your site. Customers pay directly to your VPA using any UPI app.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-neutral-900/10 border border-neutral-900 rounded-3xl p-6 backdrop-blur-md hover:border-neutral-850 transition-all duration-300 relative group">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-4">
              <Zap size={20} />
            </div>
            <h4 className="font-extrabold text-white text-sm mb-2">3. Capture SMS Alert</h4>
            <p className="text-xs text-neutral-450 leading-relaxed">
              The companion app instantly captures the incoming bank credit SMS alert and forwards it to OpenPay.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-neutral-900/10 border border-neutral-900 rounded-3xl p-6 backdrop-blur-md hover:border-neutral-850 transition-all duration-300 relative group">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-4">
              <Cpu size={20} />
            </div>
            <h4 className="font-extrabold text-white text-sm mb-2">4. AI Parse & Webhook</h4>
            <p className="text-xs text-neutral-450 leading-relaxed">
              Gemini AI parses the alert (UTR, amount, bank), logs the transaction, and pushes a signed webhook to your server.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-slate-900 w-full grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-400">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" />
            What OpenPay IS NOT
          </h3>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✕</span>
              <span>**Not a Payment Gateway:** We never process credit card/bank details or hold payments.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✕</span>
              <span>**Not a Wallet:** No customer deposits, no balances, and no money storage.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✕</span>
              <span>**No Settlements:** Funds settle directly into your bank account through UPI standard protocols.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle className="text-indigo-400" />
            What OpenPay IS
          </h3>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">✓</span>
              <span>**Attribution Engine:** Attributes offline UPI bank alerts to your online database in real-time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">✓</span>
              <span>**Developer Infrastructure:** Relies on robust API interfaces and HMAC webhook systems.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">✓</span>
              <span>**Agentic Loop:** Performs advanced reasoning to classify transactions rather than fragile regex alone.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© 2026 OpenPay Platform. Open-source under MIT license.</p>
      </footer>
    </div>
  );
}
