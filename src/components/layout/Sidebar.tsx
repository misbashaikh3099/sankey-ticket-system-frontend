'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  RiDashboardLine, RiTicketLine, RiAddLine,
  RiUserLine, RiBarChartLine, RiLogoutBoxLine,
  RiShieldLine, RiTeamLine, RiGroupLine
} from 'react-icons/ri';
import clsx from 'clsx';

const navItems = {
  BUYER: [
    { href: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
    { href: '/buyer/tickets', label: 'My Tickets', icon: RiTicketLine },
    { href: '/buyer/tickets/create', label: 'New Ticket', icon: RiAddLine },
  ],
  VENDOR: [
    { href: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
    { href: '/vendor/tickets', label: 'Assigned Tickets', icon: RiTicketLine },
  ],
  ADMIN: [
    { href: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
    { href: '/admin/tickets', label: 'All Tickets', icon: RiTicketLine },
    { href: '/admin/vendors', label: 'Vendors', icon: RiTeamLine },
    { href: '/admin/users', label: 'Users', icon: RiGroupLine },
    { href: '/admin/reports', label: 'Reports', icon: RiBarChartLine },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const items = navItems[user.role] || [];

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const roleColors: Record<string, string> = {
    BUYER: 'text-blue-400 bg-blue-400/10',
    VENDOR: 'text-violet-400 bg-violet-400/10',
    ADMIN: 'text-amber-400 bg-amber-400/10',
  };

  const roleIcons: Record<string, React.ElementType> = {
    BUYER: RiUserLine,
    VENDOR: RiTeamLine,
    ADMIN: RiShieldLine,
  };

  const RoleIcon = roleIcons[user.role] || RiUserLine;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-20"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <RiTicketLine className="text-white text-lg" />
          </div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            TicketDesk
          </span>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <div className={clsx('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-0.5', roleColors[user.role])}>
              <RoleIcon className="text-xs" />
              {user.role}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Navigation
        </p>
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className={clsx('text-lg flex-shrink-0', isActive ? 'text-white' : '')} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
        >
          <RiLogoutBoxLine className="text-lg" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}