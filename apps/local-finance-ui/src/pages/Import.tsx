import { useState, useCallback } from 'react'
import {
  Upload,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react'
import { useIPC } from '@/hooks/useIPC'
import { useToast } from '@/components/Toast'

interface Account {
  id: string
  name: string
  institution: string
  type: 'checking' | 'savings' | 'credit' | 'brokerage'
}

interface ParsedTransaction {
  date: string
  description: string
  amount: number
  rawRow: Record<string, string>
}

interface ParseResult {
  transactions: ParsedTransaction[]
  detectedProfile: { id: string; name: string } | null
  errors: string[]
  totalRows: number
}

type Step = 'file' | 'account' | 'review' | 'done'

const STEPS: Step[] = ['file', 'account', 'review', 'done']

const STEP_LABELS: Record<Step, string> = {
  file: 'Select File',
  account: 'Choose Account',
  review: 'Review & Import',
  done: 'Complete',
}

export default function Import() {
  const { toast } = useToast()
  const { data: accounts, refetch: refetchAccounts } = useIPC<Account[]>('getAccounts')

  const [step, setStep] = useState<Step>('file')
  const [filePath, setFilePath] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [parsing, setParsing] = useState(false)

  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [newAccountMode, setNewAccountMode] = useState(false)
  const [newAccountName, setNewAccountName] = useState('')
  const [newAccountInstitution, setNewAccountInstitution] = useState('')
  const [newAccountType, setNewAccountType] = useState<Account['type']>('checking')
  const [creatingAccount, setCreatingAccount] = useState(false)

  const [duplicates, setDuplicates] = useState<boolean[]>([])
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null)

  const currentStepIndex = STEPS.indexOf(step)

  const handlePickFile = useCallback(async () => {
    try {
      const result = await window.api.importOpenFileDialog()
      if (!result) return

      setFilePath(result)
      setFileName(result.split('/').pop() ?? result)
      setParsing(true)

      try {
        const parsed = await window.api.importParseFile(result)
        setParseResult(parsed)
        if (parsed.errors.length > 0 && parsed.transactions.length === 0) {
          toast(parsed.errors[0], 'error')
        } else if (parsed.transactions.length > 0) {
          toast(`Parsed ${parsed.transactions.length} transactions`, 'success')
        }
      } catch (err) {
        toast(`Parse error: ${err instanceof Error ? err.message : 'Unknown'}`, 'error')
      } finally {
        setParsing(false)
      }
    } catch (err) {
      toast(`File dialog error: ${err instanceof Error ? err.message : 'Unknown'}`, 'error')
    }
  }, [toast])

  const handleCreateAccount = useCallback(async () => {
    if (!newAccountName.trim()) {
      toast('Account name is required', 'error')
      return
    }
    setCreatingAccount(true)
    try {
      const account = await window.api.importCreateAccount(
        newAccountName.trim(),
        newAccountInstitution.trim() || 'Unknown',
        newAccountType
      )
      setSelectedAccountId(account.id)
      setNewAccountMode(false)
      refetchAccounts()
      toast(`Created account "${account.name}"`, 'success')
    } catch (err) {
      toast(`Failed to create account: ${err instanceof Error ? err.message : 'Unknown'}`, 'error')
    } finally {
      setCreatingAccount(false)
    }
  }, [newAccountName, newAccountInstitution, newAccountType, toast, refetchAccounts])

  const handleGoToReview = useCallback(async () => {
    if (!parseResult || !selectedAccountId) return
    setCheckingDuplicates(true)
    try {
      const dupes = await window.api.importCheckDuplicates(
        parseResult.transactions.map(tx => ({
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          accountId: selectedAccountId,
        }))
      )
      setDuplicates(dupes)
      setStep('review')
    } catch (err) {
      toast(`Duplicate check failed: ${err instanceof Error ? err.message : 'Unknown'}`, 'error')
    } finally {
      setCheckingDuplicates(false)
    }
  }, [parseResult, selectedAccountId, toast])

  const handleExecuteImport = useCallback(async () => {
    if (!parseResult || !selectedAccountId) return
    setImporting(true)
    try {
      const result = await window.api.importExecute({
        transactions: parseResult.transactions,
        accountId: selectedAccountId,
        filename: fileName,
      })
      setImportResult(result)
      setStep('done')
      toast(`Imported ${result.imported} transactions`, 'success')
    } catch (err) {
      toast(`Import failed: ${err instanceof Error ? err.message : 'Unknown'}`, 'error')
    } finally {
      setImporting(false)
    }
  }, [parseResult, selectedAccountId, fileName, toast])

  const handleReset = useCallback(() => {
    setStep('file')
    setFilePath(null)
    setFileName('')
    setParseResult(null)
    setSelectedAccountId('')
    setNewAccountMode(false)
    setNewAccountName('')
    setNewAccountInstitution('')
    setNewAccountType('checking')
    setDuplicates([])
    setImportResult(null)
  }, [])

  const newCount = duplicates.filter(d => !d).length
  const dupeCount = duplicates.filter(d => d).length

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Import Transactions</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.filter(s => s !== 'done').map((s, i) => {
          const active = currentStepIndex >= i
          const current = step === s
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={`h-px w-8 ${active ? 'bg-blue-500' : 'bg-slate-200'}`} />}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    active
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  } ${current ? 'ring-2 ring-blue-300' : ''}`}
                >
                  {currentStepIndex > i ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                  {STEP_LABELS[s]}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Step 1: File Selection */}
      {step === 'file' && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Select a CSV file</h2>

          <button
            onClick={handlePickFile}
            disabled={parsing}
            className="flex items-center gap-3 px-5 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {parsing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {parsing ? 'Parsing...' : 'Choose CSV File'}
          </button>

          {filePath && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <FileText size={16} />
              <span className="font-medium">{fileName}</span>
            </div>
          )}

          {parseResult && parseResult.errors.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 text-sm font-medium text-red-700 mb-1">
                <AlertCircle size={14} />
                Parse Warnings
              </div>
              <ul className="text-xs text-red-600 space-y-1">
                {parseResult.errors.slice(0, 5).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
                {parseResult.errors.length > 5 && (
                  <li>...and {parseResult.errors.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          {parseResult && parseResult.detectedProfile && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
              Detected bank format: <span className="font-semibold">{parseResult.detectedProfile.name}</span>
            </div>
          )}

          {parseResult && parseResult.transactions.length > 0 && (
            <>
              <div className="mt-4 text-sm text-slate-600">
                <span className="font-semibold">{parseResult.transactions.length}</span> transactions found
                (from {parseResult.totalRows} rows)
              </div>

              {/* Preview table */}
              <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-3 py-2 font-medium text-slate-600">Date</th>
                      <th className="px-3 py-2 font-medium text-slate-600">Description</th>
                      <th className="px-3 py-2 font-medium text-slate-600 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parseResult.transactions.slice(0, 20).map((tx, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{tx.date}</td>
                        <td className="px-3 py-2 text-slate-900 truncate max-w-[300px]">{tx.description}</td>
                        <td className={`px-3 py-2 text-right font-medium whitespace-nowrap ${
                          tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parseResult.transactions.length > 20 && (
                  <div className="px-3 py-2 text-xs text-slate-400 bg-slate-50 text-center">
                    Showing 20 of {parseResult.transactions.length} transactions
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep('account')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Account Selection */}
      {step === 'account' && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Choose an account</h2>
          <p className="text-sm text-slate-500 mb-4">
            Select which account these transactions belong to, or create a new one.
          </p>

          {!newAccountMode ? (
            <>
              <div className="space-y-2 mb-4">
                {(accounts ?? []).map(acct => (
                  <label
                    key={acct.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAccountId === acct.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-border hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="account"
                      value={acct.id}
                      checked={selectedAccountId === acct.id}
                      onChange={() => setSelectedAccountId(acct.id)}
                      className="accent-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{acct.name}</div>
                      <div className="text-xs text-slate-500">{acct.institution} &middot; {acct.type}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={() => setNewAccountMode(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={14} />
                Create new account
              </button>
            </>
          ) : (
            <div className="space-y-3 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={e => setNewAccountName(e.target.value)}
                  placeholder="e.g. Chase Checking"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
                <input
                  type="text"
                  value={newAccountInstitution}
                  onChange={e => setNewAccountInstitution(e.target.value)}
                  placeholder="e.g. Chase Bank"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={newAccountType}
                  onChange={e => setNewAccountType(e.target.value as Account['type'])}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-slate-900"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit">Credit Card</option>
                  <option value="brokerage">Brokerage</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleCreateAccount}
                  disabled={creatingAccount}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {creatingAccount && <Loader2 size={14} className="animate-spin" />}
                  Create Account
                </button>
                <button
                  onClick={() => setNewAccountMode(false)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep('file')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              onClick={handleGoToReview}
              disabled={!selectedAccountId || checkingDuplicates}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {checkingDuplicates ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && parseResult && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Review Import</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-slate-50 border border-border">
              <div className="text-sm text-slate-500 mb-1">Total Transactions</div>
              <div className="text-2xl font-semibold text-slate-900">
                {parseResult.transactions.length}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-sm text-green-700 mb-1">New (will import)</div>
              <div className="text-2xl font-semibold text-green-700">{newCount}</div>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-sm text-amber-700 mb-1">Duplicates (will skip)</div>
              <div className="text-2xl font-semibold text-amber-700">{dupeCount}</div>
            </div>
          </div>

          {selectedAccountId && accounts && (
            <div className="mb-6 text-sm text-slate-600">
              Importing to: <span className="font-semibold text-slate-900">
                {accounts.find(a => a.id === selectedAccountId)?.name}
              </span>
            </div>
          )}

          {newCount === 0 && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 mb-6">
              <AlertCircle size={14} className="inline mr-1" />
              All transactions are duplicates. Nothing new to import.
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep('account')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={importing || newCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Import {newCount} Transactions
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 'done' && importResult && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-border text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Import Complete</h2>
          <p className="text-sm text-slate-500 mb-6">
            {importResult.imported} transactions imported, {importResult.skipped} duplicates skipped.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  )
}
