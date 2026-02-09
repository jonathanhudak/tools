import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  RefreshCw,
  Landmark,
  BarChart3,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Budgets from '@/pages/Budgets'
import Accounts from '@/pages/Accounts'
import Reports from '@/pages/Reports'
import RecurringPayments from '@/pages/RecurringPayments'
import AccountDetail from '@/pages/AccountDetail'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: Wallet },
  { to: '/recurring', label: 'Recurring', icon: RefreshCw },
  { to: '/accounts', label: 'Accounts', icon: Landmark },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function App() {
  const location = useLocation()
  const [dark, setDark] = useState(() => localStorage.getItem('finance-theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('finance-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 shrink-0 bg-sidebar-bg">
        {/* Drag region for macOS title bar */}
        <div className="h-12 shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

        {/* App title */}
        <div className="px-5 pb-6">
          <h1 className="text-lg font-semibold text-white tracking-tight">
            Finance
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to)

            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-active text-white'
                    : 'text-sidebar-text hover:text-white hover:bg-sidebar-hover'
                )}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-xs text-sidebar-text">Local Finance v0.0.1</span>
          <button
            onClick={() => setDark(d => !d)}
            className="p-1.5 rounded-lg text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/recurring" element={<RecurringPayments />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:accountId" element={<AccountDetail />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  )
}
