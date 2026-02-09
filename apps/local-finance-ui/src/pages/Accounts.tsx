import { useNavigate } from 'react-router-dom'
import { useIPC } from '@/hooks/useIPC'
import { AccountCard } from '@/components'

interface Account {
  id: string
  name: string
  institution: string
  type: 'checking' | 'savings' | 'credit' | 'brokerage'
}

const typeOrder = ['checking', 'savings', 'credit', 'brokerage'] as const
const typeLabels: Record<string, string> = {
  checking: 'Checking Accounts',
  savings: 'Savings Accounts',
  credit: 'Credit Cards',
  brokerage: 'Brokerage Accounts',
}

export default function Accounts() {
  const navigate = useNavigate()
  const { data: accounts, loading: accountsLoading } = useIPC<Account[]>('getAccounts')
  const { data: balances, loading: balancesLoading } = useIPC<Record<string, number>>('getAccountBalances')

  const loading = accountsLoading || balancesLoading

  // Group accounts by type
  const grouped = new Map<string, Account[]>()
  for (const acct of accounts ?? []) {
    const list = grouped.get(acct.type) ?? []
    list.push(acct)
    grouped.set(acct.type, list)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white p-5 shadow-sm border border-border animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-200" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-slate-200 rounded w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-5 bg-slate-200 rounded-full w-16" />
                <div className="h-5 bg-slate-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (!accounts || accounts.length === 0) && (
        <div className="rounded-xl bg-white shadow-sm border border-border p-12 text-center">
          <p className="text-sm text-slate-400">No accounts found. Import transactions to see your accounts.</p>
        </div>
      )}

      {!loading && accounts && accounts.length > 0 && (
        <div className="space-y-8">
          {typeOrder.map((type) => {
            const group = grouped.get(type)
            if (!group || group.length === 0) return null
            return (
              <div key={type}>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {typeLabels[type]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      balance={balances?.[account.id]}
                      onClick={() => navigate(`/accounts/${account.id}`)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
