import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { apiRequest, normalizeLead } from './services/api.js'

const initialLeads = [
  { id: 'l-1', name: 'Olivia Rhye', email: 'olivia@untitledui.com', phone: '+1 (555) 012-3456', company: 'Untitled UI', source: 'Website', status: 'New', createdAt: '2025-06-18', updatedAt: '2025-06-18', message: 'Looking for a CRM that can grow with our team.', notes: [], followUps: [] },
  { id: 'l-2', name: 'Phoenix Baker', email: 'phoenix@baker.com', phone: '+1 (555) 018-2290', company: 'Baker & Co.', source: 'Referral', status: 'Contacted', createdAt: '2025-06-17', updatedAt: '2025-06-18', message: 'Interested in learning more about your services.', notes: [], followUps: [] },
  { id: 'l-3', name: 'Lana Steiner', email: 'lana@steiner.io', phone: '+1 (555) 016-8831', company: 'Steiner Studio', source: 'LinkedIn', status: 'Converted', createdAt: '2025-06-16', updatedAt: '2025-06-17', message: 'We need help setting up a new client pipeline.', notes: [], followUps: [] },
  { id: 'l-4', name: 'Demi Wilkinson', email: 'demi@wilkinson.co', phone: '+1 (555) 010-7592', company: 'Wilkinson Design', source: 'Website', status: 'New', createdAt: '2025-06-15', updatedAt: '2025-06-15', message: 'I would love to book a discovery call.', notes: [], followUps: [] },
  { id: 'l-5', name: 'Candice Wu', email: 'candice@acme.com', phone: '+1 (555) 013-9245', company: 'Acme Corp', source: 'Campaign', status: 'Contacted', createdAt: '2025-06-14', updatedAt: '2025-06-17', message: 'Could you send over a proposal?', notes: [], followUps: [] },
  { id: 'l-6', name: 'Natali Craig', email: 'natali@frame.io', phone: '+1 (555) 019-1124', company: 'Frame', source: 'Referral', status: 'Closed', createdAt: '2025-06-13', updatedAt: '2025-06-14', message: 'We are comparing a few different options.', notes: [], followUps: [] },
  { id: 'l-7', name: 'Drew Cano', email: 'drew@canostudio.com', phone: '+1 (555) 011-4386', company: 'Cano Studio', source: 'Website', status: 'New', createdAt: '2025-06-12', updatedAt: '2025-06-12', message: 'Please get in touch about your plans.', notes: [], followUps: [] },
  { id: 'l-8', name: 'Orlando Diggs', email: 'orlando@diggs.com', phone: '+1 (555) 017-6649', company: 'Diggs Creative', source: 'LinkedIn', status: 'Converted', createdAt: '2025-06-11', updatedAt: '2025-06-16', message: 'We are ready to get started this month.', notes: [], followUps: [] },
  { id: 'l-9', name: 'Andi Lane', email: 'andi@lane.design', phone: '+1 (555) 014-3001', company: 'Lane Design', source: 'Website', status: 'Contacted', createdAt: '2025-06-10', updatedAt: '2025-06-12', message: 'Would like to see a product walkthrough.', notes: [], followUps: [] },
  { id: 'l-10', name: 'Kate Morrison', email: 'kate@morrison.io', phone: '+1 (555) 015-2803', company: 'Morrison Labs', source: 'Campaign', status: 'New', createdAt: '2025-06-09', updatedAt: '2025-06-09', message: 'Your website contact form caught my eye.', notes: [], followUps: [] },
].map((lead, index) => {
  const createdAt = new Date(Date.now() - index * 86400000).toISOString().slice(0, 10)
  return { ...lead, createdAt, updatedAt: createdAt }
})
const todayKey = new Date().toISOString().slice(0, 10)
const todayDate = new Date()
const todayLabel = todayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()

const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6-.2.1-1.1.6-.3 1.8h-2.8l-.3-1.8-1.1-.6-.2-.1-1.7.6-1.4-2.4 1.4-1.1.1-.1v-1.3l-.1-.1-1.4-1.1 1.4-2.4 1.7.6.2-.1 1.1-.6.3-1.8h2.8l.3 1.8 1.1.6.2.1 1.7-.6 1.4 2.4-1.4 1.1-.1.1z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  down: <path d="m7 10 5 5 5-5" />,
  arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
  trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.7L7.5 9.6a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 1.7-.6l2.8.4a2 2 0 0 1 1.6 2.9z" />,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
}

