import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import './App.css'

const SAMPLE_TX = [
  { id: 1, date: '2026-06-15', name: 'Tech Corp Inc', category: 'Salary', type: 'income', amount: 5400 },
  { id: 2, date: '2026-06-01', name: 'Tech Corp Inc', category: 'Salary', type: 'income', amount: 5400 },
  { id: 3, date: '2026-06-01', name: 'Metropolitan Rentals', category: 'Housing & Rent', type: 'expense', amount: -1420 },
  { id: 4, date: '2026-06-12', name: 'Whole Foods Market', category: 'Groceries', type: 'expense', amount: -85.50 },
  { id: 5, date: '2026-06-18', name: "Trader Joe's", category: 'Groceries', type: 'expense', amount: -124.20 },
  { id: 6, date: '2026-06-14', name: 'The Steakhouse', category: 'Food & Dining', type: 'expense', amount: -145 },
  { id: 7, date: '2026-06-25', name: 'Starbucks Coffee', category: 'Food & Dining', type: 'expense', amount: -18.75 },
  { id: 8, date: '2026-06-20', name: 'Netflix', category: 'Entertainment', type: 'expense', amount: -15.99 },
  { id: 9, date: '2026-06-08', name: 'Electric Company', category: 'Utilities', type: 'expense', amount: -64.30 },
  { id: 10, date: '2026-06-22', name: 'Uber', category: 'Transport', type: 'expense', amount: -42.50 },
]

const CATEGORIES = ['Salary', 'Housing & Rent', 'Groceries', 'Food & Dining', 'Entertainment', 'Utilities', 'Transport', 'Shopping', 'Health', 'Other']

const FEATURES = [
  { icon: '📊', title: 'Visual Analytics', desc: 'Beautiful charts and graphs that give you instant insight into your spending patterns and financial health.' },
  { icon: '🔒', title: 'Bank-Grade Security', desc: 'Your data stays private with encrypted storage. Each user has their own isolated, secure dashboard.' },
  { icon: '⚡', title: 'Real-Time Tracking', desc: 'Log income and expenses instantly. See your balance update in real-time across all categories.' },
  { icon: '🎯', title: 'Budget Management', desc: 'Set monthly budgets per category and get alerts before you overspend. Stay in control always.' },
  { icon: '💡', title: 'Smart Tips', desc: 'Get AI-powered financial advice tailored to your spending habits to maximize savings.' },
  { icon: '📱', title: 'Fully Responsive', desc: 'Access your finances from any device — desktop, tablet, or mobile. Your data follows you.' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: '12px 16px', fontSize: 12 }}>
      {label && <div style={{ color: '#64748b', marginBottom: 6 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: '#f1f5f9', fontWeight: 600 }}>${p.value?.toLocaleString()}</div>
      ))}
    </div>
  )
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem('wt_users')) || [] } catch { return [] }
}
function saveUsers(u) { localStorage.setItem('wt_users', JSON.stringify(u)) }

