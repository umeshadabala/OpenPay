import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  QrCode,
  Smartphone,
  History,
  Webhook,
  User,
  LogOut,
  BookOpen,
} from 'lucide-react';
import SignOutButton from './signout-button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/dashboard/transactions', icon: History },
    { name: 'Devices', href: '/dashboard/devices', icon: Smartphone },
    { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Docs', href: '/dashboard/docs', icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-900 bg-neutral-950/40 backdrop-blur-xl flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-neutral-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white tracking-wider text-sm">OP</span>
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight text-lg">OpenPay</span>
              <span className="block text-[10px] text-indigo-400 font-medium tracking-wider uppercase">Console</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/60 border border-transparent hover:border-neutral-900/60 transition-all duration-200 group text-sm font-semibold"
              >
                <item.icon size={18} className="text-neutral-500 group-hover:text-indigo-400 transition-colors" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-neutral-900 space-y-4">

          <div className="flex items-center justify-between px-4">
            <div className="max-w-[150px] overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
              <p className="text-xs text-neutral-500 truncate">{session.user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-neutral-900 bg-neutral-950/40 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-white">Dashboard Console</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-550/20 text-emerald-450 rounded-full text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Reconciliation Active
            </div>
          </div>
        </header>

        {/* Inner Content */}
        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