function Icon({ name, size = 18 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>
}

const statusClass = (status) => status.toLowerCase()
const initials = (name = '') => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
const formatDate = (value) => value ? new Date(value.includes('T') ? value : `${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const storedLeads = () => {
  try { return JSON.parse(localStorage.getItem('mini-crm-leads')) || initialLeads } catch { return initialLeads }
}

function App() {
  const [leads, setLeads] = useState(storedLeads)
  const [remoteLeads, setRemoteLeads] = useState([])
  const [remoteTotal, setRemoteTotal] = useState(null)
  const [remoteRefresh, setRemoteRefresh] = useState(0)
  const [remoteStats, setRemoteStats] = useState(null)
  const [apiFollowUps, setApiFollowUps] = useState([])
  const [activePage, setActivePage] = useState('Dashboard')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [sourceFilter, setSourceFilter] = useState('All sources')
  const [sortOrder, setSortOrder] = useState('newest')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [toast, setToast] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(() => ['demo', 'api'].includes(localStorage.getItem('mini-crm-session')))
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [apiMode, setApiMode] = useState(() => localStorage.getItem('mini-crm-session') === 'api')
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [contactMessage, setContactMessage] = useState('')

  useEffect(() => { localStorage.setItem('mini-crm-leads', JSON.stringify(leads)) }, [leads])
  useEffect(() => {
    if (!apiMode || !loggedIn) return
    let active = true
    Promise.all([apiRequest('/leads?limit=100'), apiRequest('/dashboard/stats'), apiRequest('/followups')]).then(([{ leads: rows }, stats, followUpResult]) => {
      if (!active) return
      setLeads(rows.map(normalizeLead))
      setRemoteStats({ total: stats.total, new: stats.New, contacted: stats.Contacted, converted: stats.Converted, closed: stats.Closed })
      setApiFollowUps(followUpResult.followUps.map((item) => ({ ...item, id: item._id, leadId: item.leadId })))
    }).catch((error) => { if (active) notify(error.message) })
    return () => { active = false }
  }, [apiMode, loggedIn])
  useEffect(() => {
    if (!apiMode || !loggedIn || activePage !== 'Leads') return
    let active = true
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize), sort: sortOrder })
      if (query.trim()) params.set('search', query.trim())
      if (statusFilter !== 'All statuses') params.set('status', statusFilter)
      if (sourceFilter !== 'All sources') params.set('source', sourceFilter)
      apiRequest(`/leads?${params}`).then(({ leads: rows, pagination }) => {
        if (!active) return
        setRemoteLeads(rows.map(normalizeLead))
        setRemoteTotal(pagination.total)
      }).catch((error) => { if (active) notify(error.message) })
    }, 180)
    return () => { active = false; window.clearTimeout(timer) }
  }, [apiMode, loggedIn, activePage, page, query, statusFilter, sourceFilter, sortOrder, remoteRefresh])
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const calculatedStats = useMemo(() => ({
    total: leads.length,
    new: leads.filter((lead) => lead.status === 'New').length,
    contacted: leads.filter((lead) => lead.status === 'Contacted').length,
    converted: leads.filter((lead) => lead.status === 'Converted').length,
    closed: leads.filter((lead) => lead.status === 'Closed').length,
  }), [leads])
  const stats = apiMode && remoteStats ? remoteStats : calculatedStats
  const conversionRate = stats.total ? Math.round((stats.converted / stats.total) * 100) : 0
  const sources = [...new Set(leads.map((lead) => lead.source))]
  const filteredLeads = useMemo(() => (apiMode && activePage === 'Leads' ? remoteLeads : leads)
    .filter((lead) => `${lead.name} ${lead.email} ${lead.company || ''}`.toLowerCase().includes(query.toLowerCase()))
    .filter((lead) => statusFilter === 'All statuses' || lead.status === statusFilter)
    .filter((lead) => sourceFilter === 'All sources' || lead.source === sourceFilter)
    .sort((a, b) => sortOrder === 'newest' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)), [leads, remoteLeads, apiMode, activePage, query, statusFilter, sourceFilter, sortOrder])
  const pageSize = 7
  const visibleLeads = filteredLeads.slice((page - 1) * pageSize, page * pageSize)
  const followUps = (apiMode ? apiFollowUps : leads.flatMap((lead) => (lead.followUps || []).map((followUp) => ({ ...followUp, leadId: lead.id, leadName: lead.name })))).sort((a, b) => new Date(a.date) - new Date(b.date))

  function notify(message) { setToast(message) }
  async function refreshServerStats() {
    if (!apiMode) return
    try {
      const value = await apiRequest('/dashboard/stats')
      setRemoteStats({ total: value.total, new: value.New, contacted: value.Contacted, converted: value.Converted, closed: value.Closed })
    } catch (error) { notify(error.message) }
  }
  async function saveLead(data, id) {
    if (apiMode) {
      try {
        const result = id
          ? await apiRequest(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) })
          : await apiRequest('/leads', { method: 'POST', body: JSON.stringify(data) })
        const saved = normalizeLead(result.lead)
        setLeads((current) => id ? current.map((lead) => lead.id === id ? { ...lead, ...saved } : lead) : [saved, ...current])
        if (id) setRemoteLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...saved } : lead))
        else { setRemoteLeads((current) => [saved, ...current].slice(0, pageSize)); setRemoteTotal((current) => (current || 0) + 1) }
        setPage(1)
        setSelectedLead((current) => current?.id === id ? { ...current, ...saved } : current)
        setModal(null)
        notify(id ? 'Lead updated successfully' : 'New lead added to your pipeline')
        setRemoteRefresh((current) => current + 1)
        refreshServerStats()
      } catch (error) { notify(error.message) }
      return
    }
    if (id) {
      setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...data, updatedAt: new Date().toISOString().slice(0, 10) } : lead))
      setSelectedLead((current) => current?.id === id ? { ...current, ...data } : current)
      notify('Lead updated successfully')
    } else {
      const created = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10), notes: [], followUps: [] }
      setLeads((current) => [created, ...current])
      setPage(1)
      notify('Demo lead added in this browser only. Sign in to save leads to MongoDB.')
    }
    setModal(null)
    refreshServerStats()
  }
  async function deleteLead(id) {
    if (apiMode) {
      try { await apiRequest(`/leads/${id}`, { method: 'DELETE' }) } catch (error) { notify(error.message); return }
    }
    setLeads((current) => current.filter((lead) => lead.id !== id))
    setRemoteLeads((current) => current.filter((lead) => lead.id !== id))
    setApiFollowUps((current) => current.filter((item) => item.leadId !== id))
    if (apiMode) setRemoteTotal((current) => Math.max(0, (current || 0) - 1))
    if (apiMode) setRemoteRefresh((current) => current + 1)
    setSelectedLead(null)
    setModal(null)
    notify('Lead deleted')
    refreshServerStats()
  }
  async function updateLead(id, changes) {
    if (apiMode) {
      try {
        const result = await apiRequest(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(changes) })
        const saved = normalizeLead(result.lead)
        setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...saved } : lead))
        setRemoteLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...saved } : lead))
        setSelectedLead((current) => current?.id === id ? { ...current, ...saved } : current)
        setRemoteRefresh((current) => current + 1)
        refreshServerStats()
      } catch (error) { notify(error.message) }
      return
    }
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...changes, updatedAt: new Date().toISOString().slice(0, 10) } : lead))
    setSelectedLead((current) => current?.id === id ? { ...current, ...changes } : current)
    setRemoteLeads((current) => current.map((lead) => lead.id === id ? { ...lead, ...changes } : lead))
  }
  async function addNote(lead, text) {
    if (apiMode) {
      try {
        const { note } = await apiRequest(`/leads/${lead.id}/notes`, { method: 'POST', body: JSON.stringify({ text }) })
        const notes = [{ ...note, id: note._id, date: note.createdAt }, ...(lead.notes || [])]
        setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, notes } : item))
        setRemoteLeads((current) => current.map((item) => item.id === lead.id ? { ...item, notes } : item))
        setSelectedLead((current) => current?.id === lead.id ? { ...current, notes } : current)
      } catch (error) { notify(error.message); return }
    } else {
      updateLead(lead.id, { notes: [{ id: crypto.randomUUID(), text, date: new Date().toISOString() }, ...(lead.notes || [])] })
    }
    notify('Note added')
  }
  async function addFollowUp(lead, item) {
    if (apiMode) {
      try {
        const { followUp } = await apiRequest(`/leads/${lead.id}/followups`, { method: 'POST', body: JSON.stringify(item) })
        const followUps = [...(lead.followUps || []), { ...followUp, id: followUp._id, leadId: lead.id }]
        setApiFollowUps((current) => [...current, { ...followUp, id: followUp._id, leadId: lead.id, leadName: lead.name }])
        setLeads((current) => current.map((value) => value.id === lead.id ? { ...value, followUps } : value))
        setRemoteLeads((current) => current.map((value) => value.id === lead.id ? { ...value, followUps } : value))
        setSelectedLead((current) => current?.id === lead.id ? { ...current, followUps } : current)
      } catch (error) { notify(error.message); return }
    } else {
      updateLead(lead.id, { followUps: [...(lead.followUps || []), { ...item, id: crypto.randomUUID(), completed: false }] })
    }
    notify('Follow-up scheduled')
  }
  async function toggleFollowUp(lead, followUpId) {
    const target = (lead.followUps || []).find((item) => item.id === followUpId)
    if (apiMode) {
      if (!target) return
      try {
        const result = await apiRequest(`/leads/${lead.id}/followups/${followUpId}`, { method: 'PATCH', body: JSON.stringify({ completed: !target.completed }) })
        const followUps = (lead.followUps || []).map((item) => item.id === followUpId ? { ...item, completed: result.followUp.completed } : item)
        setApiFollowUps((current) => current.map((item) => item.id === followUpId ? { ...item, completed: result.followUp.completed } : item))
        setLeads((current) => current.map((value) => value.id === lead.id ? { ...value, followUps } : value))
        setRemoteLeads((current) => current.map((value) => value.id === lead.id ? { ...value, followUps } : value))
        setSelectedLead((current) => current?.id === lead.id ? { ...current, followUps } : current)
      } catch (error) { notify(error.message) }
    } else {
      updateLead(lead.id, { followUps: (lead.followUps || []).map((item) => item.id === followUpId ? { ...item, completed: !item.completed } : item) })
    }
  }
  async function handleLogin(event) {
    event.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    const apiBase = import.meta.env.VITE_API_URL || ''
    try {
      const response = await fetch(`${apiBase}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: event.currentTarget.email.value, password: event.currentTarget.password.value }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Unable to sign in')
      localStorage.setItem('mini-crm-token', result.token)
      localStorage.setItem('mini-crm-session', 'api')
      setApiMode(true)
      setLoggedIn(true)
      const browserLeads = JSON.parse(localStorage.getItem('mini-crm-leads') || '[]')
      const { leads: savedLeads } = await apiRequest('/leads?limit=100')
      const knownEmails = new Set(savedLeads.map((lead) => lead.email.toLowerCase()))
      let migrated = 0
      for (const lead of browserLeads) {
        if (knownEmails.has(lead.email.toLowerCase())) continue
        await apiRequest('/leads', {
          method: 'POST',
          body: JSON.stringify({
            name: lead.name,
            email: lead.email,
            phone: lead.phone || '',
            company: lead.company || '',
            source: lead.source || 'Website',
            status: lead.status || 'New',
            message: lead.message || '',
          }),
        })
        knownEmails.add(lead.email.toLowerCase())
        migrated += 1
      }
      notify(migrated
        ? `Welcome back. Saved ${migrated} browser lead${migrated === 1 ? '' : 's'} to MongoDB.`
        : `Welcome back, ${result.user.name.split(' ')[0]}`)
    } catch (error) { setLoginError(error.message) } finally { setLoginLoading(false) }
  }
  function enterDemo() { localStorage.setItem('mini-crm-session', 'demo'); setApiMode(false); setLoggedIn(true) }
  function logout() { localStorage.removeItem('mini-crm-session'); localStorage.removeItem('mini-crm-token'); setLoggedIn(false); setActivePage('Dashboard') }
  async function submitContact(event) {
    event.preventDefault()
    if (contactForm.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email) || contactForm.message.trim().length < 5) {
      setContactMessage('Please enter a valid name, email, and message (at least 5 characters).')
      return
    }
    try {
      if (!import.meta.env.VITE_API_URL && !apiMode) {
        const newLead = { ...contactForm, company: '', source: 'Website Contact Form', status: 'New', id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10), notes: [], followUps: [] }
        setLeads((current) => [newLead, ...current])
        setContactMessage('Thanks — your message is on its way. We’ll be in touch soon.')
        setContactForm({ name: '', email: '', phone: '', message: '' })
        return
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contactForm) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Unable to send your message')
      if (!apiMode) setLeads((current) => [{ ...result.lead, id: result.lead._id, status: 'New', source: 'Website Contact Form', createdAt: new Date().toISOString().slice(0, 10), notes: [], followUps: [] }, ...current])
      else {
        const refreshed = await apiRequest('/leads?limit=100')
        setLeads(refreshed.leads.map(normalizeLead))
        refreshServerStats()
      }
      setContactMessage('Thanks — your message is on its way. We’ll be in touch soon.')
      setContactForm({ name: '', email: '', phone: '', message: '' })
    } catch (error) { setContactMessage(`${error.message}. Start the API server to submit contact requests.`) }
  }
  function goTo(pageName) { setActivePage(pageName); setMobileOpen(false); setSelectedLead(null) }

  if (window.location.pathname === '/contact') return <EmbeddedContact />
  if (!loggedIn) return <Login onLogin={handleLogin} onDemo={enterDemo} error={loginError} loading={loginLoading} />

  const navGroups = [
    { label: 'WORKSPACE', items: [['Dashboard', 'grid'], ['Leads', 'users'], ['Follow-ups', 'clock']] },
    { label: 'PREFERENCES', items: [['Settings', 'settings']] },
  ]
  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-overlay" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <button className="brand" onClick={() => goTo('Dashboard')} aria-label="Pipeline home"><span className="brand-mark"><span /><span /><span /><span /></span><span>flow<span className="brand-dot">.</span></span></button>
        <div className="workspace-switch"><div className="workspace-icon">S</div><div className="workspace-copy"><strong>Studio Acme</strong><span>Free workspace</span></div><Icon name="down" size={15} /></div>
        <nav aria-label="Main navigation">
          {navGroups.map((group) => <div className="nav-group" key={group.label}><span className="nav-label">{group.label}</span>{group.items.map(([item, icon]) => <button key={item} className={`nav-item ${activePage === item ? 'nav-active' : ''}`} onClick={() => goTo(item)}><Icon name={icon} /><span>{item}</span>{item === 'Leads' && <span className="nav-count">{leads.length}</span>}</button>)}</div>)}
          <button className="nav-item contact-nav" onClick={() => goTo('Contact form')}><Icon name="mail" /><span>Contact form</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><span className="upgrade-orb">✦</span><strong>Make room to grow</strong><p>Unlock more leads and powerful insights.</p><button onClick={() => notify('You’re all set — this workspace is ready to grow!')}>Explore plans <Icon name="arrow" size={14} /></button></div>
          <div className="profile-row"><div className="avatar avatar-profile">JD</div><div className="profile-copy"><strong>Jamie Diaz</strong><span>Admin</span></div><button aria-label="Log out" className="icon-button" onClick={logout}><Icon name="more" /></button></div>
        </div>
      </aside>
      <main className="main-shell">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button>
          <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{activePage}</strong></div>
          <div className="topbar-right"><div className="search-global"><Icon name="search" size={17} /><input aria-label="Search leads" placeholder="Search anything..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); goTo('Leads') }} /><kbd>⌘ K</kbd></div><button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify('You’re all caught up')}><Icon name="bell" /><span /></button><div className="avatar avatar-profile top-avatar">JD</div></div>
        </header>
        {apiMode
          ? <div className="api-notice">Connected to your secure CRM workspace <button onClick={() => notify('Your session is securely authenticated')}>View session</button></div>
          : <div className="api-notice demo-notice">Demo mode: changes are saved only in this browser, not MongoDB. Sign out and use your admin login to save leads to the database.</div>}
        <div className="page-content">
          {activePage === 'Dashboard' && <Dashboard stats={stats} conversionRate={conversionRate} leads={leads} onNavigate={goTo} onSelect={setSelectedLead} onAdd={() => setModal({ type: 'lead' })} />}
          {activePage === 'Leads' && <LeadsPage leads={apiMode ? filteredLeads : visibleLeads} total={apiMode ? remoteTotal ?? 0 : filteredLeads.length} page={page} pageSize={pageSize} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={(v) => { setStatusFilter(v); setPage(1) }} sourceFilter={sourceFilter} setSourceFilter={(v) => { setSourceFilter(v); setPage(1) }} sources={sources} sortOrder={sortOrder} setSortOrder={setSortOrder} onAdd={() => setModal({ type: 'lead' })} onSelect={setSelectedLead} onPage={setPage} />}
          {activePage === 'Follow-ups' && <FollowUpsPage followUps={followUps} leads={leads} onToggle={toggleFollowUp} onSelect={(id) => setSelectedLead(leads.find((lead) => lead.id === id))} onAdd={() => setModal({ type: 'followup' })} />}
          {activePage === 'Settings' && <SettingsPage onLogout={logout} notify={notify} />}
          {activePage === 'Contact form' && <ContactPage form={contactForm} setForm={setContactForm} onSubmit={submitContact} message={contactMessage} />}
        </div>
        <footer className="footer"><span>© 2025 Flow CRM, Inc.</span><span><span className="online-dot" /> All systems operational</span><button onClick={() => notify('Support is here to help: hello@flowcrm.com')}>Help & support</button></footer>
      </main>
      {selectedLead && <LeadDetails lead={leads.find((lead) => lead.id === selectedLead.id) || selectedLead} onClose={() => setSelectedLead(null)} onEdit={() => setModal({ type: 'lead', lead: selectedLead })} onDelete={() => setModal({ type: 'delete', lead: selectedLead })} onStatus={(status) => { updateLead(selectedLead.id, { status }); notify(`Status changed to ${status}`) }} onNote={(text) => addNote(selectedLead, text)} onFollowUp={(item) => addFollowUp(selectedLead, item)} onToggleFollowUp={(id) => toggleFollowUp(selectedLead, id)} />}
      {modal?.type === 'lead' && <LeadModal lead={modal.lead} onClose={() => setModal(null)} onSave={(data) => saveLead(data, modal.lead?.id)} />}
      {modal?.type === 'delete' && <ConfirmModal title="Delete this lead?" message={`This will permanently remove ${modal.lead.name} and its notes and follow-ups.`} onClose={() => setModal(null)} onConfirm={() => deleteLead(modal.lead.id)} />}
      {modal?.type === 'followup' && <FollowUpModal leads={leads} onClose={() => setModal(null)} onSave={(id, item) => { addFollowUp(leads.find((lead) => lead.id === id), item); setModal(null) }} />}
      {toast && <div className="toast" role="status"><span className="toast-check"><Icon name="check" size={15} /></span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><Icon name="close" size={15} /></button></div>}
    </div>
  )
}

function Login({ onLogin, onDemo, error, loading }) {
  const [resetNotice, setResetNotice] = useState('')
  return <div className="login-screen"><section className="login-panel"><div className="brand login-brand"><span className="brand-mark"><span /><span /><span /><span /></span><span>flow<span className="brand-dot">.</span></span></div><div className="login-copy"><span className="eyebrow"><span className="eyebrow-dot" /> YOUR CLIENT PIPELINE, IN FLOW</span><h1>Good to see<br />you again.</h1><p>Sign in to your workspace and pick up right where your next big opportunity begins.</p></div><form className="login-form" onSubmit={onLogin}><label>Email address<input name="email" type="email" placeholder="you@company.com" required autoComplete="username" /></label><label>Password<input name="password" type="password" placeholder="Enter your password" required autoComplete="current-password" /></label><div className="login-options"><label className="remember"><input type="checkbox" defaultChecked /> Keep me signed in</label><button type="button" className="text-button" onClick={() => setResetNotice('Please contact your workspace administrator to reset your password.')}>Forgot password?</button></div>{resetNotice && <p className="form-error" role="status">{resetNotice}</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary login-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <Icon name="arrow" size={16} /></button></form><div className="login-divider"><span />or<span /></div><button className="button demo-button" onClick={onDemo}>Explore demo workspace <Icon name="arrow" size={15} /></button><p className="demo-note">No account? The demo runs locally with sample leads.</p><div className="login-footer"><span>© 2025 Flow CRM, Inc.</span><span>Privacy&nbsp;&nbsp; · &nbsp;&nbsp;Terms</span></div></section><section className="login-art"><div className="art-grid" /><div className="art-glow" /><div className="art-topline"><span className="art-label"><span /> THIS WEEK AT A GLANCE</span><span className="live-pill"><i /> Live overview</span></div><div className="art-content"><div className="art-title"><span className="eyebrow">A LITTLE MORE MOMENTUM</span><h2>Great work<br />is <em>in the making.</em></h2><p>Every relationship starts somewhere.<br />Make this one count.</p></div><div className="floating-card"><div className="floating-head"><span>Pipeline growth</span><span className="floating-trend"><Icon name="trend" size={14} /> 18.4%</span></div><strong>84<span> leads</span></strong><MiniLineChart /></div><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-star">✳</div><div className="art-bottom"><div className="tiny-avatars"><i>O</i><i>P</i><i>L</i><i>+8</i></div><span>Good things happen when you follow up.</span></div></div><div className="art-footnote"><span>FLOW CRM</span><span>BUILT FOR WHAT'S NEXT · 01</span></div></section></div>
}

function MiniLineChart() { return <svg className="mini-chart" viewBox="0 0 300 82" preserveAspectRatio="none" aria-label="Leads are trending upward"><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#98edcf" stopOpacity=".25" /><stop offset="100%" stopColor="#98edcf" stopOpacity="0" /></linearGradient></defs><path d="M0 68 C24 58 31 62 49 47 S81 53 100 37 130 48 148 29 177 35 195 25 218 40 239 17 265 29 300 2 V82 H0Z" fill="url(#chart-fill)" /><path d="M0 68 C24 58 31 62 49 47 S81 53 100 37 130 48 148 29 177 35 195 25 218 40 239 17 265 29 300 2" fill="none" stroke="#8de6c5" strokeWidth="2.4" vectorEffect="non-scaling-stroke" /></svg> }

function Dashboard({ stats, conversionRate, leads, onNavigate, onSelect, onAdd }) {
  const metrics = [
    { label: 'Total leads', value: stats.total, delta: '12.8%', icon: 'users', tone: 'lavender' },
    { label: 'New leads', value: stats.new, delta: '8.2%', icon: 'plus', tone: 'peach' },
    { label: 'Contacted', value: stats.contacted, delta: '4.6%', icon: 'mail', tone: 'blue' },
    { label: 'Converted', value: stats.converted, delta: `${conversionRate}%`, icon: 'trend', tone: 'green' },
  ]
  const activityDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayDate)
    date.setDate(date.getDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)
    return { label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: leads.filter((lead) => lead.createdAt.slice(0, 10) === key).length }
  })
  const maxActivity = Math.max(...activityDays.map((day) => day.count), 1)
  return <><PageHeading eyebrow={todayLabel} title="Good morning, Jamie" subtitle="Here’s what’s happening with your leads today." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" size={16} /> Add a lead</button>} />
    <section className="metric-grid">{metrics.map((metric) => <article className="metric-card" key={metric.label}><div className="metric-top"><span>{metric.label}</span><span className={`metric-icon ${metric.tone}`}><Icon name={metric.icon} size={17} /></span></div><div className="metric-bottom"><strong>{metric.value.toString().padStart(2, '0')}</strong><span className="metric-change"><Icon name="trend" size={13} /> {metric.delta}</span></div><span className="metric-caption">vs. last month</span></article>)}</section>
    <section className="analytics-grid"><article className="panel status-panel"><div className="panel-heading"><div><h2>Lead overview</h2><p>How your leads are moving through the pipeline.</p></div><span className="period-label">All time</span></div><div className="donut-layout"><div className="donut-wrap"><div className="donut-chart" style={{ '--new': stats.total ? `${stats.new / stats.total * 100}%` : '0%', '--contacted': stats.total ? `${stats.contacted / stats.total * 100}%` : '0%', '--converted': stats.total ? `${stats.converted / stats.total * 100}%` : '0%' }}><div><strong>{stats.total}</strong><span>Total leads</span></div></div></div><div className="status-legend">{[['New', stats.new, 'legend-purple'], ['Contacted', stats.contacted, 'legend-peach'], ['Converted', stats.converted, 'legend-green'], ['Closed', stats.closed, 'legend-gray']].map(([name, value, color]) => <div className="legend-row" key={name}><span className={`legend-dot ${color}`} />{name}<strong>{value}</strong></div>)}</div></div><div className="conversion-note"><span><Icon name="trend" size={15} /> {conversionRate}% conversion rate</span><span>of all leads converted</span></div></article><article className="panel trend-panel"><div className="panel-heading"><div><h2>Lead activity</h2><p>New leads over the last 7 days.</p></div><span className="period-label">Last 7 days</span></div><div className="trend-summary"><strong>{activityDays.reduce((sum, day) => sum + day.count, 0)}</strong><span>new leads this week</span></div><div className="bar-chart">{activityDays.map((day, i) => <div className="bar-group" key={day.label} title={`${day.label}: ${day.count} leads`}><span className={`bar ${i === activityDays.length - 1 ? 'bar-highlight' : ''}`} style={{ height: `${day.count ? Math.max(17, day.count / maxActivity * 100) : 4}%` }} /></div>)}</div><div className="chart-axis">{activityDays.filter((_, i) => i === 0 || i === 2 || i === 4 || i === 6).map((day) => <span key={day.label}>{day.label}</span>)}</div></article></section>
    <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent leads <span className="count-pill">{stats.total}</span></h2><p>Keep an eye on your latest opportunities.</p></div><button className="button button-secondary button-small" onClick={() => onNavigate('Leads')}>View all leads <Icon name="chevron" size={14} /></button></div><LeadTable leads={leads.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)} onSelect={onSelect} /></section>
  </>
}

function PageHeading({ eyebrow, title, subtitle, action }) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{action}</div> }

function LeadsPage({ leads, total, page, pageSize, query, setQuery, statusFilter, setStatusFilter, sourceFilter, setSourceFilter, sources, sortOrder, setSortOrder, onAdd, onSelect, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return <><PageHeading eyebrow="YOUR PIPELINE" title="All leads" subtitle="Manage relationships and keep every opportunity moving." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" size={16} /> Add a lead</button>} /><section className="panel leads-panel"><div className="lead-toolbar"><div className="lead-count-label"><strong>All leads</strong><span className="count-pill">{total}</span></div><div className="toolbar-controls"><label className="search-field"><Icon name="search" size={16} /><input aria-label="Search leads" placeholder="Search leads..." value={query} onChange={(e) => { setQuery(e.target.value); onPage(1) }} /></label><label className="filter-select"><span className="sr-only">Filter by status</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All statuses</option>{['New', 'Contacted', 'Converted', 'Closed'].map((v) => <option key={v}>{v}</option>)}</select></label><label className="filter-select"><span className="sr-only">Filter by source</span><select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}><option>All sources</option>{sources.map((source) => <option key={source}>{source}</option>)}</select></label><button className="button button-secondary sort-button" onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}><Icon name="calendar" size={15} /> {sortOrder === 'newest' ? 'Newest' : 'Oldest'} <Icon name="down" size={13} /></button></div></div><LeadTable leads={leads} onSelect={onSelect} emptyMessage="No leads match these filters." /><div className="pagination"><span>Showing <strong>{total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong> leads</span><div><button className="button button-secondary button-small" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button><button className="button button-secondary button-small" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next <Icon name="chevron" size={13} /></button></div></div></section></>
}

function LeadTable({ leads, onSelect, emptyMessage = 'No leads yet. Add a lead to get started.' }) {
  return <div className="table-scroll"><table className="lead-table"><thead><tr><th><span className="table-check" /></th><th>NAME</th><th>STATUS</th><th>SOURCE</th><th>CREATED</th><th>LAST FOLLOW-UP</th><th /></tr></thead><tbody>{leads.map((lead) => {
    const lastFollowUp = (lead.followUps || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    return <tr key={lead.id} onClick={() => onSelect(lead)} tabIndex="0" onKeyDown={(event) => { if (event.key === 'Enter') onSelect(lead) }}><td><span className="table-check" /></td><td><div className="lead-person"><div className={`avatar avatar-${(lead.name.charCodeAt(0) % 5) + 1}`}>{initials(lead.name)}</div><div><strong>{lead.name}</strong><span>{lead.email}</span></div></div></td><td><span className={`status-badge status-${statusClass(lead.status)}`}><i />{lead.status}</span></td><td><span className="source-label"><i className={`source-dot source-${lead.source.toLowerCase().split(' ')[0]}`} />{lead.source}</span></td><td>{formatDate(lead.createdAt)}</td><td>{lastFollowUp ? formatDate(lastFollowUp.date) : '—'}</td><td><button className="row-more icon-button" aria-label={`View ${lead.name}`} onClick={(e) => { e.stopPropagation(); onSelect(lead) }}><Icon name="more" size={18} /></button></td></tr>
  })}{!leads.length && <tr><td colSpan="7"><div className="empty-state"><span className="empty-icon"><Icon name="users" size={22} /></span><strong>Nothing here just yet</strong><p>{emptyMessage}</p></div></td></tr>}</tbody></table></div>
}

function FollowUpsPage({ followUps, leads, onToggle, onSelect, onAdd }) {
  const today = todayKey
  const pending = followUps.filter((item) => !item.completed)
  const completed = followUps.filter((item) => item.completed)
  return <><PageHeading eyebrow="STAY IN TOUCH" title="Follow-ups" subtitle="The right conversation at the right time makes all the difference." action={<button className="button button-primary" onClick={onAdd}><Icon name="plus" size={16} /> Schedule follow-up</button>} /><div className="followup-stats"><div className="followup-stat"><span className="followup-stat-icon peach"><Icon name="clock" /></span><div><strong>{pending.length}</strong><span>Upcoming follow-ups</span></div></div><div className="followup-stat"><span className="followup-stat-icon green"><Icon name="check" /></span><div><strong>{completed.length}</strong><span>Completed</span></div></div><div className="followup-stat"><span className="followup-stat-icon lavender"><Icon name="calendar" /></span><div><strong>{pending.filter((item) => item.date < today).length}</strong><span>Past due</span></div></div></div><section className="panel followup-panel"><div className="panel-heading"><div><h2>Upcoming</h2><p>Make every touchpoint count.</p></div></div>{pending.length ? <div className="followup-list">{pending.map((item) => <FollowUpRow key={item.id} item={item} overdue={item.date < today} onToggle={onToggle} onSelect={onSelect} />)}</div> : <div className="empty-state"><span className="empty-icon"><Icon name="clock" size={21} /></span><strong>Your calendar is clear</strong><p>Schedule a follow-up to keep the conversation moving.</p></div>}</section>{completed.length > 0 && <section className="panel followup-panel completed-panel"><div className="panel-heading"><div><h2>Completed</h2><p>Great conversations, already in the books.</p></div></div><div className="followup-list">{completed.map((item) => <FollowUpRow key={item.id} item={item} onToggle={onToggle} onSelect={onSelect} />)}</div></section>}{!leads.length && <div className="sr-only">No leads available</div>}</>
}
function FollowUpRow({ item, overdue, onToggle, onSelect }) { return <div className={`followup-row ${item.completed ? 'followup-done' : ''}`}><button className="todo-check" aria-label={item.completed ? 'Mark follow-up incomplete' : 'Mark follow-up complete'} onClick={() => onToggle(item.leadId, item.id)}>{item.completed && <Icon name="check" size={13} />}</button><button className="followup-main" onClick={() => onSelect(item.leadId)}><strong>{item.description}</strong><span>{item.leadName}</span></button><span className={`followup-date ${overdue ? 'overdue' : ''}`}><Icon name="calendar" size={14} />{formatDate(item.date)}{overdue && <i>Overdue</i>}</span><button className="icon-button" aria-label={`View ${item.leadName}`} onClick={() => onSelect(item.leadId)}><Icon name="chevron" size={17} /></button></div> }

function SettingsPage({ onLogout, notify }) { return <><PageHeading eyebrow="MAKE IT YOURS" title="Settings" subtitle="Manage your workspace and account preferences." /><section className="panel settings-panel"><div className="settings-section"><div><h2>Workspace profile</h2><p>How your team shows up in Flow CRM.</p></div><div className="settings-fields"><label>Workspace name<input defaultValue="Studio Acme" /></label><label>Workspace URL<div className="input-prefix"><span>flowcrm.com/</span><input defaultValue="studio-acme" /></div></label><button className="button button-primary button-small" onClick={() => notify('Workspace settings saved')}>Save changes</button></div></div><div className="settings-section"><div><h2>Admin account</h2><p>Your personal details and sign-in options.</p></div><div className="settings-fields"><label>Full name<input defaultValue="Jamie Diaz" /></label><label>Email address<input defaultValue="jamie@studioacme.com" type="email" /></label><button className="button button-secondary button-small" onClick={onLogout}>Log out of this account</button></div></div><div className="settings-section"><div><h2>Data & privacy</h2><p>Control your workspace data and integrations.</p></div><div className="integration-card"><div className="integration-icon"><Icon name="mail" /></div><div><strong>Website contact form</strong><span>Send new leads straight into your pipeline.</span></div><span className="integration-ready"><i /> Ready</span></div></div></section></> }

function EmbeddedContact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  async function submit(event) {
    event.preventDefault()
    setSending(true)
    setMessage('')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Unable to send your message')
      setMessage('Thanks — your message is on its way. We’ll be in touch soon.')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      setMessage(`${error.message}. Please try again shortly.`)
    } finally {
      setSending(false)
    }
  }
  return <main className="embed-page"><section className="embed-card"><div className="brand embed-brand"><span className="brand-mark"><span /><span /><span /><span /></span><span>flow<span className="brand-dot">.</span></span></div><span className="eyebrow">LET’S START SOMETHING</span><h1>Tell us what<br />you’re dreaming up.</h1><p>Share a little about your project and we’ll be in touch soon.</p><form className="public-form" onSubmit={submit}><label>Your name<input required minLength="2" maxLength="100" placeholder="Alex Morgan" value={form.name} onChange={update('name')} /></label><label>Email address<input required type="email" maxLength="254" placeholder="alex@company.com" value={form.email} onChange={update('email')} /></label><label>Phone <span>Optional</span><input type="tel" maxLength="30" placeholder="+1 (555) 000-0000" value={form.phone} onChange={update('phone')} /></label><label>Your message<textarea required minLength="5" maxLength="2000" rows="4" placeholder="A little about what you need..." value={form.message} onChange={update('message')} /></label><button className="button button-primary" disabled={sending}>{sending ? 'Sending…' : 'Send your message'} <Icon name="arrow" size={15} /></button>{message && <p className={message.startsWith('Thanks') ? 'success-message' : 'form-error'} role="status">{message}</p>}</form><span className="form-powered">Powered by <strong>flow.</strong></span></section></main>
}

