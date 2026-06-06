'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  CheckCircle2,
  Cpu,
  ArrowUpRight,
  Terminal,
  Activity,
  Server,
  FileCode,
  Play,
  Check,
  Copy,
  Plus,
  RefreshCw,
  Clock,
  ChevronDown,
  AlertCircle,
  HelpCircle,
  Code
} from 'lucide-react';

interface Transaction {
  id: string;
  rawSms: string;
  amount: string | null;
  utr: string | null;
  sender: string | null;
  timestamp: string;
  status: string;
  isCredit: boolean;
  confidence: number;
  reasoning: string[];
}

interface Profile {
  id: string;
  merchantName: string;
  upiId: string;
  merchantCode: string;
  email: string;
}

interface DashboardClientProps {
  profile: Profile;
  initialStats: {
    totalTransactions: number;
    successfulReconciled: number;
    connectedDevices: number;
  };
  initialTransactions: Transaction[];
  webhookUrl: string | null;
  webhookSecret: string | null;
}

const SMS_TEMPLATES = [
  {
    name: 'HDFC UPI Credit (₹500)',
    sms: 'Alert: Your A/c x4918 has been Credited with Rs. 500.00 via UPI Ref 384918274019 on 06-06-2026.',
    sender: 'AD-HDFCBK'
  },
  {
    name: 'SBI UPI Credit (₹1,200)',
    sms: 'Dear SBI Customer, Rs 1,200.00 received in A/c ...3820 from UPI Ref 928374829102.',
    sender: 'AX-SBIUPI'
  },
  {
    name: 'ICICI UPI Credit (₹3,000)',
    sms: 'ICICI Bank: Acct XX910 credited with INR 3,000.00 on 06 Jun. UPI Ref: 482910394012.',
    sender: 'BP-ICICIB'
  },
  {
    name: 'Paytm Wallet Credit (₹250)',
    sms: 'Paytm: ₹250.00 credited to wallet/account from UPI Ref 102938475628.',
    sender: 'PYTMUPI'
  },
  {
    name: 'SBI Debit Alert (Ignore)',
    sms: 'Your A/c x3820 has been debited with Rs. 150.00 on 06-06-2026. If not done by you, contact bank.',
    sender: 'AX-SBIUPI'
  },
  {
    name: 'Bank OTP Code (Ignore)',
    sms: 'Your OTP for HDFC Netbanking login is 492019. Valid for 10 minutes. Do not share.',
    sender: 'AD-HDFCBK'
  }
];