function App() {
  const [page, setPage] = useState('landing')
  const [authPage, setAuthPage] = useState('login')
  const [currentUser, setCurrentUser] = useState(null)
  const [dashTab, setDashTab] = useState('overview')
  const [toast, setToast] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  const [txForm, setTxForm] = useState({ date: new Date().toISOString().split('T')[0], name: '', category: 'Other', type: 'expense', amount: '' })

  const [txList, setTxList] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('wt_current'))
      if (user) {
        const data = localStorage.getItem(`wt_tx_${user.email}`)
        return data ? JSON.parse(data) : SAMPLE_TX
      }
      return SAMPLE_TX
    } catch { return SAMPLE_TX }
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('wt_current'))
    if (user) {
      setCurrentUser(user)
      setPage('dashboard')
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`wt_tx_${currentUser.email}`, JSON.stringify(txList))
    }
  }, [txList, currentUser])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleAuth = (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthSuccess('')

    if (authPage === 'signup') {
      if (!authForm.name || !authForm.email || !authForm.password) {
        setAuthError('All fields are required'); return
      }
      const users = getUsers()
      if (users.find(u => u.email === authForm.email)) {
        setAuthError('Account already exists with this email'); return
      }
      const user = { name: authForm.name, email: authForm.email, password: authForm.password }
      users.push(user)
      saveUsers(users)
      setAuthSuccess('Account created! Redirecting to login...')
      setTimeout(() => { setAuthPage('login'); setAuthForm({ name: '', email: authForm.email, password: '' }); setAuthSuccess('') }, 1500)
    } else {
      if (!authForm.email || !authForm.password) {
        setAuthError('Email and password are required'); return
      }
      const users = getUsers()
      const user = users.find(u => u.email === authForm.email && u.password === authForm.password)
      if (!user) {
        setAuthError('Invalid email or password'); return
      }
      localStorage.setItem('wt_current', JSON.stringify(user))
      setCurrentUser(user)
      setPage('dashboard')
      setAuthForm({ name: '', email: '', password: '' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('wt_current')
    setCurrentUser(null)
    setPage('landing')
    setDashTab('overview')
  }

  const handleTxSubmit = (e) => {
    e.preventDefault()
    if (!txForm.name || !txForm.amount) return
    const amt = parseFloat(txForm.amount)
    if (editItem) {
      setTxList(prev => prev.map(t => t.id === editItem.id ? { ...t, ...txForm, amount: txForm.type === 'income' ? Math.abs(amt) : -Math.abs(amt) } : t))
      showToast('✅ Transaction updated!')
    } else {
      setTxList(prev => [{ id: Date.now(), ...txForm, amount: txForm.type === 'income' ? Math.abs(amt) : -Math.abs(amt) }, ...prev])
      showToast('✅ Transaction added!')
    }
    setTxForm({ date: new Date().toISOString().split('T')[0], name: '', category: 'Other', type: 'expense', amount: '' })
    setEditItem(null)
    setShowModal(false)
  }

  const handleDelete = (id) => {
    setTxList(prev => prev.filter(t => t.id !== id))
    showToast('🗑️ Transaction removed')
  }

  const handleEdit = (tx) => {
    setTxForm({ date: tx.date, name: tx.name, category: tx.category, type: tx.type, amount: Math.abs(tx.amount) })
    setEditItem(tx)
    setShowModal(true)
  }

  const totalIncome = txList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = txList.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
  const balance = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0

  const catBreakdown = CATEGORIES.map(c => ({
    name: c,
    value: txList.filter(t => t.category === c && t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
  })).filter(c => c.value > 0).sort((a, b) => b.value - a.value)

  const COLORS = ['#14b8a6', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#22c55e', '#ef4444', '#06b6d4', '#f97316', '#6366f1']

  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i)
    const m = d.getMonth(), y = d.getFullYear()
    const label = d.toLocaleString('en', { month: 'short' })
    const inc = txList.filter(t => t.type === 'income' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s, t) => s + t.amount, 0)
    const exp = txList.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s, t) => s + Math.abs(t.amount), 0)
    monthlyData.push({ month: label, income: inc, expense: exp })
  }

  const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || 'U'

  /* ========== LANDING PAGE ========== */
  if (page === 'landing') {
    return (
      <div className="landing">
        <nav className="navbar">
          <a className="nav-logo" href="#">
            <div className="nav-logo-icon">W</div>
            <div className="nav-logo-text">Wealth<span>Track</span></div>
          </a>
          <div className="nav-links">
            <button className="btn btn-ghost" onClick={() => { setAuthPage('login'); setPage('auth') }}>Log In</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setAuthPage('signup'); setPage('auth') }}>Get Started</button>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">✨ Trusted by 10,000+ users worldwide</div>
            <h1>Take Control of Your <span>Financial Future</span></h1>
            <p>Track income, manage expenses, set budgets, and grow your wealth — all from one powerful, beautifully designed dashboard.</p>
            <div className="hero-btns">
              <button className="btn btn-primary btn-lg" onClick={() => { setAuthPage('signup'); setPage('auth') }}>Start Free — Sign Up</button>
              <button className="btn btn-outline btn-lg" onClick={() => { setAuthPage('login'); setPage('auth') }}>I Have an Account</button>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="features-title">Features</div>
          <h2 className="features-heading">Everything You Need to Manage Money</h2>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">$2.4M+</div>
              <div className="stat-label">Assets Tracked</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9★</div>
              <div className="stat-label">User Rating</div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-box">
            <h2>Ready to Build Wealth?</h2>
            <p>Join thousands of users who are taking control of their finances with WealthTrack.</p>
            <button className="btn btn-primary btn-lg" onClick={() => { setAuthPage('signup'); setPage('auth') }}>Get Started — It's Free</button>
          </div>
        </section>

        <footer className="footer">
          <div>© 2026 WealthTrack. All rights reserved.</div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </div>
        </footer>
      </div>
    )
  }

  /* ========== AUTH PAGES ========== */
  if (page === 'auth') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <a className="auth-logo" href="#" onClick={(e) => { e.preventDefault(); setPage('landing') }}>
            <div className="nav-logo-icon">W</div>
            <div className="nav-logo-text">Wealth<span>Track</span></div>
          </a>
          <h2 className="auth-title">{authPage === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="auth-subtitle">
            {authPage === 'login'
              ? 'Log in to access your financial dashboard.'
              : 'Sign up to start tracking your finances.'}
          </p>

          {authError && <div className="auth-error">{authError}</div>}
          {authSuccess && <div className="auth-success">{authSuccess}</div>}

          <form className="auth-form" onSubmit={handleAuth}>
            {authPage === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="John Doe" value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary auth-btn">
              {authPage === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            {authPage === 'login' ? (
              <>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); setAuthPage('signup'); setAuthError(''); setAuthSuccess('') }}>Sign Up</a></>
            ) : (
              <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setAuthPage('login'); setAuthError(''); setAuthSuccess('') }}>Log In</a></>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ========== DASHBOARD ========== */
  return (
    <div className="dash-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <a className="nav-logo" href="#" onClick={e => e.preventDefault()}>
            <div className="nav-logo-icon">W</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">WealthTrack</div>
            </div>
          </a>
        </div>
        <div className="sidebar-header" style={{ paddingTop: 0 }}>
          <div className="sidebar-user">
            <div className="sidebar-avatar">{userInitial}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{currentUser?.name}</div>
              <div className="sidebar-user-email">{currentUser?.email}</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Menu</div>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'transactions', icon: '📒', label: 'Transactions' },
            { id: 'analytics', icon: '📈', label: 'Analytics' },
            { id: 'tips', icon: '💡', label: 'Smart Tips' },
          ].map(n => (
            <button key={n.id} className={`sidebar-nav-btn ${dashTab === n.id ? 'active' : ''}`} onClick={() => setDashTab(n.id)}>
              <span className="sidebar-nav-icon">{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>🚪 Log Out</button>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <h2>Good day, {currentUser?.name?.split(' ')[0] || 'User'} 👋</h2>
            <p>Here's your financial overview</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setTxForm({ date: new Date().toISOString().split('T')[0], name: '', category: 'Other', type: 'expense', amount: '' }); setShowModal(true) }}>+ Add Transaction</button>
        </header>

        <div className="dash-content">
          {/* OVERVIEW */}
          {dashTab === 'overview' && (
            <div style={{ animation: 'heroFadeIn 0.4s ease' }}>
              <div className="stat-grid">
                <div className="stat-box">
                  <div className="stat-box-header">
                    <span className="stat-box-label">Balance</span>
                    <div className="stat-box-icon teal">💰</div>
                  </div>
                  <div className="stat-box-value" style={{ color: balance >= 0 ? 'var(--green-text)' : 'var(--red-text)' }}>
                    {balance >= 0 ? '+' : ''}${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="stat-box-sub">Current balance</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-header">
                    <span className="stat-box-label">Income</span>
                    <div className="stat-box-icon green">📈</div>
                  </div>
                  <div className="stat-box-value" style={{ color: 'var(--green-text)' }}>+${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div className="stat-box-sub">{txList.filter(t => t.type === 'income').length} transactions</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-header">
                    <span className="stat-box-label">Expenses</span>
                    <div className="stat-box-icon red">📉</div>
                  </div>
                  <div className="stat-box-value" style={{ color: 'var(--red-text)' }}>${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div className="stat-box-sub">{txList.filter(t => t.type === 'expense').length} transactions</div>
                </div>
                <div className="stat-box">
                  <div className="stat-box-header">
                    <span className="stat-box-label">Savings Rate</span>
                    <div className="stat-box-icon purple">🎯</div>
                  </div>
                  <div className="stat-box-value">{savingsRate.toFixed(1)}%</div>
                  <div className="stat-box-sub">of total income</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, marginBottom: 24 }}>
                <div className="data-card" style={{ padding: 22 }}>
                  <div className="data-card-header" style={{ padding: '0 0 16px', border: 'none' }}>
                    <span className="data-card-title">Monthly Trend</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="income" stroke="#14b8a6" fill="url(#gI)" strokeWidth={2} />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#gE)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="data-card" style={{ padding: 22 }}>
                  <div className="data-card-header" style={{ padding: '0 0 16px', border: 'none' }}>
                    <span className="data-card-title">Spending Breakdown</span>
                  </div>
                  {catBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={catBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" animationDuration={800}>
                          {catBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="data-empty">No expenses yet</div>
                  )}
                </div>
              </div>

              <div className="data-card">
                <div className="data-card-header">
                  <span className="data-card-title">Recent Transactions</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDashTab('transactions')}>View All →</button>
                </div>
                {txList.slice(0, 5).map(tx => (
                  <div key={tx.id} className="data-row" style={{ gridTemplateColumns: '100px 1fr 140px 100px 120px' }}>
                    <span className="data-td data-td-date">{tx.date}</span>
                    <span className="data-td data-td-name">{tx.name}</span>
                    <span className="data-td-category">{tx.category}</span>
                    <span className={`data-td-type ${tx.type}`}>{tx.type}</span>
                    <span className={`data-td-amount ${tx.type === 'income' ? 'inc' : 'exp'}`}>
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRANSACTIONS */}
          {dashTab === 'transactions' && (
            <div style={{ animation: 'heroFadeIn 0.4s ease' }}>
              <div className="data-card">
                <div className="data-card-header">
                  <span className="data-card-title">All Transactions</span>
                  <span className="data-card-count">{txList.length} total</span>
                </div>
                <div className="data-table-header">
                  <span className="data-th">Date</span>
                  <span className="data-th">Merchant / Source</span>
                  <span className="data-th">Category</span>
                  <span className="data-th">Type</span>
                  <span className="data-th" style={{ textAlign: 'right' }}>Amount</span>
                  <span className="data-th"></span>
                </div>
                {txList.map(tx => (
                  <div key={tx.id} className="data-row">
                    <span className="data-td data-td-date">{tx.date}</span>
                    <span className="data-td data-td-name">{tx.name}</span>
                    <span className="data-td-category">{tx.category}</span>
                    <span className={`data-td-type ${tx.type}`}>{tx.type}</span>
                    <span className={`data-td-amount ${tx.type === 'income' ? 'inc' : 'exp'}`}>
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="data-actions">
                      <button className="data-action-btn" onClick={() => handleEdit(tx)} title="Edit">✏️</button>
                      <button className="data-action-btn del" onClick={() => handleDelete(tx.id)} title="Delete">✕</button>
                    </div>
                  </div>
                ))}
                {txList.length === 0 && <div className="data-empty">No transactions yet. Click "Add Transaction" to start.</div>}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {dashTab === 'analytics' && (
            <div style={{ animation: 'heroFadeIn 0.4s ease' }}>
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 24 }}>
                <div className="data-card" style={{ padding: 22 }}>
                  <div className="data-card-header" style={{ padding: '0 0 16px', border: 'none' }}>
                    <span className="data-card-title">Income vs Expense</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="gI2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gE2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="income" stroke="#14b8a6" fill="url(#gI2)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#gE2)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="data-card" style={{ padding: 22 }}>
                  <div className="data-card-header" style={{ padding: '0 0 16px', border: 'none' }}>
                    <span className="data-card-title">Category Breakdown</span>
                  </div>
                  {catBreakdown.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                      {catBreakdown.map((c, i) => {
                        const pct = totalExpense > 0 ? (c.value / totalExpense * 100) : 0
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 110 }}>{c.name}</span>
                            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3, transition: 'width 0.8s ease' }} />
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, minWidth: 50, textAlign: 'right' }}>${c.value.toLocaleString()}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-dim)', minWidth: 38, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="data-empty">No data yet</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TIPS */}
          {dashTab === 'tips' && (
            <div style={{ animation: 'heroFadeIn 0.4s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {[
                  'Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
                  'Build an emergency fund covering 3-6 months of expenses.',
                  'Track every expense for 30 days to find 20-30% savings.',
                  'Automate savings on payday — pay yourself first.',
                  'Review subscriptions monthly and cancel unused ones.',
                  'Pay off high-interest debt first (avalanche method).',
                  'Start investing early — compound interest is powerful.',
                  'Set specific financial goals with deadlines.',
                  'Use the 24-hour rule before non-essential purchases.',
                  'Cook at home more — saves 40-60% vs dining out.',
                ].map((tip, i) => (
                  <div key={i} className="data-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--accent), #06b6d4)', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.3s', }} className="tip-bar" />
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'rgba(20,184,166,0.1)', color: 'var(--accent)', fontSize: 12, fontWeight: 800, marginBottom: 12 }}>#{i + 1}</div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditItem(null) }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editItem ? 'Edit Transaction' : 'Add Transaction'}</h3>
            <form onSubmit={handleTxSubmit}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button type="button" onClick={() => setTxForm(f => ({ ...f, type: 'expense' }))} className="btn btn-sm" style={{ border: `2px solid ${txForm.type === 'expense' ? 'var(--red)' : 'var(--border)'}`, background: txForm.type === 'expense' ? 'rgba(239,68,68,0.08)' : 'transparent', color: txForm.type === 'expense' ? 'var(--red-text)' : 'var(--text-muted)' }}>💸 Expense</button>
                  <button type="button" onClick={() => setTxForm(f => ({ ...f, type: 'income' }))} className="btn btn-sm" style={{ border: `2px solid ${txForm.type === 'income' ? 'var(--green)' : 'var(--border)'}`, background: txForm.type === 'income' ? 'rgba(34,197,94,0.08)' : 'transparent', color: txForm.type === 'income' ? 'var(--green-text)' : 'var(--text-muted)' }}>💰 Income</button>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Merchant / Source</label>
                <input className="form-input" placeholder="e.g., Starbucks, Salary" value={txForm.name} onChange={e => setTxForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Category</label>
                <select className="form-input" value={txForm.category} onChange={e => setTxForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-row" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Amount ($)</label>
                  <input className="form-input" type="number" step="0.01" min="0" placeholder="0.00" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setShowModal(false); setEditItem(null) }}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editItem ? 'Update' : 'Add Transaction'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
