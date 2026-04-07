'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-browser';

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', PKR: '₨' };
const FALLBACK_RATES = { GBP: 1, USD: 1.27, PKR: 354.50 };
const ADMIN_EMAIL = 'shahrukhasim11@gmail.com';
const ORDER_STATUSES = ['Placed','QA','Washing','Ready','Dispatched'];
const SLA_DAYS = 5;
const LOGO_SRC = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAGQAZADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD1qiiiuA2CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAE70tFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAwooooEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAlLSUtABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACUtFFAwooooEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUlAC0UUUAFFJS0AFFFFABRRRQAUUUlAwpaSloAKSlpKACiiobq7trKEzXU8cMY6tIwAoAmorFbxXYHPkwXtwv9+O2bafoTjNS23iXS7iURNM9tKxwEuYzET9CeD+dPlYuZGtRRRSGFFFFAgooooASloooGFFFFAgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiio55o7eCSaVwkcalnY9AByTQMg1PUItMsXupQWC4CovV2PAUe5NcOzahrmqtHbiO4v0GZJXP7m0B7L/j1PsKs6/r326NLlbeWC3tlLxCYANLIRhSFznAGevciuj8M6T/Y+iwxOM3Eo82du5c8n8un4VqvcVzF+/K3QzI/BAljDX2r3c0vcxYRfwBBNVr/wtqdjEz6fdf2hBj57S5UbmHseh+hFdlRip52U6cTi/DeuG3McZdjYSOIykhJa1kJwBzzsJ4weh9jXa1xHiazjtfEcW1QINWiaOUDj5xj5vrgg/UV1GiXT3mi2k8hzI0YDn1YcH9RRJLdBBvVMv0UUVBYUUUUAFFFFABRRRQAUUUUAFFFFAwooooEFFFFABRRRQAUUUUAFFFFABRRRQAUlLRQAlLRRQMKSlooEFFFFACUUtFAwooooEFFFFABRRRQAlFLRQMKiubeO6tpbeZd0cqFHHqCMGpaKAOa0/wAEWNndpcXFzcXvlMGiSYjapHQkD7xHqa6Sloptt7iSS2ExRRWdrOtWmi2vm3DFpG4ihT78h9AP60rX2He25ieLXWbXNGtRy0bPM3sOB/j+VbHhlCvh61YgjzA0g+jMSP0NcfaRX+t6tIZyRd3gHmlOlrB6fUjIHqSTXoccaRRrHGoVEAVQOwHAFaS0VjKGrchaWiiszQKKKKACiiigAooooAKKKKACkpaKACiiigApKKWgYUUUUCCiiigAooooAKKKKACiiigAooooAKKK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';

const BISMILLAH='بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const RIZQ_QUOTES={dashboard:{ar:'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',en:'"And whoever fears Allah — He will make for him a way out and provide for him from where he does not expect." — Surah At-Talaq 65:2-3'},orders:{ar:'',en:'"The honest and trustworthy merchant will be with the Prophets, the truthful, and the martyrs." — Tirmidhi'},procurement:{ar:'إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ',en:'"Indeed, it is Allah who is the Provider, the Firm Possessor of Strength." — Surah Adh-Dhariyat 51:58'},expenses:{ar:'',en:'"No one who spends in the cause of Allah will find their wealth diminished." — Hadith (Bukhari & Muslim)'},finance:{ar:'',en:'"Wealth does not decrease because of charity." — Prophet Muhammad ﷺ (Muslim)'},settings:{ar:'',en:'"Tie your camel first, then put your trust in Allah." — Tirmidhi'},calculator:{ar:'',en:'"Nobody has ever eaten a better meal than that which one has earned by working with their own hands." — Prophet Muhammad ﷺ (Bukhari 2072)'},inventory:{ar:'',en:'"Allah loves that when one of you does something, you do it with excellence." — Prophet Muhammad ﷺ (Tabarani)'}};

/* Icons */
const IconPackage=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconTruck=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IconChart=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconSettings=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const IconPlus=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconX=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconTrash=()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
const IconEdit=()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconDashboard=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconLogout=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconExpense=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IconCalc=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="16" y2="18"/></svg>;
const IconBox=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconClip=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>;

/* Utilities */
function RizqQuote({page}){const q=RIZQ_QUOTES[page];if(!q)return null;return<div style={{background:'rgba(107,127,94,0.06)',border:'1px solid rgba(107,127,94,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:24,textAlign:'center'}}>{q.ar&&<div style={{fontFamily:"'Noto Sans Arabic', serif",fontSize:16,color:T.accent,marginBottom:6,lineHeight:1.8,direction:'rtl'}}>{q.ar}</div>}<div style={{fontSize:12,color:T.textSecondary,fontStyle:'italic',lineHeight:1.5}}>{q.en}</div></div>;}

function getBillingPeriods(dispatches,expenses){const allDates=[...dispatches.filter(d=>d.order_status==='Dispatched').map(d=>new Date(d.dispatched_at)),...(expenses||[]).map(e=>new Date(e.expense_date))];if(!allDates.length)return[];const minDate=new Date(Math.min(...allDates));const maxDate=new Date(Math.max(...allDates));const periods=[];let start=new Date(minDate.getFullYear(),minDate.getMonth(),8);if(minDate.getDate()<8)start.setMonth(start.getMonth()-1);while(start<=maxDate){const end=new Date(start.getFullYear(),start.getMonth()+1,7);periods.push({label:`${start.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} – ${end.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`,start:new Date(start),end:new Date(end.getFullYear(),end.getMonth(),end.getDate(),23,59,59)});start=new Date(start.getFullYear(),start.getMonth()+1,8);}return periods;}

function getAvailableStock(procurements){
  const m={};for(const p of procurements){const avail=p.remaining_qty-(p.reserved_qty||0);if(avail<=0&&(p.reserved_qty||0)<=0)continue;const k=`${p.category_id}|${p.brand_id}`;if(!m[k])m[k]={category_id:p.category_id,brand_id:p.brand_id,totalQty:0,reservedQty:0,totalCostVal:0};const a=Math.max(0,avail);m[k].totalQty+=a;m[k].reservedQty+=(p.reserved_qty||0);m[k].totalCostVal+=a*parseFloat(p.unit_price_gbp);}
  for(const k in m)m[k].avgCost=m[k].totalQty>0?m[k].totalCostVal/m[k].totalQty:0;return Object.values(m);
}

function isOverdue(d){if(!d.placed_at||d.order_status==='Dispatched'||d.order_status==='Cancelled')return false;const placed=new Date(d.placed_at);const now=new Date();const diff=(now-placed)/(1000*60*60*24);return diff>=SLA_DAYS;}
function fmt(n,dec=2){return Number(n).toLocaleString('en-GB',{minimumFractionDigits:dec,maximumFractionDigits:dec});}

const T={bg:'#F7F0E3',bgCard:'#FFFFFF',bgSidebar:'#2D3B35',bgSidebarHover:'rgba(247,240,227,0.12)',border:'#D9CEBC',borderLight:'#E8DFD0',text:'#2A2A2A',textSecondary:'#7A7268',textMuted:'#A09686',textFaint:'#C4B9AB',accent:'#6B7F5E',accentDark:'#4A5C42',accentBg:'rgba(107,127,94,0.1)',accentBorder:'rgba(107,127,94,0.3)',burgundy:'#8B3A3A',green:'#3D7A4A',red:'#B33A3A',sidebarText:'#C8C2B8',sidebarActive:'#F7F0E3',amber:'#B8862D',amberBg:'rgba(212,168,83,0.08)',amberBorder:'rgba(212,168,83,0.3)'};
const sel={width:'100%',padding:'10px 12px',background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:14,fontFamily:'inherit',outline:'none'};
const inp={...sel};const lbl={display:'block',fontSize:12,color:T.textSecondary,marginBottom:6,textTransform:'uppercase',letterSpacing:0.5,fontWeight:600};
const crd={background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:'20px 24px'};
const _th={padding:'10px 16px',textAlign:'left',color:T.textSecondary,fontWeight:600,fontSize:11,textTransform:'uppercase',letterSpacing:0.5};
const _td={padding:'10px 16px'};
const btnP={background:`linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,color:'#fff',border:'none',borderRadius:8,padding:'12px 28px',cursor:'pointer',fontWeight:700,fontFamily:'inherit',fontSize:14,letterSpacing:0.5};
const btnS={background:T.accentBg,color:T.accent,border:`1px solid ${T.accentBorder}`,borderRadius:6,padding:'6px 12px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:12};
const mono='var(--font-mono)';const dsp='var(--font-display)';
const overlay={position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000};
const modal={background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:'calc(100% - 32px)',maxWidth:560,maxHeight:'90vh',overflow:'auto'};

function Modal({open,onClose,title,children,wide}){if(!open)return null;return(<div style={overlay} onClick={onClose}><div style={{...modal,maxWidth:wide?800:560}} onClick={e=>e.stopPropagation()}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h3 style={{fontFamily:dsp,fontSize:18,color:T.accent,margin:0}}>{title}</h3><button onClick={onClose} style={{background:'none',border:'none',color:T.textMuted,cursor:'pointer',padding:4}}><IconX/></button></div>{children}</div></div>);}

function MarginAlert({open,onClose,margin}){if(!open)return null;const isLow=margin<35;const emoji=isLow?'😳':'🥳';const msg=isLow?'Astaghfirullah bro, you okay?':'Ek Pappi Idhar, Ek Udhar! 😘';const sub=isLow?`Margin is only ${margin.toFixed(1)}% — might want to double-check that pricing!`:`${margin.toFixed(1)}% margin — MashaAllah, what a deal!`;const bg=isLow?'rgba(179,58,58,0.06)':'rgba(61,122,74,0.06)';const bc=isLow?'rgba(179,58,58,0.2)':'rgba(61,122,74,0.2)';const col=isLow?T.red:T.green;return(<div style={overlay} onClick={onClose}><div style={{...modal,maxWidth:420,textAlign:'center'}} onClick={e=>e.stopPropagation()}><div style={{fontSize:56,marginBottom:12}}>{emoji}</div><div style={{fontSize:22,fontWeight:700,fontFamily:dsp,color:col,marginBottom:8}}>{msg}</div><div style={{background:bg,border:`1px solid ${bc}`,borderRadius:10,padding:'14px 18px',marginBottom:20,color:T.textSecondary,fontSize:14}}>{sub}</div><button onClick={onClose} style={{...btnP,padding:'10px 32px'}}>Got it</button></div></div>);}

/* ===== MAIN APP ===== */
export default function AppPage(){
  const supabase=createClient();
  const [user,setUser]=useState(null);const [activeTab,setActiveTab]=useState('dashboard');const [sidebarOpen,setSidebarOpen]=useState(false);const [currency,setCurrency]=useState('GBP');
  const [isMobile,setIsMobile]=useState(false);
  useEffect(()=>{const ck=()=>{const m=window.innerWidth<768;setIsMobile(m);if(!m)setSidebarOpen(true);};ck();window.addEventListener('resize',ck);return()=>window.removeEventListener('resize',ck);},[]);
  const [categories,setCategories]=useState([]);const [brands,setBrands]=useState([]);const [qualities,setQualities]=useState([]);
  const [suppliers,setSuppliers]=useState([]);const [salesChannels,setSalesChannels]=useState([]);const [expenseSubcats,setExpenseSubcats]=useState([]);
  const [procurements,setProcurements]=useState([]);const [dispatches,setDispatches]=useState([]);const [expenses,setExpenses]=useState([]);
  const [settings,setSettings]=useState({});const [loading,setLoading]=useState(true);
  const [exchangeRates,setExchangeRates]=useState(FALLBACK_RATES);const [ratesLive,setRatesLive]=useState(false);
  const rate=exchangeRates[currency];const sym=CURRENCY_SYMBOLS[currency];

  useEffect(()=>{(async()=>{try{const r=await fetch('https://open.er-api.com/v6/latest/GBP');const d=await r.json();if(d.result==='success'&&d.rates){setExchangeRates({GBP:1,USD:d.rates.USD||FALLBACK_RATES.USD,PKR:d.rates.PKR||FALLBACK_RATES.PKR});setRatesLive(true);}}catch{}})();},[]);
  useEffect(()=>{(async()=>{const{data:{user}}=await supabase.auth.getUser();if(!user){window.location.href='/login';return;}setUser(user);await loadAll();setLoading(false);})();},[]);
  const loadAll=useCallback(async()=>{
    const[c1,c2,c3,c4,c5,c6,c7,c8,c9,c10]=await Promise.all([supabase.from('categories').select('*').order('name'),supabase.from('brands').select('*').order('name'),supabase.from('quality_grades').select('*').order('sort_order'),supabase.from('procurements').select('*').order('procured_at',{ascending:true}),supabase.from('dispatches').select('*, dispatch_items(*)').order('dispatched_at',{ascending:false}),supabase.from('expenses').select('*').order('expense_date',{ascending:false}),supabase.from('app_settings').select('*'),supabase.from('suppliers').select('*').order('name'),supabase.from('sales_channels').select('*').order('name'),supabase.from('expense_subcategories').select('*').order('name')]);
    if(c1.data)setCategories(c1.data);if(c2.data)setBrands(c2.data);if(c3.data)setQualities(c3.data);if(c4.data)setProcurements(c4.data);if(c5.data)setDispatches(c5.data);if(c6.data)setExpenses(c6.data);if(c8.data)setSuppliers(c8.data);if(c9.data)setSalesChannels(c9.data);if(c10.data)setExpenseSubcats(c10.data);
    if(c7.data){const s={};c7.data.forEach(r=>s[r.key]=r.value);setSettings(s);}
  },[]);
  async function handleSignOut(){await supabase.auth.signOut();window.location.href='/login';}
  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:T.bg,color:T.accent,fontFamily:"'Playfair Display', serif",fontSize:20}}>Loading...</div>;

  const navItems=[{id:'dashboard',label:'Dashboard',icon:<IconDashboard/>},{id:'orders',label:'Orders',icon:<IconClip/>},{id:'inventory',label:'Inventory',icon:<IconBox/>},{id:'procurement',label:'Procurement',icon:<IconPackage/>},{id:'expenses',label:'Expenses',icon:<IconExpense/>},{id:'calculator',label:'Price Calc',icon:<IconCalc/>},{id:'finance',label:'Finance',icon:<IconChart/>},{id:'settings',label:'Settings',icon:<IconSettings/>}];
  const sp={supabase,user,categories,brands,qualities,suppliers,salesChannels,expenseSubcats,procurements,dispatches,expenses,settings,loadAll,rate,sym,currency,exchangeRates,isMobile};

  return(
    <div style={{display:'flex',height:'100vh',fontFamily:"var(--font-body)",background:T.bg,color:T.text,overflow:'hidden'}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600&display=swap" rel="stylesheet"/>
      {isMobile&&sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',zIndex:99}}/>}
      <aside style={{width:sidebarOpen?240:(isMobile?0:64),background:T.bgSidebar,display:'flex',flexDirection:'column',transition:'width 0.25s ease, transform 0.25s ease',flexShrink:0,overflow:'hidden',position:isMobile?'fixed':'relative',height:isMobile?'100vh':'auto',zIndex:isMobile?100:1,transform:isMobile&&!sidebarOpen?'translateX(-100%)':'translateX(0)'}}>
        <div style={{padding:sidebarOpen?'24px 20px':'24px 12px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',gap:12,cursor:'pointer',minHeight:72}} onClick={()=>setSidebarOpen(!sidebarOpen)}>
          <img src={LOGO_SRC} alt="RR" style={{width:36,height:36,borderRadius:8,objectFit:'cover',flexShrink:0}}/>
          {sidebarOpen&&<div><div style={{fontFamily:dsp,fontWeight:700,fontSize:16,color:T.sidebarActive,lineHeight:1.2}}>Retro Revival</div><div style={{fontSize:11,color:T.sidebarText,marginTop:2,opacity:0.6}}>Business Manager</div></div>}
        </div>
        <nav style={{flex:1,padding:'12px 8px'}}>{navItems.map(item=><button key={item.id} onClick={()=>{setActiveTab(item.id);if(isMobile)setSidebarOpen(false);}} style={{display:'flex',alignItems:'center',gap:12,width:'100%',padding:sidebarOpen?'10px 12px':'10px 0',justifyContent:sidebarOpen?'flex-start':'center',background:activeTab===item.id?T.bgSidebarHover:'transparent',color:activeTab===item.id?T.sidebarActive:T.sidebarText,border:'none',borderRadius:8,cursor:'pointer',fontSize:14,fontWeight:500,fontFamily:'inherit',transition:'all 0.15s',marginBottom:2}}>{item.icon}{sidebarOpen&&item.label}</button>)}</nav>
        <div style={{padding:sidebarOpen?'12px 20px':'12px 8px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          {sidebarOpen&&<div style={{marginBottom:12}}><div style={{fontSize:11,color:T.sidebarText,opacity:0.5,marginBottom:6}}>Currency</div><button onClick={()=>{const o=['GBP','USD','PKR'];setCurrency(o[(o.indexOf(currency)+1)%3]);}} style={{background:'rgba(255,255,255,0.1)',color:T.sidebarActive,border:'1px solid rgba(255,255,255,0.15)',borderRadius:4,padding:'3px 10px',cursor:'pointer',fontSize:12,fontFamily:'inherit',fontWeight:600}}>{currency} {sym}</button><div style={{marginTop:4,color:T.sidebarText,opacity:0.4,fontSize:10}}>£1 = ${exchangeRates.USD.toFixed(2)} = ₨{exchangeRates.PKR.toFixed(0)}</div><div style={{marginTop:2,fontSize:9,color:ratesLive?'#7dbd8a':T.sidebarText}}>{ratesLive?'● Live rates':'○ Fallback rates'}</div></div>}
          <button onClick={handleSignOut} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:sidebarOpen?'8px 12px':'8px 0',justifyContent:sidebarOpen?'flex-start':'center',background:'none',border:'none',color:T.sidebarText,opacity:0.6,cursor:'pointer',fontSize:13,fontFamily:'inherit'}}><IconLogout/>{sidebarOpen&&'Sign Out'}</button>
        </div>
      </aside>
      <main style={{flex:1,overflow:'auto',background:T.bg}}>
        {isMobile&&<div style={{padding:'12px 16px',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:12}}><button onClick={()=>setSidebarOpen(true)} style={{background:'none',border:'none',cursor:'pointer',padding:4,color:T.accent}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button><img src={LOGO_SRC} alt="RR" style={{width:28,height:28,borderRadius:6,objectFit:'cover'}}/><span style={{fontFamily:dsp,fontWeight:700,fontSize:15,color:T.accent}}>Retro Revival</span></div>}
        <div style={{maxWidth:1100,margin:'0 auto',padding:isMobile?'20px 16px':'32px 36px'}} className="fade-in" key={activeTab}>
          {activeTab==='dashboard'&&<DashboardTab {...sp}/>}{activeTab==='orders'&&<OrdersTab {...sp}/>}{activeTab==='inventory'&&<InventoryTab {...sp}/>}{activeTab==='procurement'&&<ProcurementTab {...sp}/>}{activeTab==='expenses'&&<ExpensesTab {...sp}/>}{activeTab==='calculator'&&<PriceCalcTab {...sp}/>}{activeTab==='finance'&&<FinanceTab {...sp}/>}{activeTab==='settings'&&<SettingsTab {...sp}/>}
        </div>
      </main>
    </div>
  );
}

/* ===== DASHBOARD ===== */
function DashboardTab({categories,brands,procurements,dispatches,expenses,rate,sym,setActiveTab}){
  const stock=getAvailableStock(procurements);const totalValue=stock.reduce((s,i)=>s+i.totalCostVal,0);
  const gn=(list,id)=>list.find(i=>i.id===id)?.name||'—';
  const [showOverdue,setShowOverdue]=useState(false);

  const dispatchedOrders=dispatches.filter(d=>d.order_status==='Dispatched');
  const pipelineOrders=dispatches.filter(d=>d.order_status&&!['Dispatched','Cancelled'].includes(d.order_status));
  const overdueOrders=dispatches.filter(d=>isOverdue(d));

  const historicalGMV=[{label:'Jan',gmv:6170},{label:'Feb',gmv:5672}];
  const periods=getBillingPeriods(dispatches,expenses);
  const periodGMVs=periods.map(p=>{const pD=dispatchedOrders.filter(d=>{const dt=new Date(d.dispatched_at);return dt>=p.start&&dt<=p.end;});const gmv=pD.reduce((s,d)=>s+(parseFloat(d.selling_price_gbp)||0),0);const ship=pD.reduce((s,d)=>s+(parseFloat(d.shipping_cost_gbp)||0),0);const comm=pD.reduce((s,d)=>{const r=parseFloat(d.selling_price_gbp)||0;const sh=parseFloat(d.shipping_cost_gbp)||0;const pc=parseFloat(d.commission_pct)||0;return s+Math.max(0,r-sh)*pc/100;},0);const cogs=pD.reduce((s,d)=>s+(d.dispatch_items||[]).reduce((ss,it)=>ss+it.quantity*parseFloat(it.unit_cost_gbp),0),0);const fE=(expenses||[]).filter(e=>{const dt=new Date(e.expense_date);return dt>=p.start&&dt<=p.end;});const directCosts=fE.filter(e=>e.category==='Direct Costs').reduce((s,e)=>s+parseFloat(e.amount_gbp),0);const opex=fE.filter(e=>e.category==='Opex').reduce((s,e)=>s+parseFloat(e.amount_gbp),0);const refunds=pD.reduce((s,d)=>s+(parseFloat(d.refund_amount_gbp)||0),0);const grossProfit=gmv-ship-comm-refunds-directCosts-cogs;const netProfit=grossProfit-opex;return{label:p.start.toLocaleDateString('en-GB',{month:'short'}),gmv,grossProfit,netProfit};});
  const historicalLabels=new Set(historicalGMV.map(h=>h.label));const liveOnly=periodGMVs.filter(p=>!historicalLabels.has(p.label));
  const allPeriods=[...historicalGMV.map(h=>({...h,grossProfit:0,netProfit:0,isHistorical:true})),...liveOnly.map(p=>({...p,isHistorical:false}))];
  const currentP=periodGMVs.length>0?periodGMVs[periodGMVs.length-1]:null;
  const pipelineGMV=pipelineOrders.reduce((s,d)=>s+(parseFloat(d.selling_price_gbp)||0),0);

  // Sparkline
  const svgW=600;const svgH=180;const padL=50;const padR=30;const padT=30;const padB=40;const maxGMV=Math.max(...allPeriods.map(p=>p.gmv),1);const plotW=svgW-padL-padR;const plotH=svgH-padT-padB;
  const pts=allPeriods.map((p,i)=>{const x=padL+(allPeriods.length>1?(i/(allPeriods.length-1))*plotW:plotW/2);const y=padT+plotH-(p.gmv/maxGMV)*plotH;return{x,y,...p};});
  const linePath=pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath=pts.length>0?linePath+` L${pts[pts.length-1].x.toFixed(1)},${padT+plotH} L${pts[0].x.toFixed(1)},${padT+plotH} Z`:'';

  // Kanban counts
  const kanbanCols=ORDER_STATUSES.map(s=>{const ords=dispatches.filter(d=>d.order_status===s);return{status:s,count:ords.length,gmv:ords.reduce((sum,d)=>sum+(parseFloat(d.selling_price_gbp)||0),0),overdue:ords.filter(d=>isOverdue(d)).length};});

  return(<div>
    <div style={{textAlign:'center',marginBottom:24}}><div style={{fontFamily:"'Noto Sans Arabic', serif",fontSize:28,color:T.accent,lineHeight:1.6,direction:'rtl'}}>{BISMILLAH}</div><div style={{fontSize:12,color:T.textMuted,fontStyle:'italic',marginTop:4}}>In the name of Allah, the Most Gracious, the Most Merciful</div></div>
    <h1 style={{fontFamily:dsp,fontSize:28,fontWeight:700,color:T.accent,margin:'0 0 6px'}}>Dashboard</h1>
    <p style={{color:T.textSecondary,fontSize:14,margin:'0 0 20px'}}>Overview of your business operations</p>
    <RizqQuote page="dashboard"/>

    {/* Summary Cards */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginBottom:32}}>
      <div style={crd}><div style={{fontSize:11,color:T.textSecondary,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Current Period GMV</div><div style={{fontSize:26,fontWeight:700,fontFamily:dsp,color:T.accent}}>{sym}{fmt(((currentP?.gmv||0)*rate),0)}</div><div style={{fontSize:12,color:T.textMuted,marginTop:4}}>{currentP?.label||'—'} period</div></div>
      <div style={crd}><div style={{fontSize:11,color:T.textSecondary,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Gross Profit</div><div style={{fontSize:26,fontWeight:700,fontFamily:dsp,color:(currentP?.grossProfit||0)>=0?T.green:T.red}}>{sym}{fmt(((currentP?.grossProfit||0)*rate),0)}</div><div style={{fontSize:12,color:T.textMuted,marginTop:4}}>after direct costs</div></div>
      <div style={crd}><div style={{fontSize:11,color:T.textSecondary,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Net Profit</div><div style={{fontSize:26,fontWeight:700,fontFamily:dsp,color:(currentP?.netProfit||0)>=0?T.green:T.red}}>{sym}{fmt(((currentP?.netProfit||0)*rate),0)}</div><div style={{fontSize:12,color:T.textMuted,marginTop:4}}>after all opex</div></div>
      <div style={crd}><div style={{fontSize:11,color:T.textSecondary,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Pipeline GMV</div><div style={{fontSize:26,fontWeight:700,fontFamily:dsp,color:T.amber}}>{sym}{fmt((pipelineGMV*rate),0)}</div><div style={{fontSize:12,color:T.textMuted,marginTop:4}}>{pipelineOrders.length} orders in progress</div></div>
      <div style={{...crd,cursor:overdueOrders.length>0?'pointer':'default',borderColor:overdueOrders.length>0?'rgba(179,58,58,0.3)':T.border,background:overdueOrders.length>0?'rgba(179,58,58,0.03)':T.bgCard}} onClick={()=>overdueOrders.length>0&&setShowOverdue(true)}><div style={{fontSize:11,color:overdueOrders.length>0?T.red:T.textSecondary,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Red Alert</div><div style={{fontSize:26,fontWeight:700,fontFamily:dsp,color:overdueOrders.length>0?T.red:T.textMuted}}>{overdueOrders.length}</div><div style={{fontSize:12,color:overdueOrders.length>0?T.red:T.textMuted,marginTop:4}}>{overdueOrders.length>0?'orders overdue 5+ days':'all clear'}</div></div>
    </div>

    {/* Sparkline */}
    {allPeriods.length>0&&<div style={{...crd,marginBottom:32}}><h2 style={{fontFamily:dsp,fontSize:18,color:T.accent,margin:'0 0 12px'}}>GMV Trend</h2><div style={{overflowX:'auto'}}><svg viewBox={`0 0 ${svgW} ${svgH}`} style={{width:'100%',maxWidth:svgW,height:'auto'}}><defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity="0.25"/><stop offset="100%" stopColor={T.accent} stopOpacity="0.02"/></linearGradient></defs>{[0,0.25,0.5,0.75,1].map((pct,i)=>{const y=padT+plotH-pct*plotH;const val=maxGMV*pct;return<g key={i}><line x1={padL} y1={y} x2={svgW-padR} y2={y} stroke={T.borderLight} strokeWidth="1" strokeDasharray={i===0?"0":"4,4"}/><text x={padL-8} y={y+4} textAnchor="end" fill={T.textMuted} fontSize="10" fontFamily={mono}>{sym}{fmt((val*rate),0)}</text></g>;})}{areaPath&&<path d={areaPath} fill="url(#areaGrad)"/>}<path d={linePath} fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>{pts.map((p,i)=>{const isCurrent=i===pts.length-1&&!p.isHistorical;return<g key={i}><circle cx={p.x} cy={p.y} r={isCurrent?6:4} fill={isCurrent?T.accent:T.bgCard} stroke={T.accent} strokeWidth="2"/>{isCurrent&&<circle cx={p.x} cy={p.y} r={10} fill="none" stroke={T.accent} strokeWidth="1" strokeOpacity="0.3"/>}<text x={p.x} y={padT+plotH+16} textAnchor="middle" fill={isCurrent?T.accent:T.textMuted} fontSize={isCurrent?"12":"11"} fontWeight={isCurrent?"700":"400"} fontFamily="var(--font-body)">{p.label}</text><text x={p.x} y={p.y-12} textAnchor="middle" fill={T.textSecondary} fontSize="10" fontFamily={mono}>{sym}{fmt((p.gmv*rate),0)}</text></g>;})}</svg></div></div>}

    {/* Kanban Board */}
    <h2 style={{fontFamily:dsp,fontSize:18,color:T.accent,margin:'0 0 16px'}}>Order Pipeline</h2>
    <div style={{display:'grid',gridTemplateColumns:`repeat(${ORDER_STATUSES.length}, 1fr)`,gap:12,marginBottom:32,overflowX:'auto'}}>
      {kanbanCols.map(col=>{const isActive=col.status!=='Dispatched'&&col.status!=='Cancelled';const hasOverdue=col.overdue>0;return<div key={col.status} style={{...crd,padding:'16px',textAlign:'center',borderColor:hasOverdue?'rgba(179,58,58,0.3)':col.status==='Dispatched'?'rgba(61,122,74,0.2)':T.border,background:hasOverdue?'rgba(179,58,58,0.03)':col.status==='Dispatched'?'rgba(61,122,74,0.03)':T.bgCard,minWidth:120}}>
        <div style={{fontSize:11,color:hasOverdue?T.red:T.textSecondary,textTransform:'uppercase',letterSpacing:1,marginBottom:8,fontWeight:600}}>{col.status}</div>
        <div style={{fontSize:28,fontWeight:700,fontFamily:dsp,color:hasOverdue?T.red:col.status==='Dispatched'?T.green:T.text}}>{col.count}</div>
        <div style={{fontSize:12,color:T.textMuted,marginTop:4,fontFamily:mono}}>{sym}{fmt((col.gmv*rate),0)}</div>
        {hasOverdue&&<div style={{fontSize:10,color:T.red,marginTop:4,fontWeight:600}}>{col.overdue} overdue</div>}
      </div>;})}
    </div>

    {/* Overdue Orders Modal */}
    <Modal open={showOverdue} onClose={()=>setShowOverdue(false)} title={`Red Alert — ${overdueOrders.length} Overdue Orders`} wide>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Order ID','Status','Placed','Days Overdue','GMV'].map(h=><th key={h} style={_th}>{h}</th>)}</tr></thead><tbody>{overdueOrders.map(d=>{const days=Math.floor((new Date()-new Date(d.placed_at))/(1000*60*60*24));return<tr key={d.id} style={{borderBottom:`1px solid ${T.borderLight}`}}><td style={{..._td,fontFamily:mono,color:T.red,fontWeight:600}}>{d.order_id}</td><td style={_td}><span style={{background:T.amberBg,color:T.amber,padding:'2px 8px',borderRadius:4,fontSize:11,fontWeight:600}}>{d.order_status}</span></td><td style={{..._td,color:T.textSecondary}}>{new Date(d.placed_at).toLocaleDateString('en-GB')}</td><td style={{..._td,color:T.red,fontWeight:700}}>{days} days</td><td style={{..._td,fontFamily:mono}}>{sym}{fmt(((parseFloat(d.selling_price_gbp)||0)*rate))}</td></tr>;})}</tbody></table></div>
    </Modal>
  </div>);
}

/* ===== ORDERS ===== */
function OrdersTab({supabase,user,categories,brands,salesChannels,procurements,dispatches,settings,loadAll,rate,sym}){
  const defaultComm=parseFloat(settings.default_commission_pct||'0');
  const defaultChannel=salesChannels.find(c=>c.is_default)?.id||'';
  const stock=getAvailableStock(procurements);const gn=(list,id)=>list.find(i=>i.id===id)?.name||'—';
  const [statusFilter,setStatusFilter]=useState('Active');
  const [showNew,setShowNew]=useState(false);const [viewOrder,setViewOrder]=useState(null);const [editOrder,setEditOrder]=useState(null);const [dispatchModal,setDispatchModal]=useState(null);
  const [orderId,setOrderId]=useState('');const [orderDate,setOrderDate]=useState(new Date().toISOString().slice(0,10));const [sellPrice,setSellPrice]=useState('');
  const [shipping,setShipping]=useState('');const [commission,setCommission]=useState(defaultComm.toString());const [channelId,setChannelId]=useState(defaultChannel);const [notes,setNotes]=useState('');
  const [items,setItems]=useState([{stockKey:'',qty:''}]);const [error,setError]=useState('');const [saving,setSaving]=useState(false);
  const [marginAlert,setMarginAlert]=useState({open:false,margin:0});

  const filtered=statusFilter==='Active'?dispatches.filter(d=>d.order_status&&!['Dispatched','Cancelled'].includes(d.order_status)):statusFilter==='All'?dispatches:dispatches.filter(d=>d.order_status===statusFilter);
  const spVal=parseFloat(sellPrice)||0;const shVal=parseFloat(shipping)||0;const commPct=parseFloat(commission)||0;const commBase=Math.max(0,spVal-shVal);const commAmt=commBase*commPct/100;

  function addItem(){setItems([...items,{stockKey:'',qty:''}]);}function removeItem(i){setItems(items.filter((_,idx)=>idx!==i));}function updateItem(i,f,v){const n=[...items];n[i]={...n[i],[f]:v};setItems(n);}

  async function placeOrder(e){
    e.preventDefault();setError('');if(!orderId.trim()){setError('Order ID is required');return;}
    const valid=items.filter(it=>it.stockKey&&it.qty&&parseInt(it.qty)>0);if(!valid.length){setError('Add at least one item');return;}
    setSaving(true);const priceGbp=spVal;const shipGbp=shVal;const uName=user?.user_metadata?.full_name||user?.email||'';
    const dItems=valid.map(item=>{const[c,b]=item.stockKey.split('|');return{category_id:c,brand_id:b,quantity:parseInt(item.qty)};});
    const{error:rpcErr}=await supabase.rpc('place_order',{p_order_id:orderId.trim(),p_placed_date:new Date(orderDate).toISOString(),p_selling_price:priceGbp,p_items:dItems,p_commission_pct:commPct,p_shipping_cost:shipGbp,p_logged_by_name:uName,p_sales_channel_id:channelId||null,p_notes:notes||null});
    if(rpcErr){setError(rpcErr.message||'Failed to place order');}else{setOrderId('');setSellPrice('');setShipping('');setCommission(defaultComm.toString());setChannelId(defaultChannel);setNotes('');setItems([{stockKey:'',qty:''}]);setOrderDate(new Date().toISOString().slice(0,10));setShowNew(false);await loadAll();}
    setSaving(false);
  }

  async function advanceStatus(d,targetStatus){
    if(targetStatus==='Dispatched'){setDispatchModal(d);return;}
    const targetIdx=ORDER_STATUSES.indexOf(targetStatus);const now=new Date().toISOString();
    const updates={order_status:targetStatus};
    // Auto-fill all skipped timestamps up to target
    const tsFields=['placed_at','qa_at','washing_at','ready_at'];
    for(let i2=0;i2<=targetIdx&&i2<tsFields.length;i2++){if(!d[tsFields[i2]])updates[tsFields[i2]]=now;}
    await supabase.from('dispatches').update(updates).eq('id',d.id);await loadAll();
  }

  async function cancelOrder(d){if(!confirm(`Cancel order ${d.order_id}? Stock will be released.`))return;const{error}=await supabase.rpc('cancel_order',{p_dispatch_id:d.id});if(!error)await loadAll();else alert(error.message);}
  async function deleteOrder(d){if(!confirm(`Delete order ${d.order_id}? This cannot be undone.`))return;const{error}=await supabase.rpc('delete_dispatch',{p_dispatch_id:d.id});if(!error)await loadAll();else alert(error.message);}

  async function finalizeDispatch(){
    if(!dispatchModal)return;setSaving(true);
    const dItems=(dispatchModal.dispatch_items||[]).map(it=>({dispatch_item_id:it.id,dispatched_qty:it._dispQty||it.placed_qty||it.quantity}));
    const{error}=await supabase.rpc('finalize_dispatch',{p_dispatch_id:dispatchModal.id,p_dispatched_items:dItems});
    if(!error){
      // Check margin
      const totalCost=dItems.reduce((s,di)=>{const it=(dispatchModal.dispatch_items||[]).find(x=>x.id===di.dispatch_item_id);return s+(it?di.dispatched_qty*parseFloat(it.unit_cost_gbp):0);},0);
      const rev=parseFloat(dispatchModal.selling_price_gbp)||0;const ship=parseFloat(dispatchModal.shipping_cost_gbp)||0;const comm=parseFloat(dispatchModal.commission_pct)||0;const commA2=Math.max(0,rev-ship)*comm/100;const net=rev-ship-commA2-totalCost;const margin=rev?(net/rev*100):0;
      if(margin<35||margin>70)setMarginAlert({open:true,margin});
      setDispatchModal(null);await loadAll();
    }else{alert(error.message);}
    setSaving(false);
  }

  async function saveEditOrder(){
    if(!editOrder)return;setSaving(true);
    await supabase.from('dispatches').update({order_id:editOrder.order_id,selling_price_gbp:parseFloat(editOrder._sellPrice),shipping_cost_gbp:parseFloat(editOrder._shipping||0),commission_pct:parseFloat(editOrder._commPct||0),sales_channel_id:editOrder._channelId||null,notes:editOrder._notes||null}).eq('id',editOrder.id);
    setEditOrder(null);await loadAll();setSaving(false);
  }

  const statusColor=(s)=>s==='Placed'?T.accent:s==='QA'?T.amber:s==='Washing'?'#6B8DD6':s==='Ready'?'#3D7A4A':s==='Dispatched'?T.green:s==='Cancelled'?T.red:T.textMuted;

  return(<div>
    <h1 style={{fontFamily:dsp,fontSize:28,fontWeight:700,color:T.accent,margin:'0 0 6px'}}>Orders</h1>
    <p style={{color:T.textSecondary,fontSize:14,margin:'0 0 20px'}}>Manage order lifecycle from placement to dispatch</p>
    <RizqQuote page="orders"/>

    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,flexWrap:'wrap',gap:12}}>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{['Active','Placed','QA','Washing','Ready','Dispatched','Cancelled','All'].map(s=><button key={s} onClick={()=>setStatusFilter(s)} style={{background:statusFilter===s?T.accent:'transparent',color:statusFilter===s?'#fff':T.textSecondary,border:`1px solid ${statusFilter===s?T.accent:T.border}`,borderRadius:6,padding:'6px 14px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:12}}>{s}</button>)}</div>
      <button onClick={()=>setShowNew(true)} style={{...btnP,padding:'10px 20px',display:'flex',alignItems:'center',gap:8}}><IconPlus/> New Order</button>
    </div>

    {/* Order List */}
    <div style={{...crd,padding:0,overflow:'hidden'}}>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Date','Order ID','Status','Channel','GMV','Items','Notes','Actions'].map(h=><th key={h} style={_th}>{h}</th>)}</tr></thead><tbody>
        {filtered.length>0?filtered.map(d=>{const rev=parseFloat(d.selling_price_gbp)||0;const overdue=isOverdue(d);const canAdvance=d.order_status&&!['Dispatched','Cancelled'].includes(d.order_status);const canEdit=d.order_status!=='Cancelled';const itemDesc=(d.dispatch_items||[]).map(it=>`${gn(categories,it.category_id)}/${gn(brands,it.brand_id)} x${it.placed_qty||it.quantity}`).join(', ');
        return<tr key={d.id} style={{borderBottom:`1px solid ${T.borderLight}`,background:overdue?'rgba(179,58,58,0.04)':'transparent'}}>
          <td style={{..._td,color:T.textSecondary,fontSize:12}}>{new Date(d.placed_at||d.dispatched_at).toLocaleDateString('en-GB')}{overdue&&<div style={{color:T.red,fontSize:10,fontWeight:600}}>OVERDUE</div>}</td>
          <td style={_td}><button onClick={()=>setViewOrder(d)} style={{background:'none',border:'none',color:T.accent,cursor:'pointer',fontFamily:mono,fontSize:12,padding:0,textDecoration:'underline',fontWeight:600}}>{d.order_id}</button></td>
          <td style={_td}><span style={{background:`${statusColor(d.order_status)}15`,color:statusColor(d.order_status),padding:'3px 10px',borderRadius:4,fontSize:11,fontWeight:600}}>{d.order_status}</span></td>
          <td style={{..._td,fontSize:12}}>{d.sales_channel_id?gn(salesChannels,d.sales_channel_id):'—'}</td>
          <td style={{..._td,fontFamily:mono}}>{sym}{fmt((rev*rate))}</td>
          <td style={{..._td,fontSize:11,color:T.textSecondary,maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{itemDesc||'—'}</td>
          <td style={{..._td,fontSize:11,color:T.textMuted,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.notes||'—'}</td>
          <td style={_td}><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {canAdvance&&<select onChange={e=>{if(e.target.value)advanceStatus(d,e.target.value);e.target.value='';}} defaultValue="" style={{background:T.accentBg,color:T.accent,border:`1px solid ${T.accentBorder}`,borderRadius:4,padding:'4px 8px',cursor:'pointer',fontSize:11,fontWeight:600,fontFamily:'inherit'}}><option value="" disabled>Move to...</option>{ORDER_STATUSES.slice(ORDER_STATUSES.indexOf(d.order_status)+1).map(s=><option key={s} value={s}>{s}</option>)}</select>}
            {canEdit&&<button onClick={()=>setEditOrder({...d,_sellPrice:''+rev.toFixed(2),_shipping:''+((parseFloat(d.shipping_cost_gbp)||0)).toFixed(2),_commPct:''+parseFloat(d.commission_pct||0),_channelId:d.sales_channel_id||'',_notes:d.notes||''})} style={{background:'none',border:'none',color:T.accent,cursor:'pointer',opacity:0.6,padding:4}}><IconEdit/></button>}
            {canAdvance&&<button onClick={()=>cancelOrder(d)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',opacity:0.5,padding:4,fontSize:10}}>Cancel</button>}
            <button onClick={()=>deleteOrder(d)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',opacity:0.4,padding:4}}><IconTrash/></button>
          </div></td>
        </tr>;}):
        <tr><td colSpan={8} style={{..._td,textAlign:'center',color:T.textMuted,padding:30}}>No orders found</td></tr>}
      </tbody></table></div>
    </div>

    <MarginAlert open={marginAlert.open} margin={marginAlert.margin} onClose={()=>setMarginAlert({open:false,margin:0})}/>

    {/* New Order Modal */}
    <Modal open={showNew} onClose={()=>setShowNew(false)} title="Place New Order" wide>
      <form onSubmit={placeOrder}>
        {error&&<div style={{background:'rgba(179,58,58,0.08)',border:'1px solid rgba(179,58,58,0.3)',borderRadius:8,padding:'10px 14px',marginBottom:16,color:T.red,fontSize:13}}>{error}</div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginBottom:16}}>
          <div><label style={lbl}>Order ID</label><input value={orderId} onChange={e=>setOrderId(e.target.value)} placeholder="e.g. 133759/94" style={inp}/></div>
          <div><label style={lbl}>Order Date</label><input type="date" value={orderDate} onChange={e=>setOrderDate(e.target.value)} style={inp}/></div>
          <div><label style={lbl}>GMV (£ GBP)</label><input type="number" step="0.01" min="0" value={sellPrice} onChange={e=>setSellPrice(e.target.value)} placeholder="Total order value" style={inp}/></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginBottom:16}}>
          <div><label style={lbl}>Shipping (£ GBP)</label><input type="number" step="0.01" min="0" value={shipping} onChange={e=>setShipping(e.target.value)} placeholder="0.00" style={inp}/></div>
          <div><label style={lbl}>Commission %</label><input type="number" step="0.01" min="0" max="100" value={commission} onChange={e=>setCommission(e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Channel</label><select value={channelId} onChange={e=>setChannelId(e.target.value)} style={sel}><option value="">Select</option>{salesChannels.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <div style={{marginBottom:16}}><label style={lbl}>Notes <span style={{opacity:0.5,fontWeight:400,textTransform:'none'}}>optional</span></label><input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Quality notes, customer info..." style={inp}/></div>
        <label style={{...lbl,marginBottom:12}}>Order Items</label>
        {items.map((item,i)=><div key={i} style={{display:'flex',gap:12,marginBottom:10,alignItems:'center'}}><select value={item.stockKey} onChange={e=>updateItem(i,'stockKey',e.target.value)} style={{...sel,flex:3}}><option value="">Select stock item</option>{stock.map(s=>{const key=`${s.category_id}|${s.brand_id}`;return<option key={key} value={key}>{gn(categories,s.category_id)} / {gn(brands,s.brand_id)} — {s.totalQty} avail</option>;})}</select><input type="number" min="1" value={item.qty} onChange={e=>updateItem(i,'qty',e.target.value)} placeholder="Qty" style={{...inp,flex:1}}/>{items.length>1&&<button type="button" onClick={()=>removeItem(i)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',padding:4}}><IconX/></button>}</div>)}
        <button type="button" onClick={addItem} style={{...btnS,padding:'8px 16px',display:'flex',alignItems:'center',gap:6,marginBottom:20}}><IconPlus/> Add Item</button>
        <button type="submit" disabled={saving} style={{...btnP,opacity:saving?0.6:1}}>{saving?'Placing...':'Place Order'}</button>
      </form>
    </Modal>

    {/* Edit Order Modal */}
    <Modal open={!!editOrder} onClose={()=>setEditOrder(null)} title="Edit Order">
      {editOrder&&<div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginBottom:16}}>
          <div><label style={lbl}>Order ID</label><input value={editOrder.order_id} onChange={e=>setEditOrder({...editOrder,order_id:e.target.value})} style={inp}/></div>
          <div><label style={lbl}>GMV (£ GBP)</label><input type="number" step="0.01" value={editOrder._sellPrice} onChange={e=>setEditOrder({...editOrder,_sellPrice:e.target.value})} style={inp}/></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginBottom:16}}>
          <div><label style={lbl}>Shipping (£ GBP)</label><input type="number" step="0.01" value={editOrder._shipping} onChange={e=>setEditOrder({...editOrder,_shipping:e.target.value})} style={inp}/></div>
          <div><label style={lbl}>Commission %</label><input type="number" step="0.01" value={editOrder._commPct} onChange={e=>setEditOrder({...editOrder,_commPct:e.target.value})} style={inp}/></div>
          <div><label style={lbl}>Channel</label><select value={editOrder._channelId} onChange={e=>setEditOrder({...editOrder,_channelId:e.target.value})} style={sel}><option value="">None</option>{salesChannels.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <div style={{marginBottom:16}}><label style={lbl}>Notes</label><input value={editOrder._notes} onChange={e=>setEditOrder({...editOrder,_notes:e.target.value})} style={inp}/></div>
        <button onClick={saveEditOrder} disabled={saving} style={btnP}>{saving?'Saving...':'Save Changes'}</button>
      </div>}
    </Modal>

    {/* Dispatch Confirmation Modal */}
    <Modal open={!!dispatchModal} onClose={()=>setDispatchModal(null)} title={`Dispatch Order ${dispatchModal?.order_id}`} wide>
      {dispatchModal&&<div>
        <p style={{color:T.textSecondary,fontSize:13,marginBottom:16}}>Confirm dispatch quantities. You can reduce but not increase quantities. Reduced items return to available stock.</p>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,marginBottom:20}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Item','Placed Qty','Dispatch Qty'].map(h=><th key={h} style={_th}>{h}</th>)}</tr></thead><tbody>
          {(dispatchModal.dispatch_items||[]).map((it,i)=>{const placedQ=it.placed_qty||it.quantity;const dispQ=it._dispQty!==undefined?it._dispQty:placedQ;return<tr key={it.id} style={{borderBottom:`1px solid ${T.borderLight}`}}>
            <td style={_td}>{gn(categories,it.category_id)} / {gn(brands,it.brand_id)}</td>
            <td style={{..._td,fontFamily:mono}}>{placedQ}</td>
            <td style={_td}><input type="number" min="0" max={placedQ} value={dispQ} onChange={e=>{const newItems=[...(dispatchModal.dispatch_items||[])];newItems[i]={...newItems[i],_dispQty:Math.min(placedQ,Math.max(0,parseInt(e.target.value)||0))};setDispatchModal({...dispatchModal,dispatch_items:newItems});}} style={{...inp,width:80,textAlign:'center'}}/></td>
          </tr>;})}
        </tbody></table>
        {(()=>{const totalPlaced=(dispatchModal.dispatch_items||[]).reduce((s,it)=>s+(it.placed_qty||it.quantity),0);const totalDisp=(dispatchModal.dispatch_items||[]).reduce((s,it)=>s+(it._dispQty!==undefined?it._dispQty:(it.placed_qty||it.quantity)),0);const unfulfilled=totalPlaced-totalDisp;return unfulfilled>0?<div style={{background:T.amberBg,border:`1px solid ${T.amberBorder}`,borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:T.amber}}><strong>{unfulfilled} items</strong> will be returned to available stock as unfulfilled.</div>:null;})()}
        <button onClick={finalizeDispatch} disabled={saving} style={{...btnP,opacity:saving?0.6:1}}>{saving?'Dispatching...':'Confirm Dispatch'}</button>
      </div>}
    </Modal>

    {/* View Order Detail Modal */}
    <Modal open={!!viewOrder} onClose={()=>setViewOrder(null)} title={viewOrder?`Order ${viewOrder.order_id}`:''} wide>
      {viewOrder&&(()=>{const rev=parseFloat(viewOrder.selling_price_gbp)||0;const ship=parseFloat(viewOrder.shipping_cost_gbp)||0;const comm=parseFloat(viewOrder.commission_pct)||0;const commBase2=Math.max(0,rev-ship);const commAmt2=commBase2*comm/100;const its=viewOrder.dispatch_items||[];const orderCogs=its.reduce((s,it)=>s+(it.dispatched_qty||it.quantity)*parseFloat(it.unit_cost_gbp),0);const refund=parseFloat(viewOrder.refund_amount_gbp||0);const net=rev-ship-commAmt2-orderCogs-refund;const placedGMV=parseFloat(viewOrder.placed_selling_price_gbp||rev);const unfulfilled=placedGMV-rev;
      return<div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))',gap:12,marginBottom:20}}>
          {[{l:'Status',v:viewOrder.order_status,c:statusColor(viewOrder.order_status)},{l:'Channel',v:viewOrder.sales_channel_id?gn(salesChannels,viewOrder.sales_channel_id):'—'},{l:'Placed',v:viewOrder.placed_at?new Date(viewOrder.placed_at).toLocaleDateString('en-GB'):'—'},{l:'Payment',v:viewOrder.payment_status||'Pending'},{l:'Logged By',v:viewOrder.logged_by_name||'—'}].map((box,i)=><div key={i} style={{background:T.bg,borderRadius:8,padding:'10px 14px'}}><div style={{fontSize:11,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>{box.l}</div><div style={{fontWeight:600,color:box.c||T.text}}>{box.v}</div></div>)}
        </div>
        {viewOrder.notes&&<div style={{background:T.bg,borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:13,color:T.textSecondary}}><strong>Notes:</strong> {viewOrder.notes}</div>}
        <h4 style={{fontSize:13,color:T.textSecondary,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Items</h4>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,marginBottom:16}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Item','Placed','Dispatched','Unit Cost','Total'].map(h=><th key={h} style={_th}>{h}</th>)}</tr></thead><tbody>{its.map((it,i)=><tr key={i} style={{borderBottom:`1px solid ${T.borderLight}`}}><td style={_td}>{gn(categories,it.category_id)} / {gn(brands,it.brand_id)}</td><td style={_td}>{it.placed_qty||it.quantity}</td><td style={_td}>{it.dispatched_qty!==null&&it.dispatched_qty!==undefined?it.dispatched_qty:'—'}</td><td style={{..._td,fontFamily:mono}}>{sym}{fmt((parseFloat(it.unit_cost_gbp)*rate))}</td><td style={{..._td,fontFamily:mono}}>{sym}{fmt(((it.dispatched_qty||it.quantity)*parseFloat(it.unit_cost_gbp)*rate))}</td></tr>)}</tbody></table>
        <h4 style={{fontSize:13,color:T.textSecondary,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Financials</h4>
        <div style={{background:T.bg,borderRadius:10,padding:16,fontSize:14}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span>GMV</span><span style={{fontFamily:mono,fontWeight:600}}>{sym}{fmt((rev*rate))}</span></div>
          {unfulfilled>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:6,color:T.amber}}><span>Unfulfilled GMV</span><span style={{fontFamily:mono}}>{sym}{fmt((unfulfilled*rate))}</span></div>}
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,color:T.textSecondary}}><span>Shipping</span><span style={{fontFamily:mono}}>({sym}{fmt((ship*rate))})</span></div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,color:T.textSecondary}}><span>Commission ({comm}%)</span><span style={{fontFamily:mono}}>({sym}{fmt((commAmt2*rate))})</span></div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,color:T.textSecondary}}><span>COGS</span><span style={{fontFamily:mono}}>({sym}{fmt((orderCogs*rate))})</span></div>
          {refund>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:6,color:T.red}}><span>Refund</span><span style={{fontFamily:mono}}>({sym}{fmt((refund*rate))})</span></div>}
          <div style={{borderTop:`2px solid ${T.border}`,paddingTop:8,marginTop:8,display:'flex',justifyContent:'space-between',fontWeight:700}}><span>Net P&L</span><span style={{fontFamily:mono,color:net>=0?T.green:T.red}}>{sym}{fmt((net*rate))}</span></div>
        </div>
      </div>;})()}
    </Modal>
  </div>);
}

/* ===== INVENTORY ===== */
function InventoryTab({categories,brands,procurements,rate,sym}){
  const [filterCat,setFilterCat]=useState('');const [filterBrand,setFilterBrand]=useState('');
  const gn=(list,id)=>list.find(i=>i.id===id)?.name||'—';
  const stock=getAvailableStock(procurements);
  const filtered=stock.filter(s=>{if(filterCat&&s.category_id!==filterCat)return false;if(filterBrand&&s.brand_id!==filterBrand)return false;return true;});
  const stockCats=[...new Set(stock.map(s=>s.category_id))];const stockBrands=[...new Set(stock.map(s=>s.brand_id))];
  const totalAvail=filtered.reduce((s,i)=>s+i.totalQty,0);const totalReserved=filtered.reduce((s,i)=>s+i.reservedQty,0);const totalValue=filtered.reduce((s,i)=>s+i.totalCostVal,0);

  return(<div>
    <h1 style={{fontFamily:dsp,fontSize:28,fontWeight:700,color:T.accent,margin:'0 0 6px'}}>Inventory</h1>
    <p style={{color:T.textSecondary,fontSize:14,margin:'0 0 20px'}}>Stock levels with available, reserved and total values</p>
    <RizqQuote page="inventory"/>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginBottom:24}}>
      <div style={crd}><div style={{fontSize:11,color:T.textSecondary,textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Available</div><div style={{fontSize:24,fontWeight:700,fontFamily:dsp,color:T.green}}>{totalAvail} units</div></div>
      <div style={crd}><div style={{fontSize:11,color:T.textSecondary,textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Reserved</div><div style={{fontSize:24,fontWeight:700,fontFamily:dsp,color:T.amber}}>{totalReserved} units</div></div>
      <div style={crd}><div style={{fontSize:11,color:T.textSecondary,textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Inventory Value</div><div style={{fontSize:24,fontWeight:700,fontFamily:dsp,color:T.text}}>{sym}{fmt((totalValue*rate),0)}</div><div style={{fontSize:11,color:T.textMuted,marginTop:2}}>AVCO cost basis (available)</div></div>
    </div>

    <div style={{...crd,padding:0,overflow:'hidden'}}>
      <div style={{display:'flex',gap:12,padding:'16px 20px',flexWrap:'wrap',alignItems:'center'}}>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{...sel,width:'auto',minWidth:160,fontSize:13,padding:'8px 10px'}}><option value="">All Categories</option>{stockCats.map(id=><option key={id} value={id}>{gn(categories,id)}</option>)}</select>
        <select value={filterBrand} onChange={e=>setFilterBrand(e.target.value)} style={{...sel,width:'auto',minWidth:160,fontSize:13,padding:'8px 10px'}}><option value="">All Brands</option>{stockBrands.map(id=><option key={id} value={id}>{gn(brands,id)}</option>)}</select>
        {(filterCat||filterBrand)&&<button onClick={()=>{setFilterCat('');setFilterBrand('');}} style={{background:'none',border:'none',color:T.accent,cursor:'pointer',fontSize:12,fontFamily:'inherit',textDecoration:'underline'}}>Clear</button>}
      </div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Category','Brand','Available','Reserved','Total','AVCO Cost/Unit'].map(h=><th key={h} style={_th}>{h}</th>)}</tr></thead><tbody>
        {filtered.length>0?filtered.map((s,i)=><tr key={i} style={{borderBottom:`1px solid ${T.borderLight}`}}>
          <td style={_td}>{gn(categories,s.category_id)}</td>
          <td style={_td}>{gn(brands,s.brand_id)}</td>
          <td style={{..._td,fontWeight:600,color:T.green}}>{s.totalQty}</td>
          <td style={{..._td,fontWeight:600,color:s.reservedQty>0?T.amber:T.textMuted}}>{s.reservedQty}</td>
          <td style={{..._td,fontWeight:600}}>{s.totalQty+s.reservedQty}</td>
          <td style={{..._td,fontFamily:mono}}>{sym}{fmt((s.avgCost*rate))}</td>
        </tr>):
        <tr><td colSpan={6} style={{..._td,textAlign:'center',color:T.textMuted,padding:30}}>No stock found</td></tr>}
      </tbody></table></div>
    </div>
  </div>);
}

/* ===== PROCUREMENT ===== */
function ProcurementTab({supabase,user,categories,brands,suppliers,procurements,loadAll,rate,sym}){
  const [form,setForm]=useState({category_id:'',brand_id:'',supplier_id:'',unitCost:'',quantity:'',date:new Date().toISOString().slice(0,10),is_paid:true});
  const [addingField,setAddingField]=useState(null);const [newOpt,setNewOpt]=useState('');const [saving,setSaving]=useState(false);
  const [editProc,setEditProc]=useState(null);const [filterCat,setFilterCat]=useState('');const [filterBrand,setFilterBrand]=useState('');
  const [csvRows,setCsvRows]=useState(null);const [csvImporting,setCsvImporting]=useState(false);const [csvError,setCsvError]=useState('');
  const gn=(list,id)=>list.find(i=>i.id===id)?.name||'—';

  async function submit(e){e.preventDefault();if(!form.category_id||!form.brand_id||!form.unitCost||!form.quantity)return;setSaving(true);const qty=parseInt(form.quantity);const upGbp=parseFloat(form.unitCost)/rate;const uName=user?.user_metadata?.full_name||user?.email||'';await supabase.from('procurements').insert({category_id:form.category_id,brand_id:form.brand_id,supplier_id:form.supplier_id||null,unit_price_gbp:upGbp,quantity:qty,remaining_qty:qty,procured_at:form.date,logged_by_name:uName,is_paid:form.is_paid});setForm({category_id:'',brand_id:'',supplier_id:'',unitCost:'',quantity:'',date:new Date().toISOString().slice(0,10),is_paid:true});await loadAll();setSaving(false);}
  async function quickAdd(field){if(!newOpt.trim())return;const table=field==='category'?'categories':field==='brand'?'brands':'suppliers';const fk=field==='category'?'category_id':field==='brand'?'brand_id':'supplier_id';const{data}=await supabase.from(table).insert({name:newOpt.trim()}).select().single();if(data){setForm(p=>({...p,[fk]:data.id}));await loadAll();}setNewOpt('');setAddingField(null);}
  async function removeOpt(field,id){const table=field==='category'?'categories':field==='brand'?'brands':'suppliers';await supabase.from(table).delete().eq('id',id);await loadAll();}
  async function delProc(id){if(!confirm('Delete this procurement?'))return;await supabase.from('procurements').delete().eq('id',id);await loadAll();}
  async function saveEdit(){if(!editProc)return;setSaving(true);const qty=parseInt(editProc.quantity);const upGbp=parseFloat(editProc.unit_price_gbp)/rate;const dispatched=editProc._origQty-editProc._origRemaining;const newRemaining=Math.max(0,qty-dispatched);await supabase.from('procurements').update({category_id:editProc.category_id,brand_id:editProc.brand_id,supplier_id:editProc.supplier_id||null,unit_price_gbp:upGbp,quantity:qty,remaining_qty:newRemaining,procured_at:editProc.procured_at,is_paid:editProc.is_paid}).eq('id',editProc.id);setEditProc(null);await loadAll();setSaving(false);}

  function parseCSV(text){const lines=text.split(/\r?\n/).filter(l=>l.trim());if(lines.length<2){setCsvError('Need header + data');return;}const hdr=lines[0].split(',').map(h=>h.trim().toLowerCase().replace(/['"]/g,''));const catIdx=hdr.findIndex(h=>h.includes('category')||h.includes('cat'));const brIdx=hdr.findIndex(h=>h.includes('brand'));const qtyIdx=hdr.findIndex(h=>h.includes('quantity')||h.includes('qty'));const ucIdx=hdr.findIndex(h=>h.includes('unit cost')||h.includes('unit price')||h.includes('unitcost')||h.includes('unitprice')||h.includes('unit_cost')||h.includes('unit_price'));const tcIdx=hdr.findIndex(h=>h.includes('total cost')||h.includes('total price')||h.includes('totalcost')||h.includes('totalprice')||h.includes('total_cost')||h.includes('total_price'));if(catIdx<0||brIdx<0||qtyIdx<0){setCsvError('Need: Category, Brand, Quantity');return;}if(ucIdx<0&&tcIdx<0){setCsvError('Need Unit Cost or Total Cost');return;}const rows=[];for(let i=1;i<lines.length;i++){const vals=lines[i].split(',').map(v=>v.replace(/^[\s"']+|[\s"']+$/g,''));if(vals.length<=Math.max(catIdx,brIdx,qtyIdx))continue;const qty=parseInt(vals[qtyIdx]);if(!qty||qty<=0)continue;let unitCost=0;if(ucIdx>=0&&vals[ucIdx])unitCost=parseFloat(vals[ucIdx].replace(/[^0-9.-]/g,''))||0;else if(tcIdx>=0&&vals[tcIdx]){const tc=parseFloat(vals[tcIdx].replace(/[^0-9.-]/g,''))||0;unitCost=tc/qty;}if(unitCost<=0)continue;rows.push({category:vals[catIdx],brand:vals[brIdx],quantity:qty,unitCost});}if(!rows.length){setCsvError('No valid rows');return;}setCsvError('');setCsvRows(rows);}
  function handleCsvFile(e){const file=e.target.files?.[0];if(!file)return;setCsvError('');setCsvRows(null);const reader=new FileReader();reader.onload=ev=>{parseCSV(ev.target.result);};reader.readAsText(file);e.target.value='';}
  async function importCsv(){if(!csvRows?.length)return;setCsvImporting(true);const uName=user?.user_metadata?.full_name||user?.email||'';const today=new Date().toISOString().slice(0,10);const existCats=new Set(categories.map(c=>c.name.toLowerCase()));const existBrands=new Set(brands.map(b=>b.name.toLowerCase()));const newCats=[...new Set(csvRows.map(r=>r.category).filter(c=>!existCats.has(c.toLowerCase())))];const newBrands=[...new Set(csvRows.map(r=>r.brand).filter(b=>!existBrands.has(b.toLowerCase())))];if(newCats.length)await supabase.from('categories').insert(newCats.map(n=>({name:n})));if(newBrands.length)await supabase.from('brands').insert(newBrands.map(n=>({name:n})));const[rc,rb]=await Promise.all([supabase.from('categories').select('*'),supabase.from('brands').select('*')]);const allCats=rc.data||[];const allBrands=rb.data||[];const inserts=csvRows.map(r=>{const catId=allCats.find(c=>c.name.toLowerCase()===r.category.toLowerCase())?.id;const brId=allBrands.find(b=>b.name.toLowerCase()===r.brand.toLowerCase())?.id;if(!catId||!brId)return null;return{category_id:catId,brand_id:brId,unit_price_gbp:r.unitCost/rate,quantity:r.quantity,remaining_qty:r.quantity,procured_at:today,logged_by_name:uName,is_paid:true};}).filter(Boolean);if(inserts.length)await supabase.from('procurements').insert(inserts);setCsvRows(null);setCsvImporting(false);await loadAll();}

  function DD({label,field,options,value,onChange}){const isA=addingField===field;const empty=options.length===0;return(<div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}><label style={{...lbl,marginBottom:0}}>{label}</label>{options.length>0&&<button onClick={()=>{setAddingField(isA?null:field);setNewOpt('');}} style={{background:'none',border:'none',color:T.accent,cursor:'pointer',fontSize:11,fontFamily:'inherit',padding:0}}>{isA?'Cancel':'Manage'}</button>}</div>{isA?(<div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:12}}><div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>{options.map(o=><span key={o.id} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:6,padding:'5px 10px',fontSize:12,display:'inline-flex',alignItems:'center',gap:6}}>{o.name}<button onClick={()=>removeOpt(field,o.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',padding:0,lineHeight:1,opacity:0.7}}><IconX/></button></span>)}</div><div style={{display:'flex',gap:8}}><input autoFocus value={newOpt} onChange={e=>setNewOpt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&quickAdd(field)} placeholder="Add..." style={{...inp,padding:'8px 10px',fontSize:13}}/><button onClick={()=>quickAdd(field)} style={{background:T.accent,color:'#fff',border:'none',borderRadius:8,padding:'8px 14px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:13}}><IconPlus/></button></div></div>):empty?(<div style={{display:'flex',gap:8}}><input value={''} onChange={e=>{setAddingField(field);setNewOpt(e.target.value);}} onFocus={()=>setAddingField(field)} onKeyDown={e=>e.key==='Enter'&&quickAdd(field)} placeholder={`Add first ${label.toLowerCase()}...`} style={{...inp,flex:1,borderStyle:'dashed'}}/><button onClick={()=>quickAdd(field)} style={{...btnS,padding:'10px 14px',display:'flex',alignItems:'center',gap:4}}><IconPlus/> Add</button></div>):(<div style={{display:'flex',gap:8}}><select value={value} onChange={e=>onChange(e.target.value)} style={{...sel,flex:1}}><option value="">Select {label.toLowerCase()}</option>{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select><button onClick={()=>{setAddingField(field);setNewOpt('');}} style={{...btnS,padding:'10px 12px',display:'flex',alignItems:'center'}}><IconPlus/></button></div>)}</div>);}

  const sorted=[...procurements].sort((a,b)=>new Date(b.procured_at)-new Date(a.procured_at));
  const filteredProcs=sorted.filter(p=>{if(filterCat&&p.category_id!==filterCat)return false;if(filterBrand&&p.brand_id!==filterBrand)return false;return true;});

  return(<div>
    <h1 style={{fontFamily:dsp,fontSize:28,fontWeight:700,color:T.accent,margin:'0 0 6px'}}>Procurement</h1>
    <p style={{color:T.textSecondary,fontSize:14,margin:'0 0 20px'}}>Record stock purchases · AVCO costing</p>
    <RizqQuote page="procurement"/>
    <form onSubmit={submit} style={{...crd,padding:24,marginBottom:24}}>
      <h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 20px'}}>Add Stock</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:16,marginBottom:16}}><DD label="Category" field="category" options={categories} value={form.category_id} onChange={v=>setForm({...form,category_id:v})}/><DD label="Brand" field="brand" options={brands} value={form.brand_id} onChange={v=>setForm({...form,brand_id:v})}/><DD label="Supplier" field="supplier" options={suppliers} value={form.supplier_id} onChange={v=>setForm({...form,supplier_id:v})}/></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))',gap:16,marginBottom:20}}>
        <div><label style={lbl}>Unit Cost ({sym})</label><input type="number" step="0.01" min="0" value={form.unitCost} onChange={e=>setForm({...form,unitCost:e.target.value})} placeholder="0.00" style={inp}/></div>
        <div><label style={lbl}>Quantity</label><input type="number" min="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="0" style={inp}/></div>
        <div><label style={lbl}>Total ({sym})</label><div style={{...inp,background:T.bg,color:T.textSecondary,fontFamily:mono}}>{form.unitCost&&form.quantity&&parseInt(form.quantity)>0?`${sym}${fmt((parseFloat(form.unitCost)*parseInt(form.quantity)))}`:'—'}</div></div>
        <div><label style={lbl}>Date</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inp}/></div>
        <div style={{display:'flex',alignItems:'center',gap:10,paddingTop:22}}><input type="checkbox" checked={form.is_paid} onChange={e=>setForm({...form,is_paid:e.target.checked})} style={{width:18,height:18,accentColor:T.accent}}/><label style={{fontSize:14,color:T.text,cursor:'pointer'}} onClick={()=>setForm({...form,is_paid:!form.is_paid})}>Paid</label></div>
      </div>
      <button type="submit" disabled={saving} style={{...btnP,opacity:saving?0.6:1}}>{saving?'Saving...':'Record Procurement'}</button>
    </form>

    <div style={{...crd,padding:24,marginBottom:24}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 4px'}}>Bulk Import via CSV</h3><p style={{color:T.textSecondary,fontSize:12,margin:0}}>Category, Brand, Quantity, Unit Cost</p></div><label style={{...btnS,padding:'8px 16px',display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}><IconPlus/> Upload CSV<input type="file" accept=".csv,.txt" onChange={handleCsvFile} style={{display:'none'}}/></label></div>
    {csvError&&<div style={{background:'rgba(179,58,58,0.08)',border:'1px solid rgba(179,58,58,0.3)',borderRadius:8,padding:'10px 14px',marginTop:12,color:T.red,fontSize:13}}>{csvError}</div>}
    {csvRows&&<div style={{marginTop:12}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><div style={{fontSize:14,fontWeight:600}}>{csvRows.length} rows ready</div><div style={{display:'flex',gap:8}}><button onClick={()=>setCsvRows(null)} style={{background:'rgba(179,58,58,0.08)',color:T.red,border:'1px solid rgba(179,58,58,0.2)',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:12}}>Cancel</button><button onClick={importCsv} disabled={csvImporting} style={{...btnP,padding:'8px 20px',fontSize:13,opacity:csvImporting?0.6:1}}>{csvImporting?'Importing...':'Confirm'}</button></div></div><div style={{overflowX:'auto',border:`1px solid ${T.border}`,borderRadius:8}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr style={{borderBottom:`1px solid ${T.border}`,background:T.bg}}>{['#','Category','Brand','Qty','Unit Cost'].map(h=><th key={h} style={{..._th,fontSize:10,padding:'8px 12px'}}>{h}</th>)}</tr></thead><tbody>{csvRows.slice(0,30).map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${T.borderLight}`}}><td style={{padding:'6px 12px',color:T.textMuted}}>{i+1}</td><td style={{padding:'6px 12px'}}>{r.category}</td><td style={{padding:'6px 12px'}}>{r.brand}</td><td style={{padding:'6px 12px'}}>{r.quantity}</td><td style={{padding:'6px 12px',fontFamily:mono}}>{sym}{fmt(r.unitCost)}</td></tr>)}</tbody></table></div></div>}</div>

    {sorted.length>0&&<div style={{...crd,padding:0,overflow:'hidden'}}><div style={{display:'flex',gap:12,padding:'16px 20px',flexWrap:'wrap',alignItems:'center'}}><h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:0}}>History</h3><select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{...sel,width:'auto',minWidth:140,fontSize:12,padding:'6px 8px'}}><option value="">All Categories</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={filterBrand} onChange={e=>setFilterBrand(e.target.value)} style={{...sel,width:'auto',minWidth:140,fontSize:12,padding:'6px 8px'}}><option value="">All Brands</option>{brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>{(filterCat||filterBrand)&&<button onClick={()=>{setFilterCat('');setFilterBrand('');}} style={{background:'none',border:'none',color:T.accent,cursor:'pointer',fontSize:11,fontFamily:'inherit',textDecoration:'underline'}}>Clear</button>}</div>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Date','Category','Brand','Supplier','Unit Price','Qty','Remaining','Paid','By',''].map(h=><th key={h} style={_th}>{h}</th>)}</tr></thead><tbody>{filteredProcs.map(p=><tr key={p.id} style={{borderBottom:`1px solid ${T.borderLight}`}}><td style={{..._td,color:T.textSecondary}}>{new Date(p.procured_at).toLocaleDateString('en-GB')}</td><td style={_td}>{gn(categories,p.category_id)}</td><td style={_td}>{gn(brands,p.brand_id)}</td><td style={{..._td,fontSize:12,color:T.textMuted}}>{p.supplier_id?gn(suppliers,p.supplier_id):'—'}</td><td style={{..._td,fontFamily:mono}}>{sym}{fmt((parseFloat(p.unit_price_gbp)*rate))}</td><td style={_td}>{p.quantity}</td><td style={{..._td,fontWeight:600,color:p.remaining_qty===0?T.textFaint:T.green}}>{p.remaining_qty}</td><td style={_td}>{p.is_paid?<span style={{color:T.green,fontSize:11}}>Yes</span>:<span style={{color:T.red,fontSize:11}}>No</span>}</td><td style={{..._td,fontSize:11,color:T.textMuted}}>{p.logged_by_name||'—'}</td><td style={_td}><div style={{display:'flex',gap:6}}><button onClick={()=>setEditProc({...p,unit_price_gbp:''+(parseFloat(p.unit_price_gbp)*rate).toFixed(2),_origQty:p.quantity,_origRemaining:p.remaining_qty})} style={{background:'none',border:'none',color:T.accent,cursor:'pointer',opacity:0.6,padding:4}}><IconEdit/></button><button onClick={()=>delProc(p.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',opacity:0.5,padding:4}}><IconTrash/></button></div></td></tr>)}</tbody></table></div></div>}
    <Modal open={!!editProc} onClose={()=>setEditProc(null)} title="Edit Procurement">
      {editProc&&<div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:16,marginBottom:16}}><div><label style={lbl}>Category</label><select value={editProc.category_id} onChange={e=>setEditProc({...editProc,category_id:e.target.value})} style={sel}>{categories.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></div><div><label style={lbl}>Brand</label><select value={editProc.brand_id} onChange={e=>setEditProc({...editProc,brand_id:e.target.value})} style={sel}>{brands.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></div><div><label style={lbl}>Supplier</label><select value={editProc.supplier_id||''} onChange={e=>setEditProc({...editProc,supplier_id:e.target.value||null})} style={sel}><option value="">None</option>{suppliers.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></div></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))',gap:16,marginBottom:16}}><div><label style={lbl}>Unit Price ({sym})</label><input type="number" step="0.01" value={editProc.unit_price_gbp} onChange={e=>setEditProc({...editProc,unit_price_gbp:e.target.value})} style={inp}/></div><div><label style={lbl}>Quantity</label><input type="number" min="1" value={editProc.quantity} onChange={e=>setEditProc({...editProc,quantity:e.target.value})} style={inp}/></div><div><label style={lbl}>Date</label><input type="date" value={editProc.procured_at} onChange={e=>setEditProc({...editProc,procured_at:e.target.value})} style={inp}/></div><div style={{display:'flex',alignItems:'center',gap:10,paddingTop:22}}><input type="checkbox" checked={editProc.is_paid!==false} onChange={e=>setEditProc({...editProc,is_paid:e.target.checked})} style={{width:18,height:18,accentColor:T.accent}}/><label style={{fontSize:14}}>Paid</label></div></div><button onClick={saveEdit} style={btnP}>Save Changes</button></div>}
    </Modal>
  </div>);
}