function ContactPage({ form, setForm, onSubmit, message }) { const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value })); return <><PageHeading eyebrow="GROW YOUR PIPELINE" title="Website contact form" subtitle="A simple form for your website that sends enquiries to your CRM." /><div className="contact-layout"><section className="panel contact-preview"><div className="preview-ribbon"><span>LIVE PREVIEW</span><span><i /> PUBLIC FORM</span></div><div className="preview-body"><span className="eyebrow">LET’S START SOMETHING</span><h2>Tell us what<br />you’re dreaming up.</h2><p>Share a little about your project and we’ll be in touch soon.</p><form className="public-form" onSubmit={onSubmit}><label>Your name<input required minLength="2" placeholder="Alex Morgan" value={form.name} onChange={update('name')} /></label><label>Email address<input required type="email" placeholder="alex@company.com" value={form.email} onChange={update('email')} /></label><label>Phone <span>Optional</span><input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={update('phone')} /></label><label>Your message<textarea required minLength="5" rows="3" placeholder="A little about what you need..." value={form.message} onChange={update('message')} /></label><button className="button button-primary">Send your message <Icon name="arrow" size={15} /></button>{message && <p className={message.startsWith('Thanks') ? 'success-message' : 'form-error'} role="status">{message}</p>}</form><span className="form-powered">Powered by <strong>flow.</strong></span></div></section><aside className="contact-info"><div className="contact-info-icon"><Icon name="trend" /></div><h2>Every new enquiry,<br />right where it belongs.</h2><p>Submissions create a new lead in your CRM automatically, ready for your team to follow up.</p><div className="contact-detail"><span className="detail-number">01</span><div><strong>Instantly captured</strong><p>New submissions appear in your lead list with a Website Contact Form source.</p></div></div><div className="contact-detail"><span className="detail-number">02</span><div><strong>Always in the loop</strong><p>Your team can follow up, add notes, and track each conversation.</p></div></div><div className="embed-snippet"><span>EMBED ON YOUR SITE</span><code>{'<iframe src="https://your-crm.com/contact" />'}</code><button onClick={() => navigator.clipboard?.writeText('<iframe src="https://your-crm.com/contact" />')}>Copy embed code <Icon name="arrow" size={13} /></button></div></aside></div></> }

function LeadDetails({ lead, onClose, onEdit, onDelete, onStatus, onNote, onFollowUp, onToggleFollowUp }) {
  const [note, setNote] = useState('')
  const [followUp, setFollowUp] = useState(false)
  const timeline = [...(lead.notes || []).map((item) => ({ ...item, kind: 'note' })), ...(lead.followUps || []).map((item) => ({ ...item, kind: 'followup' }))].sort((a, b) => new Date(b.date) - new Date(a.date))
  return <><button className="drawer-backdrop" aria-label="Close lead details" onClick={onClose} /><aside className="lead-drawer" aria-label={`Lead details: ${lead.name}`}><div className="drawer-top"><span>LEAD DETAILS</span><button className="icon-button" aria-label="Close details" onClick={onClose}><Icon name="close" /></button></div><div className="drawer-profile"><div className={`avatar avatar-xl avatar-${(lead.name.charCodeAt(0) % 5) + 1}`}>{initials(lead.name)}</div><h2>{lead.name}</h2><p>{lead.company || 'Independent'}</p><span className={`status-badge status-${statusClass(lead.status)}`}><i />{lead.status}</span><div className="drawer-actions"><button className="button button-secondary button-small" onClick={onEdit}>Edit lead</button><button className="button button-secondary button-small" onClick={() => onDelete()}>Delete</button></div></div><div className="drawer-section"><h3>CONTACT INFORMATION</h3><div className="contact-row"><Icon name="mail" /><div><span>Email address</span><a href={`mailto:${lead.email}`}>{lead.email}</a></div></div>{lead.phone && <div className="contact-row"><Icon name="phone" /><div><span>Phone number</span><a href={`tel:${lead.phone}`}>{lead.phone}</a></div></div>}<div className="contact-row"><Icon name="users" /><div><span>Source</span><strong>{lead.source}</strong></div></div><div className="contact-row"><Icon name="calendar" /><div><span>Created</span><strong>{formatDate(lead.createdAt)}</strong></div></div><div className="contact-row"><Icon name="calendar" /><div><span>Last updated</span><strong>{formatDate(lead.updatedAt || lead.createdAt)}</strong></div></div></div><div className="drawer-section"><div className="drawer-section-title"><h3>PIPELINE STATUS</h3></div><select aria-label="Update lead status" className={`status-select status-${statusClass(lead.status)}`} value={lead.status} onChange={(e) => onStatus(e.target.value)}>{['New', 'Contacted', 'Converted', 'Closed'].map((v) => <option key={v}>{v}</option>)}</select></div>{lead.message && <div className="drawer-section"><h3>MESSAGE</h3><p className="message-copy">{lead.message}</p></div>}<div className="drawer-section timeline-section"><div className="drawer-section-title"><h3>NOTES & FOLLOW-UPS</h3><button className="text-button" onClick={() => setFollowUp(!followUp)}>+ Follow-up</button></div><form className="note-form" onSubmit={(e) => { e.preventDefault(); if (note.trim()) { onNote(note.trim()); setNote('') } }}><textarea rows="2" placeholder="Add a note..." value={note} onChange={(e) => setNote(e.target.value)} /><button className="button button-primary button-small" disabled={!note.trim()}>Add note</button></form>{followUp && <FollowUpInline onSave={(item) => { onFollowUp(item); setFollowUp(false) }} />}<div className="timeline">{timeline.length ? timeline.map((item) => <div className={`timeline-item ${item.kind}`} key={item.id}><span className="timeline-dot">{item.kind === 'note' ? <Icon name="mail" size={12} /> : <Icon name="calendar" size={12} />}</span><div><div className="timeline-heading"><strong>{item.kind === 'note' ? 'Note added' : item.description}</strong>{item.kind === 'followup' && <button className="todo-check mini-check" aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'} onClick={() => onToggleFollowUp(item.id)}>{item.completed && <Icon name="check" size={11} />}</button>}</div>{item.kind === 'note' ? <p>{item.text}</p> : <p>{item.completed ? 'Completed' : 'Scheduled'} · {formatDate(item.date)}</p>}<span>{item.kind === 'note' ? new Date(item.date).toLocaleDateString() : ''}</span></div></div>) : <p className="timeline-empty">No activity yet. Add a note to start the conversation history.</p>}</div></div></aside></>
}

function FollowUpInline({ onSave }) { const [date, setDate] = useState(''); const [description, setDescription] = useState(''); return <form className="inline-followup" onSubmit={(e) => { e.preventDefault(); onSave({ date, description }) }}><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} /><input required placeholder="What should you follow up on?" value={description} onChange={(e) => setDescription(e.target.value)} /><button className="button button-primary button-small">Save</button></form> }

function LeadModal({ lead, onClose, onSave }) {
  const [values, setValues] = useState(lead || { name: '', email: '', phone: '', company: '', source: 'Website', status: 'New', message: '' })
  const [error, setError] = useState('')
  const update = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }))
  function submit(event) { event.preventDefault(); if (values.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || (values.phone && values.phone.replace(/\D/g, '').length < 7)) { setError('Add a valid name and email. Phone numbers must contain at least 7 digits.'); return } onSave(values) }
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title"><div className="modal-heading"><div><span className="eyebrow">{lead ? 'UPDATE YOUR PIPELINE' : 'GROW YOUR PIPELINE'}</span><h2 id="lead-modal-title">{lead ? 'Edit lead' : 'Add a lead'}</h2><p>Keep the details close. The best relationships start here.</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div><form onSubmit={submit} className="lead-form"><div className="field-grid"><label>Full name <b>*</b><input autoFocus required minLength="2" maxLength="100" value={values.name} onChange={update('name')} placeholder="e.g. Alex Morgan" /></label><label>Email address <b>*</b><input required type="email" value={values.email} onChange={update('email')} placeholder="alex@company.com" /></label><label>Phone number<input type="tel" value={values.phone || ''} onChange={update('phone')} placeholder="+1 (555) 000-0000" /></label><label>Company<input value={values.company || ''} onChange={update('company')} placeholder="Company name" /></label><label>Source<select value={values.source} onChange={update('source')}>{['Website', 'Website Contact Form', 'Referral', 'LinkedIn', 'Campaign', 'Other'].map((source) => <option key={source}>{source}</option>)}</select></label><label>Status<select value={values.status} onChange={update('status')}>{['New', 'Contacted', 'Converted', 'Closed'].map((status) => <option key={status}>{status}</option>)}</select></label></div><label className="full-field">Notes / message<textarea rows="3" maxLength="2000" value={values.message || ''} onChange={update('message')} placeholder="What should you know about this lead?" /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary">{lead ? 'Save changes' : 'Create lead'} <Icon name="arrow" size={14} /></button></div></form></section></div>
}

