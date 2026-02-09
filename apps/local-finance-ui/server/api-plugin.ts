import type { Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

// Lazy-loaded database modules (loaded on first request)
let dbModules: Awaited<ReturnType<typeof loadModules>> | null = null

async function loadModules() {
  const [database, budgetDb, budget, engine, config] = await Promise.all([
    import('../../local-finance/src/core/database'),
    import('../../local-finance/src/core/budget-database'),
    import('../../local-finance/src/core/budget'),
    import('../../local-finance/src/insights/engine'),
    import('../../local-finance/src/core/config'),
  ])
  return { database, budgetDb, budget, engine, config }
}

function getDb() {
  if (!dbModules) throw new Error('Modules not loaded')
  dbModules.config.ensureDataDir()
  return dbModules.database.getDatabase(dbModules.config.getDatabasePath())
}

async function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) }
      catch { resolve({}) }
    })
  })
}

function json(res: ServerResponse, data: unknown) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

type RouteHandler = (params: Record<string, unknown>) => unknown

function buildRoutes(): Record<string, RouteHandler> {
  return {
    'transactions:list': (p) => {
      const db = getDb()
      return dbModules!.database.getTransactions(db, {
        accountId: p.accountId as string | undefined,
        categoryId: p.categoryId as string | undefined,
        from: p.dateFrom ? new Date(p.dateFrom as string) : undefined,
        to: p.dateTo ? new Date(p.dateTo as string) : undefined,
        search: p.search as string | undefined,
        limit: p.limit as number | undefined,
        offset: p.offset as number | undefined,
      })
    },
    'transactions:get': (p) => dbModules!.database.getTransaction(getDb(), p.id as string),
    'accounts:list': () => dbModules!.database.getAllAccounts(getDb()),
    'accounts:get': (p) => dbModules!.database.getAccount(getDb(), p.id as string),
    'categories:list': () => dbModules!.database.getAllCategories(getDb()),
    'recurring:list': () => dbModules!.database.getAllRecurringPayments(getDb()),
    'accounts:balances': () => {
      const db = getDb()
      const rows = db
        .prepare('SELECT account_id, SUM(amount) as balance FROM transactions GROUP BY account_id')
        .all() as { account_id: string; balance: number }[]
      const balances: Record<string, number> = {}
      for (const row of rows) balances[row.account_id] = row.balance
      return balances
    },
    'db:stats': () => {
      const db = getDb()
      const transactions = db.prepare('SELECT COUNT(*) as count FROM transactions').get() as { count: number }
      const accounts = db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number }
      const dateRange = db.prepare('SELECT MIN(date) as earliest, MAX(date) as latest FROM transactions').get() as { earliest: string | null; latest: string | null }
      return { totalTransactions: transactions.count, totalAccounts: accounts.count, dateRange }
    },
    'budgets:list': () => dbModules!.budgetDb.getAllBudgets(getDb()),
    'budgets:get': (p) => dbModules!.budgetDb.getBudget(getDb(), p.id as string),
    'budgets:create': (p) => dbModules!.budget.createBudgetWithDefaults(getDb(), p.name as string, p.periodType as 'monthly' | 'weekly' | 'yearly'),
    'budgets:delete': (p) => { dbModules!.budgetDb.deleteBudget(getDb(), p.id as string); return { success: true } },
    'allocations:list': (p) => dbModules!.budgetDb.getAllocations(getDb(), p.budgetId as string),
    'allocations:set': (p) => dbModules!.budgetDb.setAllocation(getDb(), p.budgetId as string, p.categoryId as string, p.amount as number, p.rollover as boolean),
    'allocations:remove': (p) => { dbModules!.budgetDb.removeAllocation(getDb(), p.budgetId as string, p.categoryId as string); return { success: true } },
    'budget:status': (p) => dbModules!.budget.getBudgetStatus(getDb(), p.budgetId as string),
    'budget:vs-actual': (p) => dbModules!.budget.getBudgetVsActual(getDb(), p.budgetId as string, p.periodStart as string, p.periodEnd as string),
    'budget:suggestions': (p) => dbModules!.budget.suggestAllocations(getDb(), (p.months as number) ?? 3),
    'reports:category-summary': (p) => dbModules!.database.getCategorySummary(getDb(), p.year as number),
    'reports:merchant-summary': (p) => dbModules!.database.getMerchantSummary(getDb(), p.year as number),
    'reports:year': (p) => dbModules!.database.generateYearReport ? dbModules!.database.generateYearReport(getDb(), p.year as number) : dbModules!.engine.generateYearReport(getDb(), p.year as number),
    'snapshots:create': (p) => dbModules!.budgetDb.createSnapshot(getDb(), p.accountId as string, p.date as string, p.balance as number, p.source as 'import' | 'manual' | 'calculated'),
    'snapshots:list': (p) => dbModules!.budgetDb.getSnapshots(getDb(), p.accountId as string),
    'snapshots:latest': (p) => dbModules!.budgetDb.getLatestSnapshot(getDb(), p.accountId as string),
  }
}

export function apiPlugin(): Plugin {
  return {
    name: 'local-finance-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/')) return next()

        try {
          // Lazy load modules on first request
          if (!dbModules) {
            dbModules = await loadModules()
          }

          const route = req.url.replace('/api/', '').split('?')[0]
          const routes = buildRoutes()
          const handler = routes[route]

          if (!handler) {
            res.statusCode = 404
            return json(res, { error: `Unknown route: ${route}` })
          }

          // Parse params from query string (GET) or body (POST)
          let params: Record<string, unknown> = {}
          if (req.method === 'POST') {
            params = await parseBody(req)
          } else {
            const url = new URL(req.url, 'http://localhost')
            for (const [k, v] of url.searchParams) {
              // Try to parse numbers/booleans
              if (v === 'true') params[k] = true
              else if (v === 'false') params[k] = false
              else if (/^\d+$/.test(v)) params[k] = Number(v)
              else params[k] = v
            }
          }

          const result = await handler(params)
          json(res, result)
        } catch (err) {
          console.error(`API error [${req.url}]:`, err)
          res.statusCode = 500
          json(res, { error: (err as Error).message })
        }
      })
    },
  }
}
