import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, ShoppingBag, PlusCircle, User,
  Bell, Menu, TrendingUp, Clock, CheckCircle, XCircle,
  Send, Loader2, ExternalLink, RefreshCw, Package
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const SERVICES = ['Website Development','Automations','Graphic Design','Video Editing','AI / ML Solution','Data Analysis','Mobile App','Other'];

const STATUS = {
  new:         { label:'New',         cls:'badge-new',      icon:<Clock size={12}/> },
  'in-progress':{ label:'In Progress', cls:'badge-progress', icon:<TrendingUp size={12}/> },
  completed:   { label:'Completed',   cls:'badge-done',     icon:<CheckCircle size={12}/> },
  rejected:    { label:'Rejected',    cls:'badge-rejected', icon:<XCircle size={12}/> },
};

const PROGRESS = { new:10, 'in-progress':55, completed:100, rejected:0 };
const PROG_CLR  = { new:'var(--blue)', 'in-progress':'var(--amber)', completed:'var(--emerald)', rejected:'var(--red)' };

function StatCard({ label, value, icon: Icon, color, bg, variant }) {
  return (
    <div className={`stat-card ${variant||''}`}>
      <div className="stat-icon" style={{background:bg}}>
        <Icon size={20} color={color}/>
      </div>
      <div className="stat-val">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function OrderRow({ order, onClick }) {
  const s = STATUS[order.status] || STATUS.new;
  return (
    <tr style={{cursor:'pointer'}} onClick={()=>onClick(order)}>
      <td>
        <div style={{fontWeight:600,color:'var(--text-1)'}}>{order.projectName}</div>
        <div style={{fontSize:'0.75rem',color:'var(--text-3)',marginTop:2}}>{order.services?.slice(0,2).join(', ')}</div>
      </td>
      <td>
        <div className="progress-wrap" style={{width:100}}>
          <div className="progress-bar" style={{width:`${PROGRESS[order.status]||10}%`,background:PROG_CLR[order.status]||'var(--blue)'}}/>
        </div>
        <div style={{fontSize:'0.7rem',color:'var(--text-3)',marginTop:3}}>{PROGRESS[order.status]||10}%</div>
      </td>
      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
      <td style={{color:'var(--text-3)',fontSize:'0.78rem'}}>{order.budget||'—'}</td>
      <td style={{color:'var(--text-3)',fontSize:'0.78rem'}}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
      <td>
        <button className="btn btn-ghost btn-xs" onClick={e=>{e.stopPropagation();onClick(order);}}>
          <ExternalLink size={12}/> View
        </button>
      </td>
    </tr>
  );
}

function OrderDetail({ order, onClose }) {
  const s = STATUS[order.status] || STATUS.new;
  const prog = PROGRESS[order.status] || 10;
  const steps = [
    { label:'Order Placed', done:true },
    { label:'Under Review', done:order.status!=='new' },
    { label:'In Progress',  done:order.status==='in-progress'||order.status==='completed' },
    { label:'Completed',    done:order.status==='completed' },
  ];
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={onClose}>
      <div style={{background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:20,padding:'1.75rem',width:'100%',maxWidth:560,maxHeight:'90vh',overflowY:'auto',animation:'slideUp 0.3s var(--ease) both'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'1.5rem'}}>
          <div>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',fontWeight:800,color:'var(--text-1)',marginBottom:4}}>{order.projectName}</h2>
            <span className={`badge ${s.cls}`}>{s.label}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Progress */}
        <div style={{marginBottom:'1.5rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'var(--text-3)',marginBottom:8}}>
            <span>Overall Progress</span><span style={{color:PROG_CLR[order.status],fontWeight:700}}>{prog}%</span>
          </div>
          <div className="progress-wrap" style={{height:8}}>
            <div className="progress-bar" style={{width:`${prog}%`,background:PROG_CLR[order.status]}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
            {steps.map((st,i)=>(
              <div key={i} style={{textAlign:'center',flex:1}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:st.done?'var(--emerald)':'var(--bg-3)',border:`2px solid ${st.done?'var(--emerald)':'var(--border)'}`,margin:'0 auto 4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#fff'}}>
                  {st.done?'✓':''}
                </div>
                <div style={{fontSize:'0.65rem',color:st.done?'var(--text-2)':'var(--text-3)'}}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          {[
            ['Services', order.services?.join(', ')],
            ['Budget', order.budget||'Not specified'],
            ['Timeline', order.timeline||'Not specified'],
            ['Submitted', new Date(order.createdAt).toLocaleString('en-IN')],
          ].map(([l,v])=>(
            <div className="detail-row" key={l}>
              <span className="detail-label">{l}</span>
              <span className="detail-val">{v}</span>
            </div>
          ))}
          {order.description && (
            <div style={{marginTop:'1rem'}}>
              <div className="detail-label" style={{marginBottom:6}}>Description</div>
              <div className="msg-body">{order.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [page, setPage]         = useState('overview');
  const [sideOpen, setSideOpen] = useState(false);
  const [orders, setOrders]     = useState([]);
  const [allOrders, setAll]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSub]    = useState(false);
  const [selected, setSelected] = useState([]);
  const [detail, setDetail]     = useState(null);
  const [form, setForm]         = useState({ projectName:'', description:'', budget:'', timeline:'', clientPhone:'', extraNotes:'' });
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [mine, all] = await Promise.all([
        api.get('/api/orders/mine').catch(()=>({ data:{ data:[] } })),
        api.get('/api/orders/all').catch(()=>({ data:{ data:[] } })),
      ]);
      setOrders(mine.data.data || []);
      setAll(all.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const toggleService = (s) => setSelected(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);
  const setF = (k) => (e) => setForm(f=>({...f,[k]:e.target.value}));

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!selected.length) { toast.error('Select at least one service.'); return; }
    setSub(true);
    try {
      await api.post('/api/orders', { ...form, services:selected, clientName:user.name, clientEmail:user.email });
      toast.success('Order submitted! 🎉');
      setForm({ projectName:'', description:'', budget:'', timeline:'', clientPhone:'', extraNotes:'' });
      setSelected([]);
      fetchOrders();
      setPage('my-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit.');
    } finally {
      setSub(false);
    }
  };

  // Chart data
  const months = ['Jan','Feb','Mar','Apr','May','Jun'];
  const chartData = months.map((m,i) => ({
    month:m,
    orders: allOrders.filter(o => new Date(o.createdAt).getMonth() === i).length,
  }));

  const pieData = [
    { name:'New',         value: allOrders.filter(o=>o.status==='new').length || 1,         fill:'#60a5fa' },
    { name:'In Progress', value: allOrders.filter(o=>o.status==='in-progress').length || 1,  fill:'#fbbf24' },
    { name:'Completed',   value: allOrders.filter(o=>o.status==='completed').length || 1,    fill:'#34d399' },
    { name:'Rejected',    value: allOrders.filter(o=>o.status==='rejected').length || 1,     fill:'#f87171' },
  ];

  const nav = [
    { id:'overview',   icon:LayoutDashboard, label:'Overview',      section:'Main' },
    { id:'my-orders',  icon:ShoppingBag,     label:'My Orders',     count:orders.filter(o=>o.status==='in-progress').length },
    { id:'all-orders', icon:Package,         label:'All Orders',    section:'Community' },
    { id:'new-order',  icon:PlusCircle,      label:'New Order' },
    { id:'profile',    icon:User,            label:'Profile',       section:'Account' },
  ];

  return (
    <div className="dash-wrap">
      <button className="hamburger" onClick={()=>setSideOpen(o=>!o)}><Menu size={20}/></button>
      <Sidebar links={nav} active={page} setActive={setPage} isOpen={sideOpen} setOpen={setSideOpen}/>

      {detail && <OrderDetail order={detail} onClose={()=>setDetail(null)}/>}

      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <span className="topbar-title">
            {page==='overview'?`Hey, ${user?.name?.split(' ')[0]} 👋`
            :page==='my-orders'?'My Orders'
            :page==='all-orders'?'Community Orders'
            :page==='new-order'?'New Order'
            :'Profile'}
          </span>
          <div className="topbar-right">
            <button className="notif-btn">
              <Bell size={16}/>
              {orders.filter(o=>o.status==='in-progress').length > 0 && <span className="notif-dot"/>}
            </button>
            <div className="user-avatar" style={{width:32,height:32,fontSize:12,background:'var(--grad-1)'}}>
              {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="content">

          {/* ── OVERVIEW ── */}
          {page === 'overview' && (
            <>
              <div className="page-head">
                <h1 className="page-title">Dashboard Overview</h1>
                <p className="page-sub">Welcome back! Here's your project summary.</p>
              </div>

              <div className="stats-row">
                <StatCard label="My Orders"     value={orders.length}                                          icon={ShoppingBag}   color="var(--purple)"  bg="rgba(139,92,246,0.12)"  variant="purple"/>
                <StatCard label="In Progress"   value={orders.filter(o=>o.status==='in-progress').length}      icon={TrendingUp}    color="var(--amber)"   bg="rgba(245,158,11,0.12)"  variant="amber"/>
                <StatCard label="Completed"     value={orders.filter(o=>o.status==='completed').length}        icon={CheckCircle}   color="var(--emerald)" bg="rgba(16,185,129,0.12)"  variant="green"/>
                <StatCard label="Total Projects" value={allOrders.length}                                       icon={Package}       color="var(--cyan)"    bg="rgba(6,182,212,0.12)"   variant="cyan"/>
              </div>

              {/* Charts row */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'1.25rem',marginBottom:'1.25rem'}}>
                <div className="card" style={{marginBottom:0}}>
                  <div className="card-head">
                    <div>
                      <div className="card-title">Order Activity</div>
                      <div className="card-sub">Monthly order volume across all users</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={fetchOrders}><RefreshCw size={13}/></button>
                  </div>
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="month" tick={{fontSize:11,fill:'var(--text-3)'}}/>
                        <YAxis tick={{fontSize:11,fill:'var(--text-3)'}} allowDecimals={false}/>
                        <Tooltip/>
                        <Area type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} fill="url(#grad)"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card" style={{marginBottom:0}}>
                  <div className="card-head">
                    <div className="card-title">Status Mix</div>
                  </div>
                  <div style={{height:160,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <PieChart width={150} height={150}>
                      <Pie data={pieData} cx={70} cy={70} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                        {pieData.map((entry,i)=><Cell key={i} fill={entry.fill}/>)}
                      </Pie>
                    </PieChart>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
                    {pieData.map(p=>(
                      <div key={p.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'0.75rem'}}>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <div style={{width:8,height:8,borderRadius:'50%',background:p.fill}}/>
                          <span style={{color:'var(--text-2)'}}>{p.name}</span>
                        </div>
                        <span style={{fontWeight:600,color:'var(--text-1)'}}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent my orders */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">My Recent Orders</div>
                  <button className="btn btn-primary btn-sm" onClick={()=>setPage('new-order')}>
                    <PlusCircle size={14}/> New Order
                  </button>
                </div>
                {loading ? (
                  <div className="empty"><Loader2 size={24} style={{animation:'spin 0.8s linear infinite',color:'var(--purple)'}}/></div>
                ) : orders.length === 0 ? (
                  <div className="empty"><div className="empty-icon">📦</div><p>No orders yet.</p><button className="btn btn-primary btn-sm" onClick={()=>setPage('new-order')}>Place First Order</button></div>
                ) : (
                  <div className="table-scroll">
                    <table>
                      <thead><tr><th>Project</th><th>Progress</th><th>Status</th><th>Budget</th><th>Date</th><th></th></tr></thead>
                      <tbody>{orders.slice(0,5).map(o=><OrderRow key={o._id} order={o} onClick={setDetail}/>)}</tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── MY ORDERS ── */}
          {page === 'my-orders' && (
            <>
              <div className="page-head">
                <h1 className="page-title">My Orders</h1>
                <p className="page-sub">Track all your project orders and their progress.</p>
              </div>
              <div className="stats-row">
                {['new','in-progress','completed','rejected'].map(s=>(
                  <StatCard key={s} label={STATUS[s].label} value={orders.filter(o=>o.status===s).length}
                    icon={s==='completed'?CheckCircle:s==='rejected'?XCircle:s==='in-progress'?TrendingUp:Clock}
                    color={PROG_CLR[s]} bg={`${PROG_CLR[s]}20`} variant={s==='completed'?'green':s==='rejected'?'amber':'purple'}/>
                ))}
              </div>
              <div className="card">
                <div className="card-head">
                  <div><div className="card-title">All My Orders</div><div className="card-sub">{orders.length} total</div></div>
                  <button className="btn btn-ghost btn-sm" onClick={fetchOrders}><RefreshCw size={13}/> Refresh</button>
                </div>
                {loading ? (
                  <div className="empty"><Loader2 size={24} style={{animation:'spin 0.8s linear infinite',color:'var(--purple)'}}/></div>
                ) : orders.length === 0 ? (
                  <div className="empty"><div className="empty-icon">📦</div><p>No orders yet.</p></div>
                ) : (
                  <div className="table-scroll">
                    <table>
                      <thead><tr><th>Project</th><th>Progress</th><th>Status</th><th>Budget</th><th>Timeline</th><th>Date</th><th></th></tr></thead>
                      <tbody>{orders.map(o=><OrderRow key={o._id} order={o} onClick={setDetail}/>)}</tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── ALL ORDERS (Community) ── */}
          {page === 'all-orders' && (
            <>
              <div className="page-head">
                <h1 className="page-title">Community Orders</h1>
                <p className="page-sub">See what others are building with A'tech Builder.</p>
              </div>
              <div className="card">
                <div className="card-head">
                  <div><div className="card-title">All Orders</div><div className="card-sub">{allOrders.length} total projects</div></div>
                </div>
                {loading ? (
                  <div className="empty"><Loader2 size={24} style={{animation:'spin 0.8s linear infinite',color:'var(--purple)'}}/></div>
                ) : allOrders.length === 0 ? (
                  <div className="empty"><div className="empty-icon">🌍</div><p>No orders yet.</p></div>
                ) : (
                  <div className="table-scroll">
                    <table>
                      <thead><tr><th>Project</th><th>By</th><th>Services</th><th>Progress</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {allOrders.map(o=>(
                          <tr key={o._id}>
                            <td><div style={{fontWeight:600}}>{o.projectName}</div></td>
                            <td style={{color:'var(--text-2)',fontSize:'0.82rem'}}>{o.clientName}</td>
                            <td style={{color:'var(--text-3)',fontSize:'0.78rem'}}>{o.services?.slice(0,2).join(', ')}</td>
                            <td>
                              <div className="progress-wrap" style={{width:80}}>
                                <div className="progress-bar" style={{width:`${PROGRESS[o.status]||10}%`,background:PROG_CLR[o.status]}}/>
                              </div>
                            </td>
                            <td><span className={`badge ${STATUS[o.status]?.cls||'badge-new'}`}>{STATUS[o.status]?.label||o.status}</span></td>
                            <td style={{color:'var(--text-3)',fontSize:'0.78rem'}}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── NEW ORDER ── */}
          {page === 'new-order' && (
            <>
              <div className="page-head">
                <h1 className="page-title">Place New Order 🚀</h1>
                <p className="page-sub">Tell us what you need and we'll build it for you.</p>
              </div>
              <div className="card">
                <form onSubmit={submitOrder}>
                  <div className="form-grid">
                    <div className="field span-2">
                      <label className="field-label">Services Needed *</label>
                      <div className="chips" style={{marginTop:6}}>
                        {SERVICES.map(s=>(
                          <button type="button" key={s} className={`chip ${selected.includes(s)?'on':''}`} onClick={()=>toggleService(s)}>{s}</button>
                        ))}
                      </div>
                    </div>

                    <div className="field span-2">
                      <label className="field-label">Project Name *</label>
                      <div className="field-wrap">
                        <input className="field-input no-icon" type="text" placeholder="e.g. My Portfolio Website" value={form.projectName} onChange={setF('projectName')} required/>
                      </div>
                    </div>

                    <div className="field span-2">
                      <label className="field-label">Project Description *</label>
                      <div className="field-wrap">
                        <textarea className="field-input no-icon" placeholder="Describe what you need in detail — features, design preferences, tech stack, references..." value={form.description} onChange={setF('description')} required style={{minHeight:110}}/>
                      </div>
                    </div>

                    <div className="field">
                      <label className="field-label">Budget Range</label>
                      <div className="field-wrap">
                        <select className="field-input no-icon" value={form.budget} onChange={setF('budget')}>
                          <option value="">Select budget</option>
                          <option>Under ₹5,000</option>
                          <option>₹5,000 - ₹15,000</option>
                          <option>₹15,000 - ₹50,000</option>
                          <option>₹50,000+</option>
                          <option>Let's Discuss</option>
                        </select>
                      </div>
                    </div>

                    <div className="field">
                      <label className="field-label">Timeline</label>
                      <div className="field-wrap">
                        <select className="field-input no-icon" value={form.timeline} onChange={setF('timeline')}>
                          <option value="">Select timeline</option>
                          <option>ASAP</option>
                          <option>1-2 Weeks</option>
                          <option>2-4 Weeks</option>
                          <option>1-2 Months</option>
                          <option>Flexible</option>
                        </select>
                      </div>
                    </div>

                    <div className="field">
                      <label className="field-label">Phone (optional)</label>
                      <div className="field-wrap">
                        <input className="field-input no-icon" type="tel" placeholder="+91 XXXXX XXXXX" value={form.clientPhone} onChange={setF('clientPhone')}/>
                      </div>
                    </div>

                    <div className="field">
                      <label className="field-label">Extra Notes (optional)</label>
                      <div className="field-wrap">
                        <input className="field-input no-icon" type="text" placeholder="References, links, files..." value={form.extraNotes} onChange={setF('extraNotes')}/>
                      </div>
                    </div>

                    <div className="span-2" style={{marginTop:8}}>
                      <button type="submit" className="btn btn-primary" disabled={submitting} style={{maxWidth:200}}>
                        {submitting ? <Loader2 size={16} style={{animation:'spin 0.8s linear infinite'}}/> : <><Send size={15}/> Submit Order</>}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* ── PROFILE ── */}
          {page === 'profile' && (
            <>
              <div className="page-head">
                <h1 className="page-title">My Profile</h1>
                <p className="page-sub">Your account information.</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem'}}>
                <div className="card" style={{marginBottom:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:'1.5rem'}}>
                    <div style={{width:64,height:64,borderRadius:'50%',background:'var(--grad-1)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:22,fontWeight:800,color:'#fff'}}>
                      {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',fontWeight:800,color:'var(--text-1)'}}>{user?.name}</div>
                      <div style={{fontSize:'0.82rem',color:'var(--text-3)'}}>{user?.email}</div>
                    </div>
                  </div>
                  {[['Name',user?.name],['Email',user?.email],['Member Since',new Date(user?.createdAt||Date.now()).toLocaleDateString()],['Total Orders',orders.length]].map(([l,v])=>(
                    <div className="detail-row" key={l}><span className="detail-label">{l}</span><span className="detail-val">{v}</span></div>
                  ))}
                </div>
                <div className="card" style={{marginBottom:0}}>
                  <div className="card-title" style={{marginBottom:'1rem'}}>Order Summary</div>
                  {['new','in-progress','completed','rejected'].map(s=>(
                    <div className="detail-row" key={s}>
                      <span className="detail-label"><span className={`badge ${STATUS[s].cls}`}>{STATUS[s].label}</span></span>
                      <span className="detail-val" style={{fontFamily:'var(--font-display)',fontSize:'1.1rem'}}>{orders.filter(o=>o.status===s).length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
