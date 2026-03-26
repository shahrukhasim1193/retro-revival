'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-browser';

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', PKR: '₨' };
const FALLBACK_RATES = { GBP: 1, USD: 1.27, PKR: 354.50 };

/* ===================== ICONS ===================== */
const IconPackage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconTruck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IconChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconTrash = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
const IconDashboard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconLogout = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

/* ===================== HELPERS ===================== */
function getBillingPeriods(dispatches) {
  if (!dispatches.length) return [];
  const dates = dispatches.map(d => new Date(d.dispatched_at));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const periods = [];
  let start = new Date(minDate.getFullYear(), minDate.getMonth(), 8);
  if (minDate.getDate() < 8) start.setMonth(start.getMonth() - 1);
  while (start <= maxDate) {
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 7);
    periods.push({
      label: `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      start: new Date(start),
      end: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59),
    });
    start = new Date(start.getFullYear(), start.getMonth() + 1, 8);
  }
  return periods;
}

function getAvailableStock(procurements) {
  const stockMap = {};
  for (const p of procurements) {
    if (p.remaining_qty <= 0) continue;
    const key = `${p.category_id}|${p.brand_id}|${p.quality_id}`;
    if (!stockMap[key]) {
      stockMap[key] = { category_id: p.category_id, brand_id: p.brand_id, quality_id: p.quality_id, totalQty: 0, totalCostVal: 0 };
    }
    stockMap[key].totalQty += p.remaining_qty;
    stockMap[key].totalCostVal += p.remaining_qty * parseFloat(p.unit_price_gbp);
  }
  for (const k in stockMap) {
    stockMap[k].avgCost = stockMap[k].totalCostVal / stockMap[k].totalQty;
  }
  return Object.values(stockMap);
}

/* ===================== SHARED STYLES ===================== */
const selectStyle = { width: '100%', padding: '10px 12px', background: '#222', border: '1px solid #333', borderRadius: 8, color: '#e8e0d4', fontSize: 14, fontFamily: 'inherit', outline: 'none' };
const inputStyle = { ...selectStyle };
const labelStyle = { display: 'block', fontSize: 12, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 };
const cardStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 24px' };
const thStyle = { padding: '10px 16px', textAlign: 'left', color: '#777', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 };
const tdStyle = { padding: '10px 16px' };
const btnPrimary = { background: 'linear-gradient(135deg, #d4a853, #b8862d)', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '12px 28px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: 14, letterSpacing: 0.5 };

/* ===================== MAIN PAGE ===================== */
export default function AppPage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currency, setCurrency] = useState('GBP');

  // Data
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [procurements, setProcurements] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState(FALLBACK_RATES);
  const [ratesLive, setRatesLive] = useState(false);

  const rate = exchangeRates[currency];
  const sym = CURRENCY_SYMBOLS[currency];

  // Fetch live exchange rates
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/GBP');
        const data = await res.json();
        if (data.result === 'success' && data.rates) {
          setExchangeRates({
            GBP: 1,
            USD: data.rates.USD || FALLBACK_RATES.USD,
            PKR: data.rates.PKR || FALLBACK_RATES.PKR,
          });
          setRatesLive(true);
        }
      } catch (e) {
        console.log('Using fallback exchange rates');
      }
    }
    fetchRates();
  }, []);

  // Load user and data
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      setUser(user);
      await loadAll();
      setLoading(false);
    }
    init();
  }, []);

  const loadAll = useCallback(async () => {
    const [catRes, brRes, qRes, procRes, dispRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('brands').select('*').order('name'),
      supabase.from('quality_grades').select('*').order('sort_order'),
      supabase.from('procurements').select('*').order('procured_at', { ascending: true }),
      supabase.from('dispatches').select('*, dispatch_items(*)').order('dispatched_at', { ascending: false }),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (brRes.data) setBrands(brRes.data);
    if (qRes.data) setQualities(qRes.data);
    if (procRes.data) setProcurements(procRes.data);
    if (dispRes.data) setDispatches(dispRes.data);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#111', color: '#d4a853', fontFamily: "'Playfair Display', serif", fontSize: 20 }}>
        Loading Retro Revival...
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { id: 'procurement', label: 'Procurement', icon: <IconPackage /> },
    { id: 'dispatch', label: 'Dispatch', icon: <IconTruck /> },
    { id: 'finance', label: 'Finance', icon: <IconChart /> },
    { id: 'settings', label: 'Settings', icon: <IconSettings /> },
  ];

  const sharedProps = { supabase, categories, brands, qualities, procurements, dispatches, loadAll, rate, sym, currency, exchangeRates };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "var(--font-body)", background: '#111', color: '#e8e0d4', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 240 : 64, background: '#161616', borderRight: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: sidebarOpen ? '24px 20px' : '24px 12px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', minHeight: 72 }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #d4a853, #b8862d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#1a1a1a', flexShrink: 0 }}>RR</div>
          {sidebarOpen && <div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: '#d4a853', lineHeight: 1.2 }}>Retro Revival</div><div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>Inventory Manager</div></div>}
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: sidebarOpen ? '10px 12px' : '10px 0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              background: activeTab === item.id ? 'rgba(212,168,83,0.12)' : 'transparent',
              color: activeTab === item.id ? '#d4a853' : '#888',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500,
              fontFamily: 'inherit', transition: 'all 0.15s', marginBottom: 2,
            }}>{item.icon}{sidebarOpen && item.label}</button>
          ))}
        </nav>
        <div style={{ padding: sidebarOpen ? '12px 20px' : '12px 8px', borderTop: '1px solid #2a2a2a' }}>
          {sidebarOpen && <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>Currency</div>
            <button onClick={() => { const order = ['GBP', 'USD', 'PKR']; setCurrency(order[(order.indexOf(currency) + 1) % 3]); }} style={{ background: 'rgba(212,168,83,0.15)', color: '#d4a853', border: '1px solid rgba(212,168,83,0.3)', borderRadius: 4, padding: '3px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600 }}>{currency} {sym}</button>
            <div style={{ marginTop: 4, color: '#444', fontSize: 10 }}>£1 = ${exchangeRates.USD.toFixed(2)} = ₨{exchangeRates.PKR.toFixed(0)}</div>
            <div style={{ marginTop: 2, fontSize: 9, color: ratesLive ? '#4caf50' : '#777' }}>{ratesLive ? '● Live rates' : '○ Fallback rates'}</div>
          </div>}
          <button onClick={handleSignOut} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: sidebarOpen ? '8px 12px' : '8px 0', justifyContent: sidebarOpen ? 'flex-start' : 'center',
            background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
          }}><IconLogout />{sidebarOpen && 'Sign Out'}</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: '#111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 36px' }} className="fade-in" key={activeTab}>
          {activeTab === 'dashboard' && <DashboardTab {...sharedProps} />}
          {activeTab === 'procurement' && <ProcurementTab {...sharedProps} />}
          {activeTab === 'dispatch' && <DispatchTab {...sharedProps} />}
          {activeTab === 'finance' && <FinanceTab {...sharedProps} />}
          {activeTab === 'settings' && <SettingsTab {...sharedProps} />}
        </div>
      </main>
    </div>
  );
}

/* ===================== DASHBOARD ===================== */
function DashboardTab({ categories, brands, qualities, procurements, dispatches, rate, sym }) {
  const stock = getAvailableStock(procurements);
  const totalUnits = stock.reduce((s, i) => s + i.totalQty, 0);
  const totalValue = stock.reduce((s, i) => s + i.totalCostVal, 0);
  const recentDispatches = dispatches.slice(0, 5);

  const getName = (list, id) => list.find(i => i.id === id)?.name || '—';

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#d4a853', margin: '0 0 6px' }}>Dashboard</h1>
      <p style={{ color: '#666', fontSize: 14, margin: '0 0 28px' }}>Overview of your inventory and operations</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total SKUs in Stock', value: stock.length, sub: `${totalUnits} units` },
          { label: 'Inventory Value', value: `${sym}${(totalValue * rate).toFixed(0)}`, sub: 'FIFO cost basis' },
          { label: 'Total Dispatches', value: dispatches.length, sub: 'all time' },
          { label: 'Procurement Batches', value: procurements.length, sub: 'recorded' },
        ].map((card, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: 12, color: '#777', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#e8e0d4' }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {recentDispatches.length > 0 && <>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#d4a853', marginBottom: 12 }}>Recent Dispatches</h2>
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid #2a2a2a' }}>
              {['Order ID', 'Date', 'Items', 'COGS'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>{recentDispatches.map(d => {
              const cogs = (d.dispatch_items || []).reduce((s, it) => s + it.quantity * parseFloat(it.unit_cost_gbp), 0);
              return (
                <tr key={d.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: '#d4a853', fontSize: 12 }}>{d.order_id}</td>
                  <td style={{ ...tdStyle, color: '#999' }}>{new Date(d.dispatched_at).toLocaleDateString('en-GB')}</td>
                  <td style={tdStyle}>{(d.dispatch_items || []).length} item{(d.dispatch_items || []).length !== 1 && 's'}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{sym}{(cogs * rate).toFixed(2)}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </>}

      {stock.length > 0 && <>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#d4a853', margin: '28px 0 12px' }}>Current Stock</h2>
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid #2a2a2a' }}>
              {['Category', 'Brand', 'Quality', 'Qty', 'Avg Cost'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>{stock.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                <td style={tdStyle}>{getName(categories, s.category_id)}</td>
                <td style={tdStyle}>{getName(brands, s.brand_id)}</td>
                <td style={tdStyle}><span style={{ background: 'rgba(212,168,83,0.12)', color: '#d4a853', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{getName(qualities, s.quality_id)}</span></td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{s.totalQty}</td>
                <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{sym}{(s.avgCost * rate).toFixed(2)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </>}
    </div>
  );
}

/* ===================== PROCUREMENT ===================== */
function ProcurementTab({ supabase, categories, brands, qualities, procurements, loadAll, rate, sym }) {
  const [form, setForm] = useState({ category_id: '', brand_id: '', quality_id: '', unitPrice: '', quantity: '', date: new Date().toISOString().slice(0, 10) });
  const [addingField, setAddingField] = useState(null);
  const [newOptionName, setNewOptionName] = useState('');
  const [saving, setSaving] = useState(false);

  const getName = (list, id) => list.find(i => i.id === id)?.name || '—';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.category_id || !form.brand_id || !form.quality_id || !form.unitPrice || !form.quantity) return;
    setSaving(true);
    const priceGbp = parseFloat(form.unitPrice) / rate;
    const qty = parseInt(form.quantity);
    const { error } = await supabase.from('procurements').insert({
      category_id: form.category_id, brand_id: form.brand_id, quality_id: form.quality_id,
      unit_price_gbp: priceGbp, quantity: qty, remaining_qty: qty, procured_at: form.date,
    });
    if (!error) {
      setForm({ category_id: '', brand_id: '', quality_id: '', unitPrice: '', quantity: '', date: new Date().toISOString().slice(0, 10) });
      await loadAll();
    }
    setSaving(false);
  }

  async function quickAdd(field) {
    if (!newOptionName.trim()) return;
    const table = field === 'category' ? 'categories' : field === 'brand' ? 'brands' : 'quality_grades';
    const formKey = field === 'category' ? 'category_id' : field === 'brand' ? 'brand_id' : 'quality_id';
    const { data, error } = await supabase.from(table).insert({ name: newOptionName.trim() }).select().single();
    if (!error && data) {
      setForm(prev => ({ ...prev, [formKey]: data.id }));
      await loadAll();
    }
    setNewOptionName('');
    setAddingField(null);
  }

  async function removeOption(field, id) {
    const table = field === 'category' ? 'categories' : field === 'brand' ? 'brands' : 'quality_grades';
    await supabase.from(table).delete().eq('id', id);
    await loadAll();
  }

  async function deleteProcurement(id) {
    await supabase.from('procurements').delete().eq('id', id);
    await loadAll();
  }

  function DropdownField({ label, field, options, value, onChange }) {
    const isAdding = addingField === field;
    const isEmpty = options.length === 0;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
          {options.length > 0 && <button onClick={() => { setAddingField(isAdding ? null : field); setNewOptionName(''); }} style={{ background: 'none', border: 'none', color: '#d4a853', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', padding: 0 }}>{isAdding ? 'Cancel' : 'Manage'}</button>}
        </div>
        {isAdding ? (
          <div style={{ background: '#161616', border: '1px solid #333', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {options.map(opt => (
                <span key={opt.id} style={{ background: '#222', border: '1px solid #333', borderRadius: 6, padding: '5px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {opt.name}
                  <button onClick={() => removeOption(field, opt.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, lineHeight: 1, opacity: 0.7 }}><IconX /></button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input autoFocus value={newOptionName} onChange={e => setNewOptionName(e.target.value)} onKeyDown={e => e.key === 'Enter' && quickAdd(field)} placeholder={`Add ${label.toLowerCase()}...`} style={{ ...inputStyle, padding: '8px 10px', fontSize: 13 }} />
              <button onClick={() => quickAdd(field)} style={{ background: '#d4a853', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 13, flexShrink: 0 }}><IconPlus /></button>
            </div>
          </div>
        ) : isEmpty ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={addingField === field ? newOptionName : ''} onChange={e => { setAddingField(field); setNewOptionName(e.target.value); }} onFocus={() => setAddingField(field)} onKeyDown={e => e.key === 'Enter' && quickAdd(field)} placeholder={`Type to add first ${label.toLowerCase()}...`} style={{ ...inputStyle, flex: 1, borderStyle: 'dashed' }} />
            <button onClick={() => quickAdd(field)} style={{ background: 'rgba(212,168,83,0.15)', color: '#d4a853', border: '1px solid rgba(212,168,83,0.3)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 13, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}><IconPlus /> Add</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={value} onChange={e => onChange(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
              <option value="">Select {label.toLowerCase()}</option>
              {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <button onClick={() => { setAddingField(field); setNewOptionName(''); }} title={`Add new ${label.toLowerCase()}`} style={{ background: 'rgba(212,168,83,0.15)', color: '#d4a853', border: '1px solid rgba(212,168,83,0.3)', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', flexShrink: 0, display: 'flex', alignItems: 'center' }}><IconPlus /></button>
          </div>
        )}
      </div>
    );
  }

  const sorted = [...procurements].sort((a, b) => new Date(b.procured_at) - new Date(a.procured_at));

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#d4a853', margin: '0 0 6px' }}>Procurement</h1>
      <p style={{ color: '#666', fontSize: 14, margin: '0 0 28px' }}>Record new stock purchases and manage your inventory</p>

      <form onSubmit={handleSubmit} style={{ ...cardStyle, padding: 24, marginBottom: 32 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#d4a853', margin: '0 0 20px' }}>Add Stock</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <DropdownField label="Category" field="category" options={categories} value={form.category_id} onChange={v => setForm({ ...form, category_id: v })} />
          <DropdownField label="Brand" field="brand" options={brands} value={form.brand_id} onChange={v => setForm({ ...form, brand_id: v })} />
          <DropdownField label="Quality" field="quality" options={qualities} value={form.quality_id} onChange={v => setForm({ ...form, quality_id: v })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div><label style={labelStyle}>Unit Price ({sym})</label><input type="number" step="0.01" min="0" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} placeholder="0.00" style={inputStyle} /></div>
          <div><label style={labelStyle}>Quantity</label><input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" style={inputStyle} /></div>
          <div><label style={labelStyle}>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} /></div>
        </div>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Record Procurement'}</button>
      </form>

      {sorted.length > 0 && (
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#d4a853', padding: '16px 20px 0', margin: 0 }}>Procurement History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 }}>
              <thead><tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Date', 'Category', 'Brand', 'Quality', 'Unit Price', 'Qty', 'Remaining', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr></thead>
              <tbody>{sorted.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ ...tdStyle, color: '#999' }}>{new Date(p.procured_at).toLocaleDateString('en-GB')}</td>
                  <td style={tdStyle}>{getName(categories, p.category_id)}</td>
                  <td style={tdStyle}>{getName(brands, p.brand_id)}</td>
                  <td style={tdStyle}><span style={{ background: 'rgba(212,168,83,0.12)', color: '#d4a853', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{getName(qualities, p.quality_id)}</span></td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{sym}{(parseFloat(p.unit_price_gbp) * rate).toFixed(2)}</td>
                  <td style={tdStyle}>{p.quantity}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: p.remaining_qty === 0 ? '#555' : '#4caf50' }}>{p.remaining_qty}</td>
                  <td style={tdStyle}><button onClick={() => deleteProcurement(p.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', opacity: 0.6, padding: 4 }}><IconTrash /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== DISPATCH ===================== */
function DispatchTab({ supabase, categories, brands, qualities, procurements, dispatches, loadAll, rate, sym }) {
  const [orderId, setOrderId] = useState('');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [sellingPrice, setSellingPrice] = useState('');
  const [items, setItems] = useState([{ stockKey: '', qty: '' }]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const stock = getAvailableStock(procurements);
  const getName = (list, id) => list.find(i => i.id === id)?.name || '—';

  function addItem() { setItems([...items, { stockKey: '', qty: '' }]); }
  function removeItem(i) { setItems(items.filter((_, idx) => idx !== i)); }
  function updateItem(i, field, val) { const n = [...items]; n[i] = { ...n[i], [field]: val }; setItems(n); }

  async function handleDispatch(e) {
    e.preventDefault();
    setError('');
    if (!orderId.trim()) { setError('Order ID is required'); return; }
    const validItems = items.filter(it => it.stockKey && it.qty && parseInt(it.qty) > 0);
    if (!validItems.length) { setError('Add at least one item'); return; }

    setSaving(true);
    const priceGbp = sellingPrice ? parseFloat(sellingPrice) / rate : 0;
    const dispatchItems = validItems.map(item => {
      const [catId, brId, qId] = item.stockKey.split('|');
      return { category_id: catId, brand_id: brId, quality_id: qId, quantity: parseInt(item.qty) };
    });

    // Use the server-side FIFO function
    const { data, error: rpcError } = await supabase.rpc('dispatch_order', {
      p_order_id: orderId.trim(),
      p_dispatch_date: dispatchDate,
      p_selling_price: priceGbp,
      p_items: dispatchItems,
    });

    if (rpcError) {
      setError(rpcError.message || 'Dispatch failed');
    } else {
      setOrderId(''); setSellingPrice(''); setItems([{ stockKey: '', qty: '' }]); setDispatchDate(new Date().toISOString().slice(0, 10));
      await loadAll();
    }
    setSaving(false);
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#d4a853', margin: '0 0 6px' }}>Dispatch</h1>
      <p style={{ color: '#666', fontSize: 14, margin: '0 0 28px' }}>Record orders going out and track COGS via FIFO</p>

      <form onSubmit={handleDispatch} style={{ ...cardStyle, padding: 24, marginBottom: 32 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#d4a853', margin: '0 0 20px' }}>New Dispatch</h3>
        {error && <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e74c3c', fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div><label style={labelStyle}>Order ID</label><input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. ORD-12345" style={inputStyle} /></div>
          <div><label style={labelStyle}>Dispatch Date</label><input type="date" value={dispatchDate} onChange={e => setDispatchDate(e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Selling Price ({sym})</label><input type="number" step="0.01" min="0" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="Total revenue" style={inputStyle} /></div>
        </div>

        <label style={{ ...labelStyle, marginBottom: 12 }}>Order Items</label>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'center' }}>
            <select value={item.stockKey} onChange={e => updateItem(i, 'stockKey', e.target.value)} style={{ ...selectStyle, flex: 3 }}>
              <option value="">Select stock item</option>
              {stock.map(s => {
                const key = `${s.category_id}|${s.brand_id}|${s.quality_id}`;
                return <option key={key} value={key}>{getName(categories, s.category_id)} / {getName(brands, s.brand_id)} / {getName(qualities, s.quality_id)} — {s.totalQty} avail</option>;
              })}
            </select>
            <input type="number" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} placeholder="Qty" style={{ ...inputStyle, flex: 1 }} />
            {items.length > 1 && <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 4, flexShrink: 0 }}><IconX /></button>}
          </div>
        ))}
        <button type="button" onClick={addItem} style={{ background: 'rgba(212,168,83,0.1)', color: '#d4a853', border: '1px solid rgba(212,168,83,0.2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}><IconPlus /> Add Item</button>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>{saving ? 'Processing...' : 'Record Dispatch'}</button>
      </form>

      {dispatches.length > 0 && (
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#d4a853', padding: '16px 20px 0', margin: 0 }}>Dispatch History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 }}>
              <thead><tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Date', 'Order ID', 'Items', 'COGS', 'Revenue', 'Margin'].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr></thead>
              <tbody>{dispatches.map(d => {
                const cogs = (d.dispatch_items || []).reduce((s, it) => s + it.quantity * parseFloat(it.unit_cost_gbp), 0);
                const rev = parseFloat(d.selling_price_gbp) || 0;
                const margin = rev ? ((rev - cogs) / rev * 100) : 0;
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ ...tdStyle, color: '#999' }}>{new Date(d.dispatched_at).toLocaleDateString('en-GB')}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: '#d4a853', fontSize: 12 }}>{d.order_id}</td>
                    <td style={tdStyle}>{(d.dispatch_items || []).length}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{sym}{(cogs * rate).toFixed(2)}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{rev ? `${sym}${(rev * rate).toFixed(2)}` : '—'}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: margin > 0 ? '#4caf50' : margin < 0 ? '#e74c3c' : '#777' }}>{rev ? `${margin.toFixed(1)}%` : '—'}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== FINANCE ===================== */
function FinanceTab({ dispatches, rate, sym }) {
  const periods = getBillingPeriods(dispatches);
  const [selectedPeriod, setSelectedPeriod] = useState(Math.max(0, periods.length - 1));

  const period = periods[selectedPeriod];
  const filtered = period ? dispatches.filter(d => {
    const dt = new Date(d.dispatched_at);
    return dt >= period.start && dt <= period.end;
  }) : [];

  const totalCogs = filtered.reduce((s, d) => s + (d.dispatch_items || []).reduce((ss, it) => ss + it.quantity * parseFloat(it.unit_cost_gbp), 0), 0);
  const totalRevenue = filtered.reduce((s, d) => s + (parseFloat(d.selling_price_gbp) || 0), 0);
  const grossProfit = totalRevenue - totalCogs;
  const margin = totalRevenue ? (grossProfit / totalRevenue * 100) : 0;

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#d4a853', margin: '0 0 6px' }}>Finance</h1>
      <p style={{ color: '#666', fontSize: 14, margin: '0 0 28px' }}>P&L overview based on dispatch data · Billing cycle: 8th–7th</p>

      {periods.length === 0 ? (
        <div style={{ ...cardStyle, padding: 40, textAlign: 'center', color: '#666' }}>No dispatches recorded yet. Record some dispatches to see your P&L.</div>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <select value={selectedPeriod} onChange={e => setSelectedPeriod(parseInt(e.target.value))} style={selectStyle}>
              {periods.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Revenue', value: `${sym}${(totalRevenue * rate).toFixed(2)}`, color: '#4caf50' },
              { label: 'COGS (FIFO)', value: `${sym}${(totalCogs * rate).toFixed(2)}`, color: '#e74c3c' },
              { label: 'Gross Profit', value: `${sym}${(grossProfit * rate).toFixed(2)}`, color: grossProfit >= 0 ? '#4caf50' : '#e74c3c' },
              { label: 'Margin', value: `${margin.toFixed(1)}%`, color: margin >= 0 ? '#4caf50' : '#e74c3c' },
            ].map((card, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ fontSize: 12, color: '#777', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{card.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>

          {totalRevenue > 0 && <div style={{ ...cardStyle, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#d4a853', margin: '0 0 16px' }}>Revenue Breakdown</h3>
            <div style={{ display: 'flex', height: 40, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(0, Math.min(100, totalCogs / totalRevenue * 100))}%`, background: 'linear-gradient(90deg, #e74c3c, #c0392b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', minWidth: totalCogs > 0 ? 60 : 0 }}>COGS</div>
              <div style={{ flex: 1, background: 'linear-gradient(90deg, #27ae60, #2ecc71)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' }}>Profit</div>
            </div>
          </div>}

          {filtered.length > 0 && (
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#d4a853', padding: '16px 20px 0', margin: 0 }}>Order Breakdown</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 }}>
                  <thead><tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                    {['Date', 'Order ID', 'Revenue', 'COGS', 'Profit', 'Margin'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr></thead>
                  <tbody>{[...filtered].sort((a, b) => new Date(a.dispatched_at) - new Date(b.dispatched_at)).map(d => {
                    const cogs = (d.dispatch_items || []).reduce((s, it) => s + it.quantity * parseFloat(it.unit_cost_gbp), 0);
                    const rev = parseFloat(d.selling_price_gbp) || 0;
                    const profit = rev - cogs;
                    const m = rev ? (profit / rev * 100) : 0;
                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ ...tdStyle, color: '#999' }}>{new Date(d.dispatched_at).toLocaleDateString('en-GB')}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: '#d4a853', fontSize: 12 }}>{d.order_id}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{rev ? `${sym}${(rev * rate).toFixed(2)}` : '—'}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{sym}{(cogs * rate).toFixed(2)}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: profit >= 0 ? '#4caf50' : '#e74c3c' }}>{rev ? `${sym}${(profit * rate).toFixed(2)}` : '—'}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: m >= 0 ? '#4caf50' : '#e74c3c' }}>{rev ? `${m.toFixed(1)}%` : '—'}</td>
                      </tr>
                    );
                  })}</tbody>
                  <tfoot><tr style={{ borderTop: '2px solid #333', fontWeight: 700 }}>
                    <td style={tdStyle} colSpan={2}>TOTAL ({filtered.length} orders)</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{sym}{(totalRevenue * rate).toFixed(2)}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{sym}{(totalCogs * rate).toFixed(2)}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: grossProfit >= 0 ? '#4caf50' : '#e74c3c' }}>{sym}{(grossProfit * rate).toFixed(2)}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', color: margin >= 0 ? '#4caf50' : '#e74c3c' }}>{margin.toFixed(1)}%</td>
                  </tr></tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ===================== SETTINGS ===================== */
