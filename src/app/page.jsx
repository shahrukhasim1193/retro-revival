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
          <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAGQAZADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD1qiiiuA2CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAE70tFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAwooooEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAlLSUtABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACUtFFAwooooEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUlAC0UUUAFFJS0AFFFFABRRRQAUUUlAwpaSloAKSlpKACiiobq7trKEzXU8cMY6tIwAoAmorFbxXYHPkwXtwv9+O2bafoTjNS23iXS7iURNM9tKxwEuYzET9CeD+dPlYuZGtRRRSGFFFFAgooooASloooGFFFFAgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiio55o7eCSaVwkcalnY9AByTQMg1PUItMsXupQWC4CovV2PAUe5NcOzahrmqtHbiO4v0GZJXP7m0B7L/j1PsKs6/r326NLlbeWC3tlLxCYANLIRhSFznAGevciuj8M6T/Y+iwxOM3Eo82du5c8n8un4VqvcVzF+/K3QzI/BAljDX2r3c0vcxYRfwBBNVr/wtqdjEz6fdf2hBj57S5UbmHseh+hFdlRip52U6cTi/DeuG3McZdjYSOIykhJa1kJwBzzsJ4weh9jXa1xHiazjtfEcW1QINWiaOUDj5xj5vrgg/UV1GiXT3mi2k8hzI0YDn1YcH9RRJLdBBvVMv0UUVBYUUUUAFFFFABRRRQAUUUUAFFFFAwooooEFFFFABRRRQAUUUUAFFFFABRRRQAUlLRQAlLRRQMKSlooEFFFFACUUtFAwooooEFFFFABRRRQAlFLRQMKiubeO6tpbeZd0cqFHHqCMGpaKAOa0/wAEWNndpcXFzcXvlMGiSYjapHQkD7xHqa6Sloptt7iSS2ExRRWdrOtWmi2vm3DFpG4ihT78h9AP60rX2He25ieLXWbXNGtRy0bPM3sOB/j+VbHhlCvh61YgjzA0g+jMSP0NcfaRX+t6tIZyRd3gHmlOlrB6fUjIHqSTXoccaRRrHGoVEAVQOwHAFaS0VjKGrchaWiiszQKKKKACiiigAooooAKKKKACkpaKACiiigApKKWgYUUUUCCiiigAooooAKKKKACiiigAooooAKKK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" alt="RR" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
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
