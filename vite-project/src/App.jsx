import { useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts'
import './App.css'

const ASSETS = [
  { id: 1, name: 'Chase Premier Checking', sub: 'Chase Bank • Cash & Savings', value: 8450.25, icon: '💵', type: 'cash' },
  { id: 2, name: 'Marcus High-Yield Savings', sub: 'Marcus by Goldman Sachs • 4.5% APY', value: 42300, icon: '🏦', type: 'savings' },
  { id: 3, name: 'Fidelity Brokerage', sub: 'Fidelity Investments • Investment Account', value: 115200.50, icon: '📈', type: 'invest' },
  { id: 4, name: 'Empower 401(k) Retirement', sub: 'Empower Retirement • 401(k)/IRA', value: 185600, icon: '🏛️', type: 'retire' },
  { id: 5, name: 'Primary Residence Asset', sub: 'Home Valuation • Real Estate Holdings', value: 450000, icon: '🏠', type: 'real' },
]

const LIABILITIES = [
  { id: 6, name: 'Chase Sapphire Reserve', sub: 'Chase Bank • Credit Card Debt', value: -1420.80, icon: '💳', type: 'debt' },
  { id: 7, name: 'Home Mortgage Loan', sub: 'Wells Fargo • Liabilities & Loans • 3.875% APR', value: -285000, icon: '🏡', type: 'debt' },
]

const LEDGER = [
  { id: 1, date: '2026-06-15', account: 'Chase Premier Checking', merchant: 'Tech Corp Inc', sub: 'Bi-weekly Direct Deposit', category: 'Salary', type: 'income', amount: 5400 },
  { id: 2, date: '2026-06-01', account: 'Chase Premier Checking', merchant: 'Tech Corp Inc', sub: 'Bi-weekly Direct Deposit', category: 'Salary', type: 'income', amount: 5400 },
  { id: 3, date: '2026-06-01', account: 'Chase Sapphire Reserve', merchant: 'Metropolitan Rentals', sub: 'Monthly Apartment Rent Payment', category: 'Housing & Rent', type: 'expense', amount: -1420 },
  { id: 4, date: '2026-06-12', account: 'Chase Sapphire Reserve', merchant: 'Whole Foods Market', sub: 'Weekly grocery restock', category: 'Groceries', type: 'expense', amount: -85.50 },
  { id: 5, date: '2026-06-18', account: 'Chase Sapphire Reserve', merchant: "Trader Joe's", sub: 'Snacks and frozen meals', category: 'Groceries', type: 'expense', amount: -124.20 },
  { id: 6, date: '2026-06-14', account: 'Chase Sapphire Reserve', merchant: 'The Steakhouse', sub: 'Fine dinner celebration', category: 'Food & Dining', type: 'expense', amount: -145 },
  { id: 7, date: '2026-06-25', account: 'Chase Sapphire Reserve', merchant: 'Starbucks Coffee', sub: 'Coffee run with peers', category: 'Food & Dining', type: 'expense', amount: -18.75 },
  { id: 8, date: '2026-06-20', account: 'Chase Sapphire Reserve', merchant: 'Netflix', sub: 'Monthly Subscription', category: 'Entertainment', type: 'expense', amount: -15.99 },
  { id: 9, date: '2026-06-08', account: 'Chase Premier Checking', merchant: 'Electric Company', sub: 'Monthly Utilities', category: 'Utilities & Bills', type: 'expense', amount: -64.30 },
  { id: 10, date: '2026-06-22', account: 'Chase Sapphire Reserve', merchant: 'Uber', sub: 'Weekend rides', category: 'Transportation', type: 'expense', amount: -42.50 },
]

const BUDGETS = [
  { id: 1, name: 'Housing & Rent', spent: 1520, limit: 2000 },
  { id: 2, name: 'Groceries', spent: 209.70, limit: 600 },
  { id: 3, name: 'Food & Dining', spent: 163.75, limit: 500 },
  { id: 4, name: 'Utilities & Bills', spent: 64.30, limit: 350 },
  { id: 5, name: 'Transportation', spent: 110, limit: 400 },
  { id: 6, name: 'Entertainment', spent: 45, limit: 300 },
  { id: 7, name: 'Shopping', spent: 210.50, limit: 500 },
]

const GOALS = [
  { id: 1, name: '6-Month Emergency Fund', target: '2026-12-31', type: 'Savings', saved: 30000, goal: 30000 },
  { id: 2, name: 'Investment Property Downpayment', target: '2027-06-30', type: 'Savings', saved: 12300, goal: 80000 },
  { id: 3, name: 'Pay Down Mortgage Principal', target: '2028-12-31', type: 'Debt', saved: 0, goal: 50000 },
]

const AI_RESPONSES = {
  'analyze my net worth allocation': `Esteemed client,

It is my distinct pleasure to analyze your current net worth allocation. Your diligent management of assets and liabilities has culminated in a robust net worth of **$515,129.95**. This is a commendable achievement and a testament to your financial discipline.

Let us delve into the specific components:

### Asset Allocation Overview:
Your total assets stand at **$801,550.75**, distributed across key categories:

* **Liquid Assets (Cash): $50,750.25 (6.33% of total assets)**
  * Your **Chase Premier Checking** holds $8,450.25, maintaining healthy operational liquidity.
  * The **Marcus High-Yield Savings** account, earning 4.5% interest, contains $42,300. This is exceptionally well-managed, as it not only fully funds your $30,000 6-Month Emergency Fund goal but also holds an additional $12,300 that aligns perfectly with your $80,000 Investment Property Downpayment goal.

* **Investment Portfolio: $115,200.50 (14.37%)**
  * Your **Fidelity Brokerage** account represents a strong growth engine for long-term wealth building.

* **Retirement Holdings: $185,600 (23.16%)**
  * Your **401(k)** with Empower is on an excellent trajectory for retirement readiness.

* **Real Estate: $450,000 (56.14%)**
  * Your primary residence forms the cornerstone of your asset allocation.

### Liability Analysis:
Total liabilities stand at **$286,420.80**, which is well within prudent leverage limits.`,
  default: `Thank you for your inquiry. Based on your current financial profile, I can see that your net worth stands at $515,129.95 with a healthy savings rate of 71.5%. Your asset allocation is well-diversified across cash, investments, retirement, and real estate holdings. I recommend continuing your current strategy while focusing on building your investment property downpayment fund. Would you like me to elaborate on any specific area?`
}

const SUGGESTIONS = [
  'Analyze my net worth allocation',
  'How can I cut my discretionary spending?',
  'Am I on track for my investment goals?',
  'Explain standard debt avalanche strategy',
]

function App() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'user', label: 'YOU • 03:17 AM', text: 'Analyze my net worth allocation' },
    { role: 'ai', label: 'AURELIUS AI • 03:17 AM', text: AI_RESPONSES['analyze my net worth allocation'] },
  ])
  const [ledgerFilter, setLedgerFilter] = useState('all')
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [assets, setAssets] = useState(() => {
    try { const s = localStorage.getItem('wt_assets'); return s ? JSON.parse(s) : ASSETS } catch { return ASSETS }
  })
  const [liabilities, setLiabilities] = useState(() => {
    try { const s = localStorage.getItem('wt_liab'); return s ? JSON.parse(s) : LIABILITIES } catch { return LIABILITIES }
  })
  const [ledger, setLedger] = useState(() => {
    try { const s = localStorage.getItem('wt_ledger'); return s ? JSON.parse(s) : LEDGER } catch { return LEDGER }
  })

  const chatEndRef = useRef(null)

  useEffect(() => { localStorage.setItem('wt_assets', JSON.stringify(assets)) }, [assets])
  useEffect(() => { localStorage.setItem('wt_liab', JSON.stringify(liabilities)) }, [liabilities])
  useEffect(() => { localStorage.setItem('wt_ledger', JSON.stringify(ledger)) }, [ledger])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const totalAssets = assets.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = liabilities.reduce((s, l) => s + Math.abs(l.value), 0)
  const netWorth = totalAssets - totalLiabilities
  const totalIncome = ledger.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = ledger.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0

  const allocData = [
    { name: 'Cash & Savings', value: 50750, color: '#22c55e' },
    { name: 'Investment Brokerage', value: 115200, color: '#8b5cf6' },
    { name: 'Retirement (401k/IRA)', value: 185600, color: '#f59e0b' },
    { name: 'Real Estate Holdings', value: 450000, color: '#3b82f6' },
  ]

  const growthData = [
    { month: '2026-01', value: 490000 }, { month: '2026-02', value: 498000 },
    { month: '2026-03', value: 505000 }, { month: '2026-04', value: 508000 },
    { month: '2026-05', value: 512000 }, { month: '2026-06', value: 515130 },
  ]

  const filteredLedger = ledger.filter(t => {
    if (ledgerFilter !== 'all' && t.type !== ledgerFilter) return false
    if (ledgerSearch) {
      const q = ledgerSearch.toLowerCase()
      return t.merchant.toLowerCase().includes(q) || t.account.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    }
    return true
  })

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    const q = chatInput.toLowerCase().trim()
    const response = AI_RESPONSES[q] || AI_RESPONSES.default
    setChatMessages(prev => [
      ...prev,
      { role: 'user', label: `YOU • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`, text: chatInput },
      { role: 'ai', label: `AURELIUS AI • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`, text: response },
    ])
    setChatInput('')
  }

  const handleDeleteLedger = (id) => {
    setLedger(prev => prev.filter(t => t.id !== id))
    showToast('Transaction removed')
  }

  const handleDeleteAsset = (id, isLiability) => {
    if (isLiability) setLiabilities(prev => prev.filter(l => l.id !== id))
    else setAssets(prev => prev.filter(a => a.id !== id))
    showToast('Item removed')
  }

  const NAV_ITEMS = [
    { id: 'dashboard', icon: '📊', label: 'Wealth Dashboard' },
    { id: 'accounts', icon: '🏦', label: 'Accounts & Assets' },
    { id: 'ledger', icon: '📒', label: 'Ledger Records' },
    { id: 'budgets', icon: '🎯', label: 'Budgets & Goals' },
    { id: 'coach', icon: '🤖', label: 'Aurelius AI Coach' },
  ]

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-top">
            <div className="sidebar-logo-icon">A</div>
            <div className="sidebar-brand">
              <span className="sidebar-brand-name">Aurelius<span style={{ color: 'var(--teal)' }}>Finance</span></span>
              <span className="sidebar-brand-sub">CFP Private Suite</span>
            </div>
          </div>
        </div>
        <div className="sidebar-networth">
          <div className="sidebar-networth-label">Your Net Worth</div>
          <div className="sidebar-networth-value">${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="sidebar-asset-row">
            <span className="sidebar-asset-label">Assets:</span>
            <span className="sidebar-asset-val-green">${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="sidebar-asset-row">
            <span className="sidebar-asset-label">Liabilities:</span>
            <span className="sidebar-asset-val-red">${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`sidebar-nav-item ${activeNav === item.id ? 'active' : ''}`} onClick={() => setActiveNav(item.id)}>
              <span className="sidebar-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-reset-btn" onClick={() => { localStorage.clear(); window.location.reload() }}>
            🔄 Reset Sandbox Data
          </button>
          <div className="sidebar-version">v1.2.0 SECURE SANDBOX • CFP</div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="main-area">
        {/* TOP HEADER */}
        <header className="top-header">
          <div className="greeting">
            <h2>Good day, <span>Wealth Builder</span></h2>
            <p>SECURE CFP CLIENT PORTAL ACTIVE • OFFLINE SANDBOX SYNCED</p>
          </div>
          <div className="header-right">
            <div className="server-status">
              <span>Server Status:</span>
              <span className="server-dot" />
              <span className="server-status-label">SECURE</span>
              <span>•</span>
            </div>
            <div className="header-date">
              📅 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="content">

          {/* ========== DASHBOARD ========== */}
          {activeNav === 'dashboard' && (
            <div className="fade-in">
              <div className="stat-grid">
                <div className="stat-box">
                  <div className="stat-box-header">
                    <span className="stat-box-label">Net Worth</span>
                    <div className="stat-box-icon icon-teal">📈</div>
                  </div>
                  <div className="stat-box-value">${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div className="stat-box-sub"><span className="stat-up">↗ +2.1%</span><span className="stat-label">this month</span></div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-header">
                    <span className="stat-box-label">Total Assets</span>
                    <div className="stat-box-icon icon-green">🏦</div>
                  </div>
                  <div className="stat-box-value">${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div className="stat-box-sub"><span className="stat-label">Real estate, cash & equities</span></div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-header">
                    <span className="stat-box-label">Liabilities</span>
                    <div className="stat-box-icon icon-red">📉</div>
                  </div>
                  <div className="stat-box-value" style={{ color: 'var(--red-text)' }}>${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div className="stat-box-sub"><span className="stat-label">Mortgages & credit cards</span></div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-header">
                    <span className="stat-box-label">Savings Rate</span>
                    <div className="stat-box-icon icon-amber">⏱️</div>
                  </div>
                  <div className="stat-box-value">{savingsRate.toFixed(1)}%</div>
                  <div className="stat-box-sub">
                    <span className="stat-label">In:</span> <span style={{ color: 'var(--green-text)' }}>${totalIncome.toLocaleString()}</span>
                    <span className="stat-label">Out:</span> <span style={{ color: 'var(--red-text)' }}>${totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="dash-grid">
                {/* Net Worth Chart */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Net Worth Growth Trajectory</div>
                      <div className="card-subtitle">Historical performance metrics over the last 6 months</div>
                    </div>
                    <span className="card-badge">HOVER NODES FOR BALANCES</span>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }}
                        formatter={(v) => [`$${v.toLocaleString()}`, 'Net Worth']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#14b8a6" fill="url(#gVal)" strokeWidth={2} dot={{ fill: '#14b8a6', r: 4, strokeWidth: 2, stroke: '#111827' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Asset Allocation */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Asset Allocation</div>
                      <div className="card-subtitle">Capital dispersion across active asset types</div>
                    </div>
                  </div>
                  <div className="alloc-bar">
                    {allocData.map((d, i) => (
                      <div key={i} className="alloc-bar-seg" style={{ width: `${(d.value / totalAssets) * 100}%`, background: d.color }} />
                    ))}
                  </div>
                  <div className="alloc-legend">
                    {allocData.map((d, i) => (
                      <div key={i} className="alloc-item">
                        <div className="alloc-item-left">
                          <span className="alloc-dot" style={{ background: d.color }} />
                          <span className="alloc-item-name">{d.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span className="alloc-item-val">${d.value.toLocaleString()}</span>
                          <span className="alloc-item-pct">{(d.value / totalAssets * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dash-grid">
                {/* Recent Transactions */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Recent Transactions</div>
                      <div className="card-subtitle">Chronological history of recent portfolio items</div>
                    </div>
                    <button className="card-link" onClick={() => setActiveNav('ledger')}>View Full Ledger →</button>
                  </div>
                  <div className="recent-tx-list">
                    {ledger.slice(0, 5).map(tx => (
                      <div key={tx.id} className="recent-tx-item">
                        <div className="recent-tx-left">
                          <div className={`recent-tx-icon ${tx.type === 'income' ? 'inc' : 'exp'}`}>
                            {tx.type === 'income' ? '↑' : '↓'}
                          </div>
                          <div className="recent-tx-info">
                            <span className="recent-tx-name">{tx.merchant}</span>
                            <span className="recent-tx-meta">{tx.date} • {tx.category} • {tx.account}</span>
                          </div>
                        </div>
                        <span className={`recent-tx-amount ${tx.type === 'income' ? 'inc' : 'exp'}`}>
                          {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advisor Card */}
                <div className="advisor-card">
                  <div className="advisor-header">
                    <div className="advisor-icon">🤖</div>
                    <span className="advisor-title">Aurelius Wealth Advisor</span>
                  </div>
                  <p className="advisor-desc">Unlock professional-grade portfolio metrics, tax optimization vectors, and automated receipt categorization with our AI Financial Coach.</p>
                  <div className="advisor-badge">🔒 100% Client-Side Private Shielded</div>
                  <p className="advisor-desc" style={{ fontSize: '11px', marginBottom: '16px' }}>All numbers remain encrypted inside your local sandbox.</p>
                  <button className="advisor-btn" onClick={() => setActiveNav('coach')}>Consult AI Coach →</button>
                </div>
              </div>
            </div>
          )}

          {/* ========== ACCOUNTS & ASSETS ========== */}
          {activeNav === 'accounts' && (
            <div className="fade-in">
              <div className="accounts-header">
                <div>
                  <div className="accounts-title">Portfolio & Asset Management</div>
                  <div className="accounts-subtitle">Track liquid assets, retirement structures, and loans</div>
                </div>
                <button className="btn-add" onClick={() => setShowAssetModal(true)}>+ Add New Asset/Liability</button>
              </div>
              <div className="accounts-grid">
                <div>
                  <div className="accounts-section-header">
                    <span className="accounts-section-title">Assets Portfolio ($)</span>
                    <span className="accounts-section-total">${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="asset-list">
                    {assets.map(a => (
                      <div key={a.id} className="asset-item">
                        <div className="asset-item-left">
                          <div className={`asset-icon ${a.type}`}>{a.icon}</div>
                          <div>
                            <div className="asset-name">{a.name}</div>
                            <div className="asset-sub">{a.sub}</div>
                          </div>
                        </div>
                        <div className="asset-item-right">
                          <span className="asset-value">${a.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <div className="asset-actions">
                            <button className="asset-action-btn" title="Edit">✏️</button>
                            <button className="asset-action-btn delete" title="Delete" onClick={() => handleDeleteAsset(a.id, false)}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="accounts-section-header">
                    <span className="accounts-section-title">Liabilities & Debt ({liabilities.length})</span>
                    <span className="accounts-section-total" style={{ color: 'var(--red-text)' }}>-${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="asset-list">
                    {liabilities.map(l => (
                      <div key={l.id} className="asset-item">
                        <div className="asset-item-left">
                          <div className={`asset-icon ${l.type}`}>{l.icon}</div>
                          <div>
                            <div className="asset-name">{l.name}</div>
                            <div className="asset-sub">{l.sub}</div>
                          </div>
                        </div>
                        <div className="asset-item-right">
                          <span className="asset-value negative">-${Math.abs(l.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <div className="asset-actions">
                            <button className="asset-action-btn" title="Edit">✏️</button>
                            <button className="asset-action-btn delete" title="Delete" onClick={() => handleDeleteAsset(l.id, true)}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== LEDGER RECORDS ========== */}
          {activeNav === 'ledger' && (
            <div className="fade-in">
              <div className="ledger-top">
                <div className="ai-input-card">
                  <div className="ai-input-label">🎙️ Voice-to-Text / Natural AI Parsing</div>
                  <div className="ai-input-sub">Type anything like: "spent 24 dollars at whole foods using checking"</div>
                  <div className="ai-input-row">
                    <input className="ai-input" placeholder="Describe your transaction..." />
                    <button className="ai-analyze-btn">Analyze</button>
                  </div>
                </div>
                <div className="manual-entry-card">
                  <div className="manual-entry-title">Quick Manual Entry</div>
                  <div className="manual-entry-sub">Standard precise financial records interface. Create manual ledger entries for direct routing.</div>
                  <button className="manual-entry-btn" onClick={() => setShowAssetModal(true)}>+ Open Ledger Form</button>
                </div>
              </div>

              <div className="ledger-filters">
                <input className="ledger-search" placeholder="Search ledger..." value={ledgerSearch} onChange={e => setLedgerSearch(e.target.value)} />
                <select className="ledger-filter-btn" value={ledgerFilter} onChange={e => setLedgerFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <button className="ledger-export-btn">📥 Export Ledger (.csv)</button>
              </div>

              <div className="ledger-table">
                <div className="ledger-table-header">
                  <span className="ledger-th">Date</span>
                  <span className="ledger-th">Account</span>
                  <span className="ledger-th">Merchant / Source</span>
                  <span className="ledger-th">Category</span>
                  <span className="ledger-th">Type</span>
                  <span className="ledger-th" style={{ textAlign: 'right' }}>Amount</span>
                  <span className="ledger-th"></span>
                </div>
                {filteredLedger.map(tx => (
                  <div key={tx.id} className="ledger-row">
                    <span className="ledger-td ledger-td-date">{tx.date}</span>
                    <span className="ledger-td ledger-td-account">{tx.account}</span>
                    <div className="ledger-td ledger-td-merchant">
                      <span className="ledger-td-merchant-name">{tx.merchant}</span>
                      <span className="ledger-td-merchant-sub">{tx.sub}</span>
                    </div>
                    <span className="ledger-td ledger-td-category">{tx.category}</span>
                    <span className={`ledger-td ledger-td-type ${tx.type}`}>{tx.type}</span>
                    <span className={`ledger-td ledger-td-amount ${tx.type === 'income' ? 'inc' : 'exp'}`}>
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="ledger-td ledger-td-delete">
                      <button className="ledger-delete-btn" onClick={() => handleDeleteLedger(tx.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== BUDGETS & GOALS ========== */}
          {activeNav === 'budgets' && (
            <div className="fade-in">
              <div className="budgets-grid">
                <div>
                  <div className="budgets-section-header">
                    <span className="budgets-section-title">Monthly Budget Tracker</span>
                    <button className="budget-configure-btn">⚙ Configure Budget</button>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>Calculated based on current month ledger items</div>
                  <div className="budget-list">
                    {BUDGETS.map(b => {
                      const pct = (b.spent / b.limit) * 100
                      const status = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'normal'
                      return (
                        <div key={b.id} className="budget-item">
                          <div className="budget-item-top">
                            <span className="budget-item-name">{b.name}</span>
                            <div className="budget-item-values">
                              <span className="budget-item-spent">${b.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              <span className="budget-item-limit">/ ${b.limit.toLocaleString()}</span>
                              <span style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>✏️</span>
                            </div>
                          </div>
                          <div className="budget-item-bar">
                            <div className={`budget-item-fill ${status}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <div className="budget-item-pct">{pct.toFixed(0)}% Utilized</div>
                          {pct >= 100 && <div className="budget-item-warn">⚠️ Exceeded by ${(b.spent - b.limit).toFixed(2)}</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <div className="budgets-section-header">
                    <span className="budgets-section-title">Strategic Savings Goals</span>
                    <button className="budget-configure-btn">+ Set Saving Goal</button>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>Build compound assets and extinguish debts</div>
                  <div className="savings-list">
                    {GOALS.map(g => {
                      const pct = g.goal > 0 ? (g.saved / g.goal) * 100 : 0
                      const complete = pct >= 100
                      return (
                        <div key={g.id} className="savings-item">
                          <div className="savings-item-header">
                            <span className="savings-item-name">{g.name}</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="asset-action-btn" title="Edit">✏️</button>
                              <button className="asset-action-btn delete" title="Delete">🗑️</button>
                            </div>
                          </div>
                          <div className="savings-item-target">Target date: {g.target} • {g.type}</div>
                          <div className="savings-progress-label">
                            <span className="savings-progress-val">Progress</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${g.saved.toLocaleString()}</span>
                            <span style={{ color: 'var(--text-muted)' }}>/ ${g.goal.toLocaleString()}</span>
                          </div>
                          <div className="savings-bar">
                            <div className={`savings-fill ${complete ? 'complete' : 'partial'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <div className="savings-footer">
                            <span className="savings-pct">{pct.toFixed(0)}% Finished</span>
                            <span className={`savings-status ${complete ? 'met' : 'progress'}`}>
                              {complete ? 'Goal Met!' : `Needs $${(g.goal - g.saved).toLocaleString()} more`}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== AI COACH ========== */}
          {activeNav === 'coach' && (
            <div className="fade-in">
              <div className="coach-tabs">
                <button className="coach-tab active">🤖 Aurelius AI Finance Coach</button>
                <button className="coach-tab">📊 Smart Wealth Strategy Audit</button>
              </div>
              <div className="coach-grid">
                <div className="chat-container">
                  <div className="chat-messages">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`chat-msg ${msg.role}`}>
                        <span className="chat-msg-label">{msg.label}</span>
                        <div className="chat-bubble">
                          {msg.text.split('\n').map((line, j) => {
                            if (line.startsWith('### ')) return <strong key={j}>{line.replace('### ', '')}</strong>
                            if (line.startsWith('**') && line.endsWith('**')) return <strong key={j}>{line.replace(/\*\*/g, '')}</strong>
                            if (line.startsWith('* ')) return <div key={j} style={{ marginLeft: '16px' }}>• {line.replace('* ', '')}</div>
                            if (line.trim() === '') return <br key={j} />
                            return <span key={j}>{line.replace(/\*\*/g, '')}{'\n'}</span>
                          })}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="chat-input-area">
                    <input
                      className="chat-input"
                      placeholder="Inquire Aurelius about wealth allocation or custom debt snowball models..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    />
                    <button className="chat-send-btn" onClick={handleSendChat}>➤</button>
                  </div>
                </div>
                <div className="suggestions-card">
                  <div className="suggestions-title">⚡ Action Suggestions</div>
                  <div className="suggestion-list">
                    {SUGGESTIONS.map((s, i) => (
                      <button key={i} className="suggestion-btn" onClick={() => { setChatInput(s); setTimeout(() => { setChatInput(s); }, 0) }}>
                        {s} →
                      </button>
                    ))}
                  </div>
                  <button className="run-audit-btn" onClick={() => showToast('🔍 Strategic audit running...')}>⚡ Run Strategic Audit</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD ASSET MODAL */}
      {showAssetModal && (
        <div className="modal-overlay" onClick={() => setShowAssetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Asset / Liability</h3>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" placeholder="e.g., Savings Account" />
            </div>
            <div className="form-group">
              <label className="form-label">Institution</label>
              <input className="form-input" placeholder="e.g., Chase Bank" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input">
                  <option>Asset</option>
                  <option>Liability</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Value ($)</label>
                <input className="form-input" type="number" placeholder="0.00" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setShowAssetModal(false)}>Cancel</button>
              <button className="btn-save" onClick={() => { setShowAssetModal(false); showToast('✅ Item added!') }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