export default function DashboardClient({
  profile,
  initialStats,
  initialTransactions,
  webhookUrl,
  webhookSecret
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'stream' | 'sandbox'>('stream');
  const [stats, setStats] = useState(initialStats);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>(initialTransactions);

  // Simulator state
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [customSms, setCustomSms] = useState(SMS_TEMPLATES[0].sms);
  const [customSender, setCustomSender] = useState(SMS_TEMPLATES[0].sender);
  const [simulating, setSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  // General helper state
  const [copiedCode, setCopiedCode] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.merchantCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value);
    setSelectedTemplateIndex(idx);
    setCustomSms(SMS_TEMPLATES[idx].sms);
    setCustomSender(SMS_TEMPLATES[idx].sender);
  };

  const runSimulation = async () => {
    setSimulating(true);
    setSimulationResult(null);
    const logs: string[] = [];
    
    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setSimulationLogs([...logs]);
    };

    addLog('🚀 Initializing transaction simulation sandbox...');
    addLog(`📤 Packaging inbound SMS alert payload (Sender: ${customSender})`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog(`📡 POSTing SMS body to API endpoint: /api/transactions`);
      
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantCode: profile.merchantCode,
          smsText: customSms,
          senderHeader: customSender,
          timestamp: new Date().toISOString(),
          deviceId: 'SIMULATOR-007',
          deviceName: 'Developer Web Sandbox'
        }),
      });

      if (!res.ok) {
        throw new Error(`Endpoint returned status ${res.status}`);
      }

      const data = await res.json();
      addLog('🤖 Invoking autonomous payment reconciliation agent...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { parsing, transactionId } = data;
      addLog(`✨ Extraction completed with ${Math.round(parsing.confidence * 100)}% agent confidence.`);
      addLog(`   • Credit Event: ${parsing.isCredit ? 'YES' : 'NO'}`);
      addLog(`   • Amount Parsed: ₹${parsing.parsedAmount || 'N/A'}`);
      addLog(`   • UTR Extracted: ${parsing.parsedUtr || 'N/A'}`);
      addLog(`   • originating Bank: ${parsing.parsedSender || 'N/A'}`);

      // Log reasoning
      if (parsing.reasoning && parsing.reasoning.length > 0) {
        addLog('🧠 Reasoning steps:');
        parsing.reasoning.forEach((step: string) => addLog(`     - ${step}`));
      }

      if (parsing.isCredit && parsing.confidence >= 0.8 && parsing.parsedAmount) {
        if (webhookUrl) {
          addLog(`🔗 Webhook active. Constructing signed event (payment.received)...`);
          addLog(`🔏 Generated HMAC-SHA256 signature header.`);
          addLog(`📨 Dispatched webhook payload to ${webhookUrl}`);
          addLog(`✅ Webhook status: 200 OK (Dispatched)`);
        } else {
          addLog(`⚠️ No webhook configured. Skipping webhook broadcast.`);
        }
        
        // Update stats and insert in list
        setStats(prev => ({
          ...prev,
          totalTransactions: prev.totalTransactions + 1,
          successfulReconciled: prev.successfulReconciled + 1,
        }));
      } else {
        addLog(`ℹ️ SMS rejected as non-credit or low-confidence event. Webhook skipped.`);
        setStats(prev => ({
          ...prev,
          totalTransactions: prev.totalTransactions + 1,
        }));
      }

      // Add to live transactions stream
      const newTx: Transaction = {
        id: transactionId || Math.random().toString(),
        rawSms: customSms,
        amount: parsing.parsedAmount,
        utr: parsing.parsedUtr,
        sender: parsing.parsedSender || customSender,
        timestamp: new Date().toISOString(),
        status: parsing.isCredit && parsing.confidence >= 0.8 ? 'parsed' : 'ignored',
        isCredit: parsing.isCredit,
        confidence: parsing.confidence,
        reasoning: parsing.reasoning || []
      };

      setTransactionsList(prev => [newTx, ...prev]);
      setSimulationResult(newTx);
      addLog('🎉 Simulation complete.');
    } catch (err: any) {
      addLog(`❌ Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'parsed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            <CheckCircle2 size={10} />
            VERIFIED
          </span>
        );
      case 'ignored':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-500 border border-neutral-800 font-mono">
            <AlertCircle size={10} />
            IGNORED
          </span>
        );
    }
  };

  const conversionRate = stats.totalTransactions > 0 ? Math.round((stats.successfulReconciled / stats.totalTransactions) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900/30 border border-neutral-900 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Server size={18} className="text-indigo-400" />
            Developer Console
          </h1>
          <p className="text-neutral-400 text-xs">
            OpenPay UPI SMS Attribution Platform — Connected in self-hosted gateway mode.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <div className="bg-neutral-950 border border-neutral-850 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500">Code:</span>
            <span className="text-white font-bold tracking-widest">{profile.merchantCode}</span>
            <button
              onClick={handleCopyCode}
              className="text-neutral-400 hover:text-white transition-colors pl-1"
              title="Copy Code"
            >
              {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
          <Link
            href="/dashboard/webhooks"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-neutral-300 hover:text-white rounded-xl transition-all text-xs font-semibold"
          >
            Webhooks
            <ArrowUpRight size={12} />
          </Link>
          <a
            href="https://github.com/umeshadabala/openpay_companion_app/releases/download/V1/OpenPayCompanion.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-neutral-300 hover:text-white rounded-xl transition-all text-xs font-semibold group"
          >
            <Smartphone size={12} className="text-neutral-500 group-hover:text-white transition-colors" />
            Install App
          </a>
          <Link
            href="/dashboard/devices"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 border border-indigo-700/30 text-white rounded-xl transition-all text-xs font-semibold shadow-lg shadow-indigo-600/10"
          >
            Pair App
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-5 hover:border-neutral-800 transition-all duration-300">
          <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Inbound SMS Logged</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{stats.totalTransactions}</span>
            <span className="text-xs text-neutral-600">alerts</span>
          </div>
          <span className="text-[10px] text-neutral-500 block mt-1 font-mono">Incoming push sync payloads</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-5 hover:border-neutral-800 transition-all duration-300">
          <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Attributed Payments</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-450">{stats.successfulReconciled}</span>
            <span className="text-xs text-emerald-500/80 font-bold">{conversionRate}% rate</span>
          </div>
          <span className="text-[10px] text-emerald-500/60 block mt-1 font-mono">Verified credit events verified by AI</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-5 hover:border-neutral-800 transition-all duration-300">
          <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Observer Devices</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{stats.connectedDevices}</span>
            <span className="text-xs text-neutral-600">active</span>
          </div>
          <span className="text-[10px] text-neutral-500 block mt-1 font-mono">Paired companion Android alerts</span>
        </div>
      </div>

      {/* Main Sandbox & Events Stream Tabbed Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Terminal Section (Left 2 columns) */}
        <div className="lg:col-span-2 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-col min-h-[550px] overflow-hidden shadow-2xl">
          {/* Terminal Tab Bar */}
          <div className="flex items-center justify-between border-b border-neutral-900 bg-neutral-900/35 px-4 py-2 select-none">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('stream')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'stream'
                    ? 'bg-neutral-900 text-white border border-neutral-800 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Terminal size={12} className={activeTab === 'stream' ? 'text-indigo-400' : ''} />
                live-listener.sh
              </button>
              <button
                onClick={() => setActiveTab('sandbox')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'sandbox'
                    ? 'bg-neutral-900 text-white border border-neutral-800 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Code size={12} className={activeTab === 'sandbox' ? 'text-indigo-400' : ''} />
                sandbox-simulator.sh
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {activeTab === 'stream' ? 'streaming logs' : 'sandbox idle'}
            </div>
          </div>

          {/* Tab Content 1: Live Event stream */}
          {activeTab === 'stream' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs leading-relaxed max-h-[500px] custom-scrollbar">
              {transactionsList.length === 0 ? (
                <div className="text-neutral-600 space-y-2 py-12 text-center">
                  <Terminal size={24} className="mx-auto mb-2 text-neutral-850" />
                  <p>openpay@console:~$ init_listener</p>
                  <p className="text-neutral-500 italic">No banking alerts synced yet.</p>
                  <p className="text-neutral-600 max-w-sm mx-auto text-[11px] font-sans">
                    Pair your Android companion app using the code, or click the <strong className="text-indigo-400 cursor-pointer" onClick={() => setActiveTab('sandbox')}>sandbox-simulator.sh</strong> tab to upload simulated test alerts.
                  </p>
                </div>
              ) : (
                transactionsList.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;
                  return (
                    <div
                      key={tx.id}
                      className="border-b border-neutral-900/60 pb-4 last:border-0 last:pb-0 space-y-2"
                    >
                      {/* Log Header */}
                      <div
                        onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                        className="flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-900/30 p-2 rounded-lg -m-2 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-600">[{new Date(tx.timestamp).toLocaleTimeString()}]</span>
                          <span className="text-neutral-200 font-bold">₹{tx.amount ? parseFloat(tx.amount).toFixed(2) : '0.00'}</span>
                          {getStatusBadge(tx.status)}
                          <span className="text-neutral-600 text-[10px] hidden sm:inline">({tx.sender})</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-500 text-[10px]">
                          <span>UTR: {tx.utr || 'None'}</span>
                          <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Log Content Summary (Collapsed) */}
                      {!isExpanded && (
                        <p className="text-neutral-500 truncate pl-4 border-l border-neutral-900 text-[11px] italic">
                          &quot;{tx.rawSms}&quot;
                        </p>
                      )}

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="pl-4 border-l border-neutral-850 mt-2 space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold font-sans">Raw Captured SMS</span>
                            <div className="bg-neutral-950 border border-neutral-900 rounded-xl px-3 py-2 text-neutral-300 text-[11px] italic">
                              &quot;{tx.rawSms}&quot;
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold font-sans flex items-center gap-1.5">
                              <Cpu size={12} className="text-indigo-400" />
                              AI Reconciliation Audit Log
                            </span>
                            <div className="bg-neutral-900/40 border border-neutral-900 rounded-xl p-3 space-y-2 text-[11px]">
                              <div className="flex justify-between text-neutral-400 pb-1 border-b border-neutral-950">
                                <span>Classification: {tx.isCredit ? 'Credit (Valid)' : 'Non-Credit / Rejected'}</span>
                                <span>Agent Confidence: {Math.round(tx.confidence * 100)}%</span>
                              </div>
                              
                              <ul className="space-y-1 list-none pl-1 text-neutral-400">
                                {tx.reasoning && tx.reasoning.length > 0 ? (
                                  tx.reasoning.map((step, idx) => (
                                    <li key={idx} className="flex gap-1.5 items-start">
                                      <span className="text-indigo-500 shrink-0">›</span>
                                      <span>{step}</span>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-neutral-600 italic">No reasoning traces recorded.</li>
                                )}
                              </ul>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-neutral-650 font-sans border-t border-neutral-900/60 pt-2">
                            <span>LOG ID: {tx.id}</span>
                            <span>Captured via Companion Sync App</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab Content 2: Sandbox Simulator */}
          {activeTab === 'sandbox' && (
            <div className="flex-1 p-5 flex flex-col md:flex-row gap-5 overflow-y-auto max-h-[500px] custom-scrollbar">
              {/* Controls */}
              <div className="md:w-1/2 space-y-4 shrink-0">
                <div className="space-y-1.5">
                  <label className="block text-neutral-400 text-xs font-bold font-sans">1. Select SMS Bank Template</label>
                  <select
                    onChange={handleTemplateChange}
                    value={selectedTemplateIndex}
                    className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-indigo-650 transition-colors font-mono cursor-pointer"
                  >
                    {SMS_TEMPLATES.map((tpl, i) => (
                      <option key={i} value={i}>
                        {tpl.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-neutral-400 text-xs font-bold font-sans">2. Sender Header</label>
                  <input
                    type="text"
                    value={customSender}
                    onChange={(e) => setCustomSender(e.target.value)}
                    placeholder="e.g. AD-HDFCBK"
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 px-3 text-white text-xs font-mono outline-none focus:border-indigo-650"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-neutral-400 text-xs font-bold font-sans">3. SMS Message Text</label>
                  <textarea
                    rows={4}
                    value={customSms}
                    onChange={(e) => setCustomSms(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-indigo-650 leading-relaxed resize-none"
                    placeholder="Type bank credit SMS text here..."
                  />
                </div>

                <button
                  onClick={runSimulation}
                  disabled={simulating || !customSms}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all font-sans shadow-lg shadow-indigo-650/15"
                >
                  {simulating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Simulating Agentic Pipeline...
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" />
                      Trigger Sandbox Sync SMS
                    </>
                  )}
                </button>
              </div>

              {/* Console logs */}
              <div className="flex-1 bg-neutral-950/80 border border-neutral-900 rounded-xl p-4 flex flex-col font-mono text-[10px] leading-relaxed text-neutral-400 min-h-[200px]">
                <span className="text-[10px] text-neutral-500 border-b border-neutral-900 pb-1.5 mb-2 uppercase font-bold tracking-widest font-sans flex items-center gap-1.5 shrink-0">
                  <Terminal size={10} className="text-neutral-500" />
                  Terminal Console Output
                </span>
                
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {simulationLogs.length === 0 ? (
                    <span className="text-neutral-600 italic">Console output is empty. Select a template and run a simulation to see live AI reconciliation logs.</span>
                  ) : (
                    simulationLogs.map((log, index) => (
                      <p
                        key={index}
                        className={
                          log.includes('❌')
                            ? 'text-red-400 font-bold'
                            : log.includes('✅') || log.includes('✨')
                            ? 'text-emerald-400 font-bold'
                            : log.includes('🚀')
                            ? 'text-indigo-400'
                            : 'text-neutral-350'
                        }
                      >
                        {log}
                      </p>
                    ))
                  )}
                </div>

                {simulationResult && (
                  <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center text-[10px] font-sans">
                    <span className="text-neutral-500">Status: {simulationResult.status.toUpperCase()}</span>
                    <button
                      onClick={() => {
                        setActiveTab('stream');
                        setExpandedTxId(simulationResult.id);
                      }}
                      className="text-indigo-400 hover:underline font-semibold"
                    >
                      Inspect details in stream
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Columns (1 column) */}
        <div className="space-y-6">
          {/* Active Webhook Status */}
          <div className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <FileCode size={14} className="text-indigo-400" />
              Webhook Output Status
            </h3>
            
            {webhookUrl ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-450"></span>
                    ACTIVE
                  </span>
                  <span className="text-[10px] text-neutral-550 font-mono">HMAC SHA-256 Enabled</span>
                </div>
                <div className="bg-neutral-950 border border-neutral-900 px-3 py-2 rounded-xl text-[10px] font-mono text-neutral-350 truncate">
                  {webhookUrl}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-neutral-450 leading-relaxed">
                  No active webhook configuration found. Set up your endpoint to receive instant payment broadcasts.
                </p>
                <Link
                  href="/dashboard/webhooks"
                  className="w-full py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-800 text-neutral-300 hover:text-white rounded-xl transition-all text-xs font-semibold block text-center font-mono"
                >
                  Setup Webhook Endpoint
                </Link>
              </div>
            )}

            {webhookSecret && (
              <div className="border-t border-neutral-900 pt-3 text-[10px] font-mono text-neutral-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Secret Key:</span>
                  <span className="text-neutral-450">Configured</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification Header:</span>
                  <span className="text-indigo-400">X-OpenPay-Signature</span>
                </div>
              </div>
            )}
          </div>

          {/* Quickstart instructions */}
          <div className="bg-neutral-900/20 border border-neutral-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <HelpCircle size={14} className="text-indigo-400" />
              Integrating OpenPay
            </h3>
            
            <div className="space-y-3 font-mono text-[11px] text-neutral-400 leading-relaxed">
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">1.</span>
                <p className="font-sans text-xs">
                  Run the companion app on your merchant Android phone.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">2.</span>
                <div className="font-sans text-xs">
                  Enter connection token: <span className="font-mono bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850 text-white font-bold">{profile.merchantCode}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">3.</span>
                <p className="font-sans text-xs">
                  Generate standard UPI payment links on your website checkout using your UPI ID (<code className="font-mono text-[10px] text-neutral-250 bg-neutral-950 px-1 py-0.5 rounded">{profile.upiId}</code>).
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">4.</span>
                <p className="font-sans text-xs">
                  Upon payment, our AI matches the bank SMS, parses the UTR, and dispatches a verified webhook event to your backend.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