/* ===== EXPENSES ===== */
function ExpensesTab({supabase,user,expenses,expenseSubcats,loadAll,rate,sym}){
  const [cat,setCat]=useState('');const [sub,setSub]=useState('');const [amount,setAmount]=useState('');const [date,setDate]=useState(new Date().toISOString().slice(0,10));const [notes,setNotes]=useState('');const [saving,setSaving]=useState(false);
  const subcats=cat?expenseSubcats.filter(sc=>sc.category===cat):[];
  async function submit(e){e.preventDefault();if(!cat||!sub||!amount)return;setSaving(true);const uName=user?.user_metadata?.full_name||user?.email||'';await supabase.from('expenses').insert({category:cat,subcategory:sub,amount_gbp:parseFloat(amount)/rate,expense_date:date,notes:notes||null,logged_by_name:uName});setCat('');setSub('');setAmount('');setNotes('');setDate(new Date().toISOString().slice(0,10));await loadAll();setSaving(false);}
  async function del(id){if(!confirm('Delete?'))return;await supabase.from('expenses').delete().eq('id',id);await loadAll();}
  return(<div>
    <h1 style={{fontFamily:dsp,fontSize:28,fontWeight:700,color:T.accent,margin:'0 0 6px'}}>Expenses</h1>
    <p style={{color:T.textSecondary,fontSize:14,margin:'0 0 20px'}}>Record operating costs and deductions</p>
    <RizqQuote page="expenses"/>
    <form onSubmit={submit} style={{...crd,padding:24,marginBottom:24}}>
      <h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 20px'}}>Add Expense</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:16,marginBottom:16}}>
        <div><label style={lbl}>Category</label><select value={cat} onChange={e=>{setCat(e.target.value);setSub('');}} style={sel}><option value="">Select</option><option value="Direct Costs">Direct Costs</option><option value="Opex">Opex</option></select></div>
        <div><label style={lbl}>Subcategory</label><select value={sub} onChange={e=>setSub(e.target.value)} style={sel} disabled={!cat}><option value="">Select</option>{subcats.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
        <div><label style={lbl}>Amount ({sym})</label><input type="number" step="0.01" min="0" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" style={inp}/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:16,marginBottom:20}}>
        <div><label style={lbl}>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp}/></div>
        <div><label style={lbl}>Notes</label><input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional..." style={inp}/></div>
      </div>
      <button type="submit" disabled={saving} style={{...btnP,opacity:saving?0.6:1}}>{saving?'Saving...':'Record Expense'}</button>
    </form>
    {expenses.length>0&&<div style={{...crd,padding:0,overflow:'hidden'}}><h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,padding:'16px 20px 0',margin:0}}>History</h3><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13,marginTop:12}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Date','Category','Subcategory','Amount','Notes','By',''].map(h=><th key={h} style={_th}>{h}</th>)}</tr></thead><tbody>{expenses.map(e=><tr key={e.id} style={{borderBottom:`1px solid ${T.borderLight}`}}><td style={{..._td,color:T.textSecondary}}>{new Date(e.expense_date).toLocaleDateString('en-GB')}</td><td style={_td}>{e.category}</td><td style={_td}>{e.subcategory}</td><td style={{..._td,fontFamily:mono}}>{sym}{fmt((parseFloat(e.amount_gbp)*rate))}</td><td style={{..._td,color:T.textMuted,fontSize:12}}>{e.notes||'—'}</td><td style={{..._td,fontSize:11,color:T.textMuted}}>{e.logged_by_name||'—'}</td><td style={_td}><button onClick={()=>del(e.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',opacity:0.5,padding:4}}><IconTrash/></button></td></tr>)}</tbody></table></div></div>}
  </div>);
}

/* ===== PRICE CALCULATOR ===== */
function PriceCalcTab({categories,brands,procurements,rate,sym}){
  const stock=getAvailableStock(procurements);const gn=(list,id)=>list.find(i=>i.id===id)?.name||'—';
  const [lines,setLines]=useState([{stockKey:'',qty:'1'}]);const [filterCat,setFilterCat]=useState('');const [filterBrand,setFilterBrand]=useState('');
  function addLine(){setLines([...lines,{stockKey:'',qty:'1'}]);}function removeLine(i){setLines(lines.filter((_,idx)=>idx!==i));}function updateLine(i,f,v){const n=[...lines];n[i]={...n[i],[f]:v};setLines(n);}
  const filteredStock=stock.filter(s=>{if(filterCat&&s.category_id!==filterCat)return false;if(filterBrand&&s.brand_id!==filterBrand)return false;return true;});
  const stockCats=[...new Set(stock.map(s=>s.category_id))];const stockBrands=[...new Set(stock.map(s=>s.brand_id))];
  const results=lines.map(l=>{if(!l.stockKey||!l.qty||parseInt(l.qty)<=0)return null;const sk=stock.find(s=>`${s.category_id}|${s.brand_id}`===l.stockKey);if(!sk)return null;const qty=parseInt(l.qty);const totalCost=sk.avgCost*qty;const minSell50=totalCost/0.5;return{qty,avgCost:sk.avgCost,totalCost,minSell50,cat:gn(categories,sk.category_id),brand:gn(brands,sk.brand_id)};}).filter(Boolean);
  const grandCost=results.reduce((s,r)=>s+r.totalCost,0);const grandMinSell=results.reduce((s,r)=>s+r.minSell50,0);

  return(<div>
    <h1 style={{fontFamily:dsp,fontSize:28,fontWeight:700,color:T.accent,margin:'0 0 6px'}}>Price Calculator</h1>
    <p style={{color:T.textSecondary,fontSize:14,margin:'0 0 20px'}}>Calculate minimum selling price for 50% margin</p>
    <RizqQuote page="calculator"/>
    {stock.length>0&&<div style={{...crd,padding:0,overflow:'hidden',marginBottom:24}}>
      <div style={{padding:'16px 20px 0'}}><h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 4px'}}>Stock Pricing Reference</h3></div>
      <div style={{display:'flex',gap:12,padding:'12px 20px',flexWrap:'wrap'}}><select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{...sel,width:'auto',minWidth:150,fontSize:13,padding:'8px 10px'}}><option value="">All Categories</option>{stockCats.map(id=><option key={id} value={id}>{gn(categories,id)}</option>)}</select><select value={filterBrand} onChange={e=>setFilterBrand(e.target.value)} style={{...sel,width:'auto',minWidth:150,fontSize:13,padding:'8px 10px'}}><option value="">All Brands</option>{stockBrands.map(id=><option key={id} value={id}>{gn(brands,id)}</option>)}</select>{(filterCat||filterBrand)&&<button onClick={()=>{setFilterCat('');setFilterBrand('');}} style={{background:'none',border:'none',color:T.accent,cursor:'pointer',fontSize:12,fontFamily:'inherit',textDecoration:'underline'}}>Clear</button>}</div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Category','Brand','Stock','AVCO/Unit','Min Sell/Unit','x10','x25'].map(h=><th key={h} style={_th}>{h}</th>)}</tr></thead><tbody>{filteredStock.map((s,i)=>{const minUnit=s.avgCost/0.5;return<tr key={i} style={{borderBottom:`1px solid ${T.borderLight}`}}><td style={_td}>{gn(categories,s.category_id)}</td><td style={_td}>{gn(brands,s.brand_id)}</td><td style={{..._td,fontWeight:600}}>{s.totalQty}</td><td style={{..._td,fontFamily:mono}}>{sym}{fmt((s.avgCost*rate))}</td><td style={{..._td,fontFamily:mono,fontWeight:700,color:T.accent}}>{sym}{fmt((minUnit*rate))}</td><td style={{..._td,fontFamily:mono,color:T.textSecondary}}>{sym}{fmt((minUnit*10*rate))}</td><td style={{..._td,fontFamily:mono,color:T.textSecondary}}>{sym}{fmt((minUnit*25*rate))}</td></tr>;})}</tbody></table></div>
    </div>}
    <div style={{...crd,padding:24,marginBottom:24}}>
      <h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 20px'}}>Bundle Calculator</h3>
      {lines.map((line,i)=><div key={i} style={{display:'flex',gap:12,marginBottom:10,alignItems:'center'}}><select value={line.stockKey} onChange={e=>updateLine(i,'stockKey',e.target.value)} style={{...sel,flex:3}}><option value="">Select item</option>{stock.map(s=>{const key=`${s.category_id}|${s.brand_id}`;return<option key={key} value={key}>{gn(categories,s.category_id)} / {gn(brands,s.brand_id)} — {s.totalQty} @ {sym}{fmt((s.avgCost*rate))}</option>;})}</select><input type="number" min="1" value={line.qty} onChange={e=>updateLine(i,'qty',e.target.value)} placeholder="Qty" style={{...inp,flex:1}}/>{lines.length>1&&<button onClick={()=>removeLine(i)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',padding:4}}><IconX/></button>}</div>)}
      <button onClick={addLine} style={{...btnS,padding:'8px 16px',display:'flex',alignItems:'center',gap:6}}><IconPlus/> Add</button>
    </div>
    {results.length>0&&<div style={{...crd,padding:20,textAlign:'center'}}><div style={{fontSize:12,color:T.textSecondary,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Min Selling Price (50% Margin)</div><div style={{fontSize:36,fontWeight:700,fontFamily:dsp,color:T.accent}}>{sym}{fmt((grandMinSell*rate))}</div><div style={{fontSize:13,color:T.textMuted,marginTop:8}}>Cost: {sym}{fmt((grandCost*rate))}</div></div>}
  </div>);
}

/* ===== FINANCE ===== */
function FinanceTab({supabase,dispatches,expenses,salesChannels,categories,brands,loadAll,rate,sym,currency}){
  const [view,setView]=useState('pnl');
  const dispatchedOrders=dispatches.filter(d=>d.order_status==='Dispatched');
  const periods=getBillingPeriods(dispatches,expenses);const [selP,setSelP]=useState(Math.max(0,periods.length-1));
  const period=periods[selP];const fDisp=period?dispatchedOrders.filter(d=>{const dt=new Date(d.dispatched_at);return dt>=period.start&&dt<=period.end;}):[];const fExp=period?(expenses||[]).filter(e=>{const dt=new Date(e.expense_date);return dt>=period.start&&dt<=period.end;}):[];
  const gmv=fDisp.reduce((s,d)=>s+(parseFloat(d.selling_price_gbp)||0),0);const totalShipping=fDisp.reduce((s,d)=>s+(parseFloat(d.shipping_cost_gbp)||0),0);const totalCommission=fDisp.reduce((s,d)=>{const rev=parseFloat(d.selling_price_gbp)||0;const sh=parseFloat(d.shipping_cost_gbp)||0;const pct=parseFloat(d.commission_pct)||0;return s+Math.max(0,rev-sh)*pct/100;},0);
  const nmv=gmv-totalShipping-totalCommission;
  const totalRefunds=fDisp.reduce((s,d)=>s+(parseFloat(d.refund_amount_gbp)||0),0);const cogs=fDisp.reduce((s,d)=>s+(d.dispatch_items||[]).reduce((ss,it)=>ss+(it.dispatched_qty||it.quantity)*parseFloat(it.unit_cost_gbp),0),0);
  const directCostExp=fExp.filter(e=>e.category==='Direct Costs');const opexExp=fExp.filter(e=>e.category==='Opex');
  const totalDirect=directCostExp.reduce((s,e)=>s+parseFloat(e.amount_gbp),0);const totalOpex=opexExp.reduce((s,e)=>s+parseFloat(e.amount_gbp),0);
  const directBySub={};directCostExp.forEach(e=>{directBySub[e.subcategory]=(directBySub[e.subcategory]||0)+parseFloat(e.amount_gbp);});
  const opexBySub={};opexExp.forEach(e=>{opexBySub[e.subcategory]=(opexBySub[e.subcategory]||0)+parseFloat(e.amount_gbp);});
  const grossProfit=nmv-totalRefunds-totalDirect-cogs;const netProfit=grossProfit-totalOpex;

  function Row({label,val,bold,indent,highlight,separator}){if(separator)return<tr><td colSpan={2} style={{padding:'6px 16px',borderBottom:`2px solid ${T.border}`}}></td></tr>;const v=val*rate;const neg=v<0;return<tr style={{borderBottom:`1px solid ${bold?T.border:T.borderLight}`}}><td style={{..._td,fontWeight:bold?700:400,paddingLeft:indent?32:16,color:highlight||T.text}}>{label}</td><td style={{..._td,fontFamily:mono,fontWeight:bold?700:400,textAlign:'right',color:highlight||(neg?T.red:T.text)}}>{neg?`(${sym}${fmt(Math.abs(v))})`:`${sym}${fmt(v)}`}</td></tr>;}

  const [pdfParsing,setPdfParsing]=useState(false);const [pdfResult,setPdfResult]=useState(null);const [pdfError,setPdfError]=useState('');const [pdfApplying,setPdfApplying]=useState(false);
  const [viewOrder,setViewOrder]=useState(null);
  const gn=(list,id)=>list.find(i=>i.id===id)?.name||'—';

  async function loadPdfJs(){if(window.pdfjsLib)return window.pdfjsLib;return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';resolve(window.pdfjsLib);};s.onerror=()=>reject(new Error('Failed to load PDF.js'));document.head.appendChild(s);});}

  async function handlePdfUpload(e){
    const file=e.target.files?.[0];if(!file)return;setPdfError('');setPdfResult(null);setPdfParsing(true);e.target.value='';
    try{
      const pdfjsLib=await loadPdfJs();const buf=await file.arrayBuffer();const pdf=await pdfjsLib.getDocument({data:buf}).promise;
      let allText='';for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const tc=await page.getTextContent();allText+=tc.items.map(it=>it.str).join(' ')+'\n';}
      const payoutDateMatch=allText.match(/Payout date\s*([\d]+\s+\w+\s+\d{4})/i);const payoutTotalMatch=allText.match(/Payout balance\s*([\d,.]+)\s*GBP/i);
      const payoutDate=payoutDateMatch?payoutDateMatch[1]:'Unknown';const payoutTotal=payoutTotalMatch?parseFloat(payoutTotalMatch[1].replace(',','')):0;

      // Find all order blocks in the DETAIL section (not summary)
      const detailStart=allText.indexOf('Order Level Details');
      const detailText=detailStart>=0?allText.substring(detailStart):allText;
      const orderPattern=/(\d{5,6}\/\d{2})/g;const allOrderNums=[...new Set([...detailText.matchAll(orderPattern)].map(m=>m[1]))];

      // Parse each order by finding its specific block in the detail section
      const orders=[];
      for(const ordNum of allOrderNums){
        if(orders.find(o=>o.orderNumber===ordNum))continue;
        const escOrd=ordNum.replace('/','\\\/');
        // Find the section for THIS order - from order number to Balance in DETAIL text
        const blockRegex=new RegExp(escOrd+'[\\s\\S]*?Balance\\s+([\\-]?[\\d,.]+)');
        const blockMatch=detailText.match(blockRegex);
        if(!blockMatch)continue;
        const block=blockMatch[0]; // This is the scoped block for this order

        const bpMatch=block.match(/Total Base Price\s+([\d,.]+)/);
        const vbpMatch=block.match(/Vendor Base Price\s+([\d,.]+)/);
        const shipMatch=block.match(/Shipping\s*\(?[^)]*\)?\s+[\-]?([\d,.]+)/);
        const commMatch=block.match(/Commission\s*\((\d+(?:\.\d+)?)%\)\s+[\-]?([\d,.]+)/);
        const refMatch=block.match(/Refund\s+[\-]?([\d,.]+)/);
        const balMatch=block.match(/Balance\s+([\-]?[\d,.]+)/);

        if(!balMatch||(! bpMatch&&!vbpMatch))continue;
        const basePrice=vbpMatch?parseFloat(vbpMatch[1].replace(',','')):parseFloat(bpMatch[1].replace(',',''));
        const shippingAmt=shipMatch?parseFloat(shipMatch[1].replace(',','')):0;
        const commPct2=commMatch?parseFloat(commMatch[1]):0;
        const commAmt2=commMatch?parseFloat(commMatch[2].replace(',','')):0;
        const refundAmt=refMatch?parseFloat(refMatch[1].replace(',','')):0;
        const balance=parseFloat(balMatch[1].replace(',',''));

        orders.push({orderNumber:ordNum,basePrice,shippingAmt,commPct:commPct2,commAmt:commAmt2,refundAmt,balance,isRefund:balance<0});
      }

      const matched=[];const unmatched=[];
      for(const ord of orders){const disp=dispatches.find(d=>d.order_id===ord.orderNumber);if(disp){const storedGMV=parseFloat(disp.selling_price_gbp||0);const gmvMismatch=Math.abs(storedGMV-ord.basePrice)>0.5;matched.push({...ord,dispatchId:disp.id,currentStatus:disp.payment_status||'Pending',currentShipping:parseFloat(disp.shipping_cost_gbp||0)||0,storedGMV,gmvMismatch});}else unmatched.push(ord);}
      const mismatches=matched.filter(m=>m.gmvMismatch);
      setPdfResult({filename:file.name,payoutDate,payoutTotal,orders,matched,unmatched,mismatches});
    }catch(err){setPdfError(err.message||'Failed to parse PDF');}
    setPdfParsing(false);
  }

  async function applyPdfResults(){
    if(!pdfResult)return;setPdfApplying(true);
    for(const m of pdfResult.matched){const updates={payment_status:m.isRefund?'Partial':'Paid',payout_amount_gbp:Math.max(0,m.balance)};if(m.refundAmt>0)updates.refund_amount_gbp=m.refundAmt;if(m.shippingAmt>0&&(!m.currentShipping||m.currentShipping<=0))updates.shipping_cost_gbp=m.shippingAmt;await supabase.from('dispatches').update(updates).eq('id',m.dispatchId);}
    await loadAll();setPdfApplying(false);setPdfResult({...pdfResult,applied:true});
  }

  const tabBtn=(id)=>({background:view===id?T.accent:'transparent',color:view===id?'#fff':T.textSecondary,border:`1px solid ${view===id?T.accent:T.border}`,borderRadius:6,padding:'8px 16px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:13});

  if(periods.length===0)return<div><h1 style={{fontFamily:dsp,fontSize:28,fontWeight:700,color:T.accent,margin:'0 0 6px'}}>Finance</h1><p style={{color:T.textSecondary,fontSize:14,margin:'0 0 20px'}}>P&L · Billing cycle: 8th–7th</p><RizqQuote page="finance"/><div style={{...crd,padding:40,textAlign:'center',color:T.textMuted}}>No data yet.</div></div>;
  return(<div>
    <h1 style={{fontFamily:dsp,fontSize:28,fontWeight:700,color:T.accent,margin:'0 0 6px'}}>Finance</h1>
    <p style={{color:T.textSecondary,fontSize:14,margin:'0 0 20px'}}>P&L · Billing cycle: 8th–7th</p>
    <RizqQuote page="finance"/>
    <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}><button onClick={()=>setView('pnl')} style={tabBtn('pnl')}>P&L Summary</button><button onClick={()=>setView('orders')} style={tabBtn('orders')}>Order P&L</button><button onClick={()=>setView('payments')} style={tabBtn('payments')}>Payments</button></div>
    <div style={{marginBottom:24}}><select value={selP} onChange={e=>setSelP(parseInt(e.target.value))} style={sel}>{periods.map((p,i)=><option key={i} value={i}>{p.label}</option>)}</select></div>

    {view==='pnl'&&<div style={{...crd,padding:0,overflow:'hidden'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}><thead><tr style={{borderBottom:`2px solid ${T.border}`}}><th style={{..._th,fontSize:13}}>Item</th><th style={{..._th,fontSize:13,textAlign:'right'}}>{currency}</th></tr></thead><tbody>
      <Row label="GMV" val={gmv} bold/><Row label="Shipping" val={-totalShipping} indent/><Row label="Commission" val={-totalCommission} indent/>
      <Row label="NMV" val={nmv} bold highlight={T.accent}/><Row separator/>
      <Row label="Refunds" val={-totalRefunds} indent/>
      {Object.entries(directBySub).map(([k,v])=><Row key={k} label={k} val={-v} indent/>)}
      <Row label="COGS" val={-cogs} indent/>
      <Row label="Gross Profit" val={grossProfit} bold highlight={grossProfit>=0?T.green:T.red}/><Row separator/>
      {Object.entries(opexBySub).map(([k,v])=><Row key={k} label={k} val={-v} indent/>)}
      {totalOpex>0&&<Row label="Total Opex" val={-totalOpex} bold/>}{totalOpex>0&&<Row separator/>}
      <Row label="Net Profit" val={netProfit} bold highlight={netProfit>=0?T.green:T.red}/>
    </tbody></table></div>}

    {view==='orders'&&<div style={{...crd,padding:0,overflow:'hidden'}}><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr style={{borderBottom:`2px solid ${T.border}`}}>{['Date','Order ID','Channel','Items','GMV','Ship','Comm','Refund','COGS','Net P&L','Status'].map(h=><th key={h} style={{..._th,fontSize:10}}>{h}</th>)}</tr></thead><tbody>{fDisp.length>0?fDisp.map(d=>{
      const rev=parseFloat(d.selling_price_gbp)||0;const ship=parseFloat(d.shipping_cost_gbp)||0;const comm=parseFloat(d.commission_pct)||0;const commA=Math.max(0,rev-ship)*comm/100;const refund=parseFloat(d.refund_amount_gbp||0);const orderCogs=(d.dispatch_items||[]).reduce((s2,it)=>s2+(it.dispatched_qty||it.quantity)*parseFloat(it.unit_cost_gbp),0);const net=rev-ship-commA-refund-orderCogs;const ps=d.payment_status||'Pending';const psCol=ps==='Paid'?T.green:ps==='Partial'?'#B8862D':T.textMuted;
      const itemDesc=(d.dispatch_items||[]).map(it=>`${gn(categories,it.category_id)}/${gn(brands,it.brand_id)} x${it.dispatched_qty||it.quantity}`).join(', ');
      return<tr key={d.id} style={{borderBottom:`1px solid ${T.borderLight}`}}>
        <td style={{..._td,color:T.textSecondary,fontSize:11}}>{new Date(d.dispatched_at).toLocaleDateString('en-GB')}</td>
        <td style={_td}><button type="button" onClick={()=>setViewOrder(d)} style={{background:'none',border:'none',color:T.accent,cursor:'pointer',fontFamily:mono,fontSize:11,padding:0,textDecoration:'underline',fontWeight:600}}>{d.order_id}</button></td>
        <td style={{..._td,fontSize:11}}>{d.sales_channel_id?gn(salesChannels,d.sales_channel_id):'—'}</td>
        <td style={{..._td,fontSize:10,color:T.textSecondary,maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{itemDesc||'—'}</td>
        <td style={{..._td,fontFamily:mono}}>{sym}{fmt((rev*rate))}</td>
        <td style={{..._td,fontFamily:mono,color:T.textSecondary}}>{ship>0?`(${sym}${fmt((ship*rate))})`:'—'}</td>
        <td style={{..._td,fontFamily:mono,color:T.textSecondary}}>({sym}{fmt((commA*rate))})</td>
        <td style={{..._td,fontFamily:mono,color:refund>0?T.red:T.textMuted}}>{refund>0?`(${sym}${fmt((refund*rate))})`:'—'}</td>
        <td style={{..._td,fontFamily:mono,color:T.textSecondary}}>({sym}{fmt((orderCogs*rate))})</td>
        <td style={{..._td,fontFamily:mono,fontWeight:600,color:net>=0?T.green:T.red}}>{sym}{fmt((net*rate))}</td>
        <td style={{..._td,fontSize:11,fontWeight:600,color:psCol}}>{ps}</td>
      </tr>;}):
      <tr><td colSpan={11} style={{..._td,textAlign:'center',color:T.textMuted,padding:30}}>No dispatched orders in this period</td></tr>}
    </tbody></table></div></div>}

    <Modal open={!!viewOrder} onClose={()=>setViewOrder(null)} title={viewOrder?`Order ${viewOrder.order_id}`:''}>
      {viewOrder&&(()=>{const rev=parseFloat(viewOrder.selling_price_gbp)||0;const ship=parseFloat(viewOrder.shipping_cost_gbp)||0;const comm=parseFloat(viewOrder.commission_pct)||0;const cBase=Math.max(0,rev-ship);const cAmt=cBase*comm/100;const its=viewOrder.dispatch_items||[];const oCogs=its.reduce((s2,it)=>s2+(it.dispatched_qty||it.quantity)*parseFloat(it.unit_cost_gbp),0);const ref=parseFloat(viewOrder.refund_amount_gbp||0);const net=rev-ship-cAmt-oCogs-ref;return<div>
        <div style={{background:T.bg,borderRadius:10,padding:16,fontSize:14}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span>GMV</span><span style={{fontFamily:mono,fontWeight:600}}>{sym}{fmt((rev*rate))}</span></div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,color:T.textSecondary}}><span>Shipping</span><span style={{fontFamily:mono}}>({sym}{fmt((ship*rate))})</span></div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,color:T.textSecondary}}><span>Commission ({comm}%)</span><span style={{fontFamily:mono}}>({sym}{fmt((cAmt*rate))})</span></div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,color:T.textSecondary}}><span>COGS</span><span style={{fontFamily:mono}}>({sym}{fmt((oCogs*rate))})</span></div>
          {ref>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:6,color:T.red}}><span>Refund</span><span style={{fontFamily:mono}}>({sym}{fmt((ref*rate))})</span></div>}
          <div style={{borderTop:`2px solid ${T.border}`,paddingTop:8,marginTop:8,display:'flex',justifyContent:'space-between',fontWeight:700}}><span>Net P&L</span><span style={{fontFamily:mono,color:net>=0?T.green:T.red}}>{sym}{fmt((net*rate))}</span></div>
        </div>
      </div>;})()}
    </Modal>

    {view==='payments'&&<div>
      <div style={{...crd,padding:24,marginBottom:24}}>
        <h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 4px'}}>Upload Fleek Payout PDF</h3>
        <p style={{color:T.textSecondary,fontSize:13,margin:'0 0 16px'}}>Parses the Order Level Details, matches orders, updates payment statuses and refunds.</p>
        <label style={{...btnP,display:'inline-flex',alignItems:'center',gap:8,cursor:'pointer',opacity:pdfParsing?0.6:1}}>{pdfParsing?'Parsing...':'Upload PDF'}<input type="file" accept=".pdf" onChange={handlePdfUpload} disabled={pdfParsing} style={{display:'none'}}/></label>
        {pdfError&&<div style={{background:'rgba(179,58,58,0.08)',border:'1px solid rgba(179,58,58,0.3)',borderRadius:8,padding:'10px 14px',marginTop:16,color:T.red,fontSize:13}}>{pdfError}</div>}
      </div>
      {pdfResult&&<div>
        <div style={{...crd,padding:20,marginBottom:16}}><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))',gap:16}}>
          <div><div style={{fontSize:11,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>File</div><div style={{fontWeight:600,fontSize:13}}>{pdfResult.filename}</div></div>
          <div><div style={{fontSize:11,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>Payout Date</div><div style={{fontWeight:600}}>{pdfResult.payoutDate}</div></div>
          <div><div style={{fontSize:11,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>Payout Total</div><div style={{fontWeight:700,fontFamily:mono,color:T.accent}}>{sym}{fmt((pdfResult.payoutTotal*rate))}</div></div>
          <div><div style={{fontSize:11,color:T.textMuted,textTransform:'uppercase',marginBottom:4}}>Orders</div><div style={{fontWeight:600}}>{pdfResult.orders.length}</div></div>
        </div></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:16,marginBottom:16}}>
          <div style={{...crd,borderColor:'rgba(61,122,74,0.3)',background:'rgba(61,122,74,0.04)'}}><div style={{fontSize:28,fontWeight:700,fontFamily:dsp,color:T.green}}>{pdfResult.matched.length}</div><div style={{fontSize:13,color:T.textSecondary}}>Matched</div></div>
          {pdfResult.unmatched.length>0&&<div style={{...crd,borderColor:T.amberBorder,background:T.amberBg}}><div style={{fontSize:28,fontWeight:700,fontFamily:dsp,color:T.amber}}>{pdfResult.unmatched.length}</div><div style={{fontSize:13,color:T.textSecondary}}>Unmatched</div></div>}
          {pdfResult.mismatches&&pdfResult.mismatches.length>0&&<div style={{...crd,borderColor:'rgba(179,58,58,0.3)',background:'rgba(179,58,58,0.04)'}}><div style={{fontSize:28,fontWeight:700,fontFamily:dsp,color:T.red}}>{pdfResult.mismatches.length}</div><div style={{fontSize:13,color:T.textSecondary}}>GMV Mismatches</div></div>}
        </div>
        {pdfResult.unmatched.length>0&&<div style={{background:T.amberBg,border:`1px solid ${T.amberBorder}`,borderRadius:10,padding:'14px 18px',marginBottom:16,fontSize:13}}><div style={{fontWeight:700,color:T.amber,marginBottom:6}}>Unmatched (not blocking import)</div><div style={{color:T.textSecondary}}>Order IDs not in your system: <strong>{pdfResult.unmatched.map(u=>u.orderNumber).join(', ')}</strong></div></div>}
        {pdfResult.mismatches&&pdfResult.mismatches.length>0&&<div style={{background:'rgba(179,58,58,0.04)',border:'1px solid rgba(179,58,58,0.3)',borderRadius:10,padding:'14px 18px',marginBottom:16,fontSize:13}}><div style={{fontWeight:700,color:T.red,marginBottom:8}}>GMV Mismatches Found</div><div style={{color:T.textSecondary,marginBottom:8}}>These orders have a different GMV in your system vs the Fleek payout PDF:</div>{pdfResult.mismatches.map((m,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:6,marginBottom:6}}><span style={{fontFamily:mono,fontWeight:600,fontSize:12}}>{m.orderNumber}</span><span style={{fontSize:12,color:T.textSecondary}}>Your GMV: <strong style={{color:T.red}}>{sym}{fmt((m.storedGMV*rate))}</strong> — Fleek says: <strong style={{color:T.green}}>{sym}{fmt((m.basePrice*rate))}</strong> — diff: {sym}{fmt((Math.abs(m.storedGMV-m.basePrice)*rate))}</span></div>)}</div>}
        {pdfResult.matched.length>0&&<div style={{...crd,padding:0,overflow:'hidden',marginBottom:16}}><h4 style={{padding:'14px 20px 0',margin:0,fontFamily:dsp,fontSize:14,color:T.accent}}>Matched Orders</h4><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12,marginTop:8}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{['Order','Fleek Price','Your GMV','Ship','Comm','Refund','Balance','Current','New'].map(h=><th key={h} style={{..._th,fontSize:10}}>{h}</th>)}</tr></thead><tbody>{pdfResult.matched.map((m,i)=><tr key={i} style={{borderBottom:`1px solid ${T.borderLight}`,background:m.gmvMismatch?'rgba(179,58,58,0.04)':'transparent'}}><td style={{..._td,fontFamily:mono,fontSize:11}}>{m.orderNumber}{m.gmvMismatch&&<span style={{color:T.red,fontSize:9,marginLeft:4}}>!</span>}</td><td style={{..._td,fontFamily:mono}}>{sym}{fmt((m.basePrice*rate))}</td><td style={{..._td,fontFamily:mono,color:m.gmvMismatch?T.red:T.textMuted}}>{sym}{fmt((m.storedGMV*rate))}</td><td style={{..._td,fontFamily:mono,color:m.shippingAmt>0?T.amber:T.textMuted}}>{m.shippingAmt>0?`${sym}${fmt((m.shippingAmt*rate))}`:'—'}</td><td style={{..._td,fontFamily:mono,color:T.textSecondary}}>({m.commPct}%) {sym}{fmt((m.commAmt*rate))}</td><td style={{..._td,fontFamily:mono,color:m.refundAmt>0?T.red:T.textMuted}}>{m.refundAmt>0?`${sym}${fmt((m.refundAmt*rate))}`:'—'}</td><td style={{..._td,fontFamily:mono,fontWeight:600,color:m.balance>=0?T.green:T.red}}>{sym}{fmt((m.balance*rate))}</td><td style={{..._td,fontSize:11,color:T.textMuted}}>{m.currentStatus}</td><td style={{..._td,fontSize:11,fontWeight:600,color:m.isRefund?T.amber:T.green}}>{m.isRefund?'Partial':'Paid'}</td></tr>)}</tbody></table></div></div>}
        {!pdfResult.applied&&pdfResult.matched.length>0&&<button onClick={applyPdfResults} disabled={pdfApplying} style={{...btnP,opacity:pdfApplying?0.6:1}}>{pdfApplying?'Applying...':'Apply Payment Updates'}</button>}
        {pdfResult.applied&&<div style={{background:'rgba(61,122,74,0.08)',border:'1px solid rgba(61,122,74,0.3)',borderRadius:10,padding:'14px 18px',color:T.green,fontSize:14,fontWeight:600}}>Payment statuses updated for {pdfResult.matched.length} orders</div>}
      </div>}
    </div>}
  </div>);
}

/* ===== SETTINGS ===== */
function SettingsTab({supabase,user,categories,brands,suppliers,salesChannels,expenseSubcats,qualities,settings,loadAll,currency,exchangeRates}){
  const isAdmin=user?.email?.toLowerCase()===ADMIN_EMAIL;
  const [emails,setEmails]=useState([]);const [newEmail,setNewEmail]=useState('');const [signupReqs,setSignupReqs]=useState([]);
  const [commPct,setCommPct]=useState(settings.default_commission_pct||'0');const [commSaving,setCommSaving]=useState(false);
  useEffect(()=>{(async()=>{const{data}=await supabase.from('allowed_emails').select('*').order('created_at');if(data)setEmails(data);const{data:reqs}=await supabase.from('signup_requests').select('*').order('created_at',{ascending:false});if(reqs)setSignupReqs(reqs);})();},[]);
  useEffect(()=>{setCommPct(settings.default_commission_pct||'0');},[settings]);
  async function addEmail(){if(!newEmail.trim())return;await supabase.from('allowed_emails').insert({email:newEmail.trim().toLowerCase()});const{data}=await supabase.from('allowed_emails').select('*').order('created_at');if(data)setEmails(data);setNewEmail('');}
  async function approveReq(req){await supabase.from('allowed_emails').insert({email:req.email.toLowerCase()});await supabase.from('signup_requests').delete().eq('id',req.id);const{data:e2}=await supabase.from('allowed_emails').select('*').order('created_at');if(e2)setEmails(e2);setSignupReqs(prev=>prev.filter(r=>r.id!==req.id));}
  async function rejectReq(id){await supabase.from('signup_requests').delete().eq('id',id);setSignupReqs(prev=>prev.filter(r=>r.id!==id));}
  async function saveComm(){setCommSaving(true);await supabase.from('app_settings').upsert({key:'default_commission_pct',value:commPct,updated_at:new Date().toISOString()});await loadAll();setCommSaving(false);}

  function ML({title,items,table}){const [val,setVal]=useState('');async function add(){if(!val.trim())return;await supabase.from(table).insert({name:val.trim()});await loadAll();setVal('');}async function remove(id){await supabase.from(table).delete().eq('id',id);await loadAll();}return(<div style={crd}><h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 16px'}}>{title}</h3><div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>{items.map(item=><span key={item.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,padding:'6px 12px',fontSize:13,display:'flex',alignItems:'center',gap:8}}>{item.name}<button onClick={()=>remove(item.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',padding:0,lineHeight:1}}><IconX/></button></span>)}{items.length===0&&<span style={{color:T.textMuted,fontSize:13,fontStyle:'italic'}}>None</span>}</div><div style={{display:'flex',gap:8}}><input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Add new..." style={{...inp,flex:1}}/><button onClick={add} style={{background:T.accent,color:'#fff',border:'none',borderRadius:8,padding:'10px 16px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:13}}>Add</button></div></div>);}

  function ExpSubML({cat}){const items=expenseSubcats.filter(sc=>sc.category===cat);const [val,setVal]=useState('');
    async function add(){if(!val.trim())return;await supabase.from('expense_subcategories').insert({name:val.trim(),category:cat});await loadAll();setVal('');}
    async function remove(id){await supabase.from('expense_subcategories').delete().eq('id',id);await loadAll();}
    return(<div style={crd}><h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 4px'}}>{cat} Subcategories</h3><p style={{color:T.textSecondary,fontSize:12,margin:'0 0 16px'}}>Used in Expenses and P&L</p><div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>{items.map(item=><span key={item.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,padding:'6px 12px',fontSize:13,display:'flex',alignItems:'center',gap:8}}>{item.name}<button onClick={()=>remove(item.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',padding:0,lineHeight:1}}><IconX/></button></span>)}</div><div style={{display:'flex',gap:8}}><input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Add subcategory..." style={{...inp,flex:1}}/><button onClick={add} style={{background:T.accent,color:'#fff',border:'none',borderRadius:8,padding:'10px 16px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:13}}>Add</button></div></div>);}

  return(<div>
    <h1 style={{fontFamily:dsp,fontSize:28,fontWeight:700,color:T.accent,margin:'0 0 6px'}}>Settings</h1>
    <p style={{color:T.textSecondary,fontSize:14,margin:'0 0 20px'}}>Manage options, lookups, and access</p>
    <RizqQuote page="settings"/>
    {isAdmin&&signupReqs.length>0&&<div style={{...crd,marginBottom:20,borderColor:T.amberBorder,background:T.amberBg}}><h3 style={{fontFamily:dsp,fontSize:16,color:T.amber,margin:'0 0 8px'}}>Pending Access ({signupReqs.length})</h3>{signupReqs.map(req=><div key={req.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:8,marginBottom:8}}><div><div style={{fontWeight:600}}>{req.full_name||'No name'}</div><div style={{fontSize:13,color:T.textSecondary,fontFamily:mono}}>{req.email}</div></div><div style={{display:'flex',gap:8}}><button onClick={()=>approveReq(req)} style={{background:T.accent,color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:12}}>Approve</button><button onClick={()=>rejectReq(req.id)} style={{background:'rgba(179,58,58,0.08)',color:T.red,border:'1px solid rgba(179,58,58,0.2)',borderRadius:6,padding:'8px 16px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:12}}>Reject</button></div></div>)}</div>}
    <div style={{...crd,marginBottom:20}}><h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 8px'}}>Default Commission %</h3><div style={{display:'flex',gap:12,alignItems:'center'}}><input type="number" step="0.01" min="0" max="100" value={commPct} onChange={e=>setCommPct(e.target.value)} style={{...inp,width:120}}/><span style={{color:T.textMuted}}>%</span><button onClick={saveComm} disabled={commSaving} style={{background:T.accent,color:'#fff',border:'none',borderRadius:8,padding:'10px 20px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:13}}>{commSaving?'Saving...':'Save'}</button></div></div>
    <div style={{display:'grid',gap:20,marginBottom:24}}><ML title="Categories" items={categories} table="categories"/><ML title="Brands" items={brands} table="brands"/><ML title="Suppliers" items={suppliers} table="suppliers"/><ML title="Sales Channels" items={salesChannels} table="sales_channels"/></div>
    <div style={{display:'grid',gap:20,marginBottom:24}}><ExpSubML cat="Direct Costs"/><ExpSubML cat="Opex"/></div>
    <div style={{...crd,marginBottom:24}}><h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 8px'}}>Currency</h3><div style={{display:'flex',gap:8}}>{['GBP','USD','PKR'].map(c=><div key={c} style={{background:currency===c?T.accentBg:T.bg,border:`1px solid ${currency===c?T.accent:T.border}`,color:currency===c?T.accent:T.textSecondary,borderRadius:8,padding:'10px 20px',fontSize:14,fontWeight:600}}>{CURRENCY_SYMBOLS[c]} {c}</div>)}</div></div>
    {isAdmin&&<div style={crd}><h3 style={{fontFamily:dsp,fontSize:16,color:T.accent,margin:'0 0 8px'}}>Email Whitelist</h3><div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>{emails.map(e=><span key={e.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,padding:'6px 12px',fontSize:13,fontFamily:mono}}>{e.email}</span>)}</div><div style={{display:'flex',gap:8}}><input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addEmail()} placeholder="email@example.com" style={{...inp,flex:1,fontFamily:mono}}/><button onClick={addEmail} style={{background:T.accent,color:'#fff',border:'none',borderRadius:8,padding:'10px 16px',cursor:'pointer',fontWeight:600,fontFamily:'inherit',fontSize:13}}>Whitelist</button></div></div>}
  </div>);
}