function FollowUpModal({ leads, onClose, onSave }) { const [leadId, setLeadId] = useState(leads[0]?.id || ''); const [date, setDate] = useState(''); const [description, setDescription] = useState(''); return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section className="modal-card compact-modal" role="dialog" aria-modal="true" aria-labelledby="followup-modal-title"><div className="modal-heading"><div><span className="eyebrow">MAKE IT COUNT</span><h2 id="followup-modal-title">Schedule a follow-up</h2><p>A thoughtful follow-up can change everything.</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>{leads.length ? <form className="lead-form" onSubmit={(e) => { e.preventDefault(); if (description.trim()) onSave(leadId, { date, description }) }}><label className="full-field">Lead<select required value={leadId} onChange={(e) => setLeadId(e.target.value)}>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} · {lead.company || lead.email}</option>)}</select></label><label className="full-field">Follow-up date<input type="date" required min={todayKey} value={date} onChange={(e) => setDate(e.target.value)} /></label><label className="full-field">Description<input required maxLength="250" placeholder="e.g. Send over the proposal" value={description} onChange={(e) => setDescription(e.target.value)} /></label><div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary">Schedule follow-up</button></div></form> : <div className="empty-state"><p>Add a lead before scheduling a follow-up.</p></div>}</section></div> }

function ConfirmModal({ title, message, onClose, onConfirm }) { return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section className="modal-card confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><div className="confirm-icon"><Icon name="close" /></div><h2 id="confirm-title">{title}</h2><p>{message}</p><div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Keep lead</button><button className="button button-danger" onClick={onConfirm}>Delete lead</button></div></section></div> }

export default App