function SettingsTab({ supabase, categories, brands, qualities, loadAll, currency, exchangeRates }) {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    async function loadEmails() {
      const { data } = await supabase.from('allowed_emails').select('*').order('created_at');
      if (data) setEmails(data);
    }
    loadEmails();
  }, []);

  async function addEmail() {
    if (!newEmail.trim()) return;
    const { error } = await supabase.from('allowed_emails').insert({ email: newEmail.trim().toLowerCase() });
    if (!error) {
      const { data } = await supabase.from('allowed_emails').select('*').order('created_at');
      if (data) setEmails(data);
      setNewEmail('');
    }
  }

  function ManageList({ title, items, table }) {
    const [val, setVal] = useState('');
    async function add() {
      if (!val.trim()) return;
      await supabase.from(table).insert({ name: val.trim() });
      await loadAll();
      setVal('');
    }
    async function remove(id) {
      await supabase.from(table).delete().eq('id', id);
      await loadAll();
    }
    return (
      <div style={cardStyle}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#d4a853', margin: '0 0 16px' }}>{title}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {items.map(item => (
            <span key={item.id} style={{ background: '#222', border: '1px solid #333', borderRadius: 6, padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.name}
              <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, lineHeight: 1 }}><IconX /></button>
            </span>
          ))}
          {items.length === 0 && <span style={{ color: '#555', fontSize: 13, fontStyle: 'italic' }}>None added yet</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder={`New ${title.toLowerCase().replace('manage ', '')}...`} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={add} style={{ background: '#d4a853', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 13 }}>Add</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#d4a853', margin: '0 0 6px' }}>Settings</h1>
      <p style={{ color: '#666', fontSize: 14, margin: '0 0 28px' }}>Manage dropdown options and access control</p>

      <div style={{ display: 'grid', gap: 20, marginBottom: 32 }}>
        <ManageList title="Manage Categories" items={categories} table="categories" />
        <ManageList title="Manage Brands" items={brands} table="brands" />
        <ManageList title="Manage Quality Grades" items={qualities} table="quality_grades" />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#d4a853', margin: '0 0 8px' }}>Currency</h3>
        <p style={{ color: '#777', fontSize: 13, margin: '0 0 16px' }}>All prices stored in GBP internally. Toggle currency from the sidebar.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {['GBP', 'USD', 'PKR'].map(c => (
            <div key={c} style={{
              background: currency === c ? 'rgba(212,168,83,0.2)' : '#222',
              border: `1px solid ${currency === c ? '#d4a853' : '#333'}`,
              color: currency === c ? '#d4a853' : '#888',
              borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600,
            }}>{CURRENCY_SYMBOLS[c]} {c}</div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#555' }}>Rates: £1 = ${exchangeRates.USD.toFixed(2)} = ₨{exchangeRates.PKR.toFixed(0)}</div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#d4a853', margin: '0 0 8px' }}>Email Whitelist</h3>
        <p style={{ color: '#777', fontSize: 13, margin: '0 0 16px' }}>Only these emails can sign in to the app.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {emails.map(e => (
            <span key={e.id} style={{ background: '#222', border: '1px solid #333', borderRadius: 6, padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)' }}>
              {e.email}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEmail()} placeholder="email@example.com" style={{ ...inputStyle, flex: 1, fontFamily: 'var(--font-mono)' }} />
          <button onClick={addEmail} style={{ background: '#d4a853', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 13 }}>Whitelist</button>
        </div>
      </div>
    </div>
  );
}
