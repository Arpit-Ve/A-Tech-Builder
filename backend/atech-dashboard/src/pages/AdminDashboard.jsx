import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, ShoppingBag, MessageSquare, Settings,
  Bell, Menu, TrendingUp, CheckCircle, XCircle, Clock,
  RefreshCw, Loader2, Mail, Eye, EyeOff, Users
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

const STATUS = {
  new:          { label:'New',         cls:'badge-new' },
  'in-progress':{ label:'In Progress', cls:'badge-progress' },
  completed:    { label:'Completed',   cls:'badge-done' },
  rejected:     { label:'Rejected',    cls:'badge-rejected' },
};

function StatCard({ label, value, icon: Icon, color, bg, variant, sub }) {
  return (
    <div className={`stat-card ${variant||''}`}>
      <div className="stat-icon" style={{background:bg}}>
        <Icon size={20} color={color}/>
      </div>
      <div className="stat-val">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-change up">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [page, setPage]         = useState('overview');
  const [sideOpen, setSideOpen] = useState(false);
  const [orders, setOrders]     = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ord, msg] = await Promise.all([
        api.get('/api/orders'),
        api.get('/api/contact'),
      ]);
      setOrders(ord.data.data || []);
      setMessages(msg.data.data || []);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
      setOrders(p => p.map(o => o._id===id ? {...o,status} : o));
      toast.success(`Status → "${STATUS[status].label}"`);
    } catch { toast.error('Update failed.'); }
  };

  const toggleRead = async (id) => {
    try {
      const { data } = await api.patch(`/api/contact/${id}/read`);
      setMessages(p => p.map(m => m._id===id ? {...m,isRead:data.data.isRead} : m));
    } catch { toast.error('Update failed.'); }
  };

  const unreadCount = messages.filter(m=>!m.isRead).length;
  const newOrders   = orders.filter(o=>o.status==='new').length;

  const nav = [
    { id:'overview',  icon:LayoutDashboard, label:'Overview',    section:'Panel' },
    { id:'orders',    icon:ShoppingBag,     label:'All Orders',  count:newOrders },
    { id:'messages',  icon:MessageSquare,   label:'Messages',    count:unreadCount },
    { id:'users',     icon:Users,           label:'Users',       section:'Manage' },
    { id:'settings',  icon:Settings,        label:'Settings' },
  ];

  // Chart data
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = months.map((m,i) => ({
    month: m,
    orders:    orders.filter(o => new Date(o.createdAt).getMonth()===i).length,
    completed: orders.filter(o => o.status==='completed' && new Date(o.createdAt).getMonth()===i).length,
  }));

  const pieData = [
    { name:'New',         value:orders.filter(o=>o.status==='new').length||1,         fill:'#6899e8' },
    { name:'In Progress', value:orders.filter(o=>o.status==='in-progress').length||1, fill:'#f0b440' },
    { name:'Completed',   value:orders.filter(o=>o.status==='completed').length||1,   fill:'#4ade80' },
    { name:'Rejected',    value:orders.filter(o=>o.status==='rejected').length||1,    fill:'#f87171' },
  ];

  const serviceCount = {};
  orders.forEach(o => o.services?.forEach(s => { serviceCount[s]=(serviceCount[s]||0)+1; }));
  const serviceData = Object.entries(serviceCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,value])=>({name,value}));

  return (
    <div className="dash-wrap">
      <button className="hamburger" onClick={()=>setSideOpen(o=>!o)}><Menu size={20}/></button>
      <Sidebar links={nav} active={page} setActive={setPage} isAdmin isOpen={sideOpen} setOpen={setSideOpen}/>

      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <span className="topbar-title" style={{color:'var(--accent)'}}>🛡️ Admin Dashboard</span>
          <div className="topbar-right">
            <button className="notif-btn" onClick={fetchOrders}>
              <RefreshCw size={15}/>
            </button>
            <button className="notif-btn">
              <Bell size={16}/>
              {(unreadCount + newOrders) > 0 && <span className="notif-dot"/>}
            </button>
            <div className="user-avatar" style={{width:32,height:32,fontSize:11,background:'linear-gradient(135deg,#c8b88a,#a89868)'}}>AD</div>
          </div>
        </div>

        <div className="content">

          {/* ── OVERVIEW ── */}
          {page === 'overview' && (
            <>
              <div className="page-head">
                <h1 className="page-title">Overview</h1>
                <p className="page-sub">Full analytics and control panel for A'tech Builder.</p>
              </div>

              <div className="stats-row">
                <StatCard label="Total Orders"  value={orders.length}                                         icon={ShoppingBag}   color="var(--accent)"  bg="rgba(200,184,138,0.08)"  variant="purple"/>
                <StatCard label="New Orders"    value={newOrders}                                             icon={Clock}         color="var(--cyan)"    bg="rgba(94,196,212,0.08)"   variant="cyan"/>
                <StatCard label="In Progress"   value={orders.filter(o=>o.status==='in-progress').length}     icon={TrendingUp}    color="var(--amber)"   bg="rgba(240,180,64,0.08)"   variant="amber"/>
                <StatCard label="Completed"     value={orders.filter(o=>o.status==='completed').length}       icon={CheckCircle}   color="var(--emerald)" bg="rgba(74,222,128,0.08)"   variant="green"/>
                <StatCard label="Messages"      value={messages.length}                                       icon={MessageSquare} color="var(--pink)"    bg="rgba(232,112,160,0.08)"  variant="pink"/>
                <StatCard label="Unread"        value={unreadCount}                                           icon={Mail}          color="var(--blue)"    bg="rgba(104,153,232,0.08)"  variant="blue"/>
              </div>

              {/* Charts */}
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1.25rem',marginBottom:'1.25rem'}}>
                <div className="card" style={{marginBottom:0}}>
                  <div className="card-head">
                    <div><div className="card-title">Orders Over Time</div><div className="card-sub">Monthly breakdown</div></div>
                    <button className="btn btn-ghost btn-sm" onClick={fetchAll}><RefreshCw size={13}/></button>
                  </div>
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fff" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="month" tick={{fontSize:11,fill:'var(--text-3)'}}/>
                        <YAxis tick={{fontSize:11,fill:'var(--text-3)'}} allowDecimals={false}/>
                        <Tooltip/>
                        <Area type="monotone" dataKey="orders"    name="Total"     stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} fill="url(#g1)"/>
                        <Area type="monotone" dataKey="completed" name="Completed" stroke="#4ade80" strokeWidth={2} fill="url(#g2)"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card" style={{marginBottom:0}}>
                  <div className="card-head"><div className="card-title">Status Split</div></div>
                  <div style={{height:160,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <PieChart width={150} height={150}>
                      <Pie data={pieData} cx={70} cy={70} innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={4}>
                        {pieData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                      </Pie>
                    </PieChart>
                  </div>
                  {pieData.map(p=>(
                    <div key={p.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',fontSize:'0.75rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:p.fill}}/>
                        <span style={{color:'var(--text-2)'}}>{p.name}</span>
                      </div>
                      <span style={{fontWeight:600,color:'var(--text-1)'}}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service breakdown */}
              {serviceData.length > 0 && (
                <div className="card">
                  <div className="card-head"><div className="card-title">Top Services</div></div>
                  <div style={{height:180}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={serviceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                        <XAxis type="number" tick={{fontSize:11,fill:'var(--text-3)'}} allowDecimals={false}/>
                        <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'var(--text-3)'}} width={120}/>
                        <Tooltip/>
                        <Bar dataKey="value" name="Orders" fill="rgba(255,255,255,0.15)" radius={[0,4,4,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Recent orders table */}
              <div className="card">
                <div className="card-head">
                  <div><div className="card-title">Recent Orders</div><div className="card-sub">Latest {Math.min(5,orders.length)} orders</div></div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setPage('orders')}>View All</button>
                </div>
                {loading ? (
                  <div className="empty"><Loader2 size={24} style={{animation:'spin 0.8s linear infinite',color:'var(--accent)'}}/></div>
                ) : orders.length === 0 ? (
                  <div className="empty"><div className="empty-icon">📦</div><p>No orders yet.</p></div>
                ) : (
                  <div className="table-scroll">
                    <table>
                      <thead><tr><th>Project</th><th>Client</th><th>Services</th><th>Budget</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {orders.slice(0,5).map(o=>(
                          <tr key={o._id}>
                            <td style={{fontWeight:600}}>{o.projectName}</td>
                            <td style={{color:'var(--text-2)'}}>{o.clientName}</td>
                            <td style={{color:'var(--text-3)',fontSize:'0.78rem'}}>{o.services?.slice(0,2).join(', ')}</td>
                            <td style={{color:'var(--text-3)'}}>{o.budget||'—'}</td>
                            <td>
                              <select className="status-sel" value={o.status} onChange={e=>updateStatus(o._id,e.target.value)}>
                                {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                              </select>
                            </td>
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

          {/* ── ALL ORDERS ── */}
          {page === 'orders' && (
            <>
              <div className="page-head">
                <h1 className="page-title">All Orders</h1>
                <p className="page-sub">Manage and update statuses for all project orders.</p>
              </div>
              <div className="stats-row">
                {Object.entries(STATUS).map(([k,v])=>(
                  <StatCard key={k} label={v.label} value={orders.filter(o=>o.status===k).length}
                    icon={k==='completed'?CheckCircle:k==='rejected'?XCircle:k==='in-progress'?TrendingUp:Clock}
                    color={k==='completed'?'var(--emerald)':k==='rejected'?'var(--red)':k==='in-progress'?'var(--amber)':'var(--blue)'}
                    bg={k==='completed'?'rgba(16,185,129,0.12)':k==='rejected'?'rgba(239,68,68,0.12)':k==='in-progress'?'rgba(245,158,11,0.12)':'rgba(59,130,246,0.12)'}
                    variant={k==='completed'?'green':k==='rejected'?'amber':'purple'}
                  />
                ))}
              </div>
              <div className="card">
                <div className="card-head">
                  <div><div className="card-title">Orders ({orders.length})</div></div>
                  <button className="btn btn-ghost btn-sm" onClick={fetchAll}><RefreshCw size={13}/> Refresh</button>
                </div>
                {loading ? (
                  <div className="empty"><Loader2 size={24} style={{animation:'spin 0.8s linear infinite',color:'var(--accent)'}}/></div>
                ) : orders.length === 0 ? (
                  <div className="empty"><div className="empty-icon">📦</div><p>No orders yet.</p></div>
                ) : (
                  <div className="table-scroll">
                    <table>
                      <thead><tr><th>Project</th><th>Client</th><th>Email</th><th>Services</th><th>Budget</th><th>Timeline</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {orders.map(o=>(
                          <tr key={o._id}>
                            <td style={{fontWeight:600,maxWidth:150}}>{o.projectName}</td>
                            <td style={{color:'var(--text-2)'}}>{o.clientName}</td>
                            <td style={{color:'var(--accent)',fontSize:'0.78rem'}}>{o.clientEmail}</td>
                            <td style={{color:'var(--text-3)',fontSize:'0.78rem',maxWidth:140}}>{o.services?.join(', ')}</td>
                            <td style={{color:'var(--text-3)'}}>{o.budget||'—'}</td>
                            <td style={{color:'var(--text-3)'}}>{o.timeline||'—'}</td>
                            <td>
                              <select className="status-sel" value={o.status} onChange={e=>updateStatus(o._id,e.target.value)}>
                                {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                              </select>
                            </td>
                            <td style={{color:'var(--text-3)',fontSize:'0.75rem'}}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── MESSAGES ── */}
          {page === 'messages' && (
            <>
              <div className="page-head">
                <h1 className="page-title">Messages</h1>
                <p className="page-sub">{unreadCount} unread · {messages.length} total</p>
              </div>
              {loading ? (
                <div className="empty" style={{padding:'4rem'}}><Loader2 size={28} style={{animation:'spin 0.8s linear infinite',color:'var(--accent)'}}/></div>
              ) : messages.length === 0 ? (
                <div className="empty" style={{padding:'4rem'}}><div className="empty-icon">💬</div><p>No messages yet.</p></div>
              ) : (
                messages.map((m,i)=>(
                  <div key={m._id} className={`msg-card ${!m.isRead?'unread':''}`} style={{animationDelay:`${i*0.05}s`}}>
                    <div className="msg-head">
                      <div>
                        <div className="msg-sender">{m.name} {!m.isRead && <span className="badge badge-unread" style={{marginLeft:6}}>New</span>}</div>
                        <div className="msg-meta">{m.email} · {new Date(m.createdAt).toLocaleString('en-IN')}</div>
                      </div>
                      <div className="msg-actions">
                        <a href={`mailto:${m.email}?subject=Re: ${m.subject||'Your Message'}`} className="btn btn-primary btn-sm">
                          <Mail size={13}/> Reply
                        </a>
                        <button className="btn btn-ghost btn-sm" onClick={()=>toggleRead(m._id)}>
                          {m.isRead ? <><EyeOff size={13}/> Unread</> : <><Eye size={13}/> Read</>}
                        </button>
                      </div>
                    </div>
                    {m.subject && <div className="msg-subject">📌 {m.subject}</div>}
                    <div className="msg-body">{m.message}</div>
                  </div>
                ))
              )}
            </>
          )}

          {/* ── USERS ── */}
          {page === 'users' && (
            <>
              <div className="page-head">
                <h1 className="page-title">Users</h1>
                <p className="page-sub">All clients who have placed orders.</p>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-title">All Clients</div></div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Last Order</th></tr></thead>
                    <tbody>
                      {/* Derive unique clients from orders */}
                      {Object.values(
                        orders.reduce((acc,o) => {
                          if (!acc[o.clientEmail]) acc[o.clientEmail] = { name:o.clientName, email:o.clientEmail, phone:o.clientPhone, orders:0, last:o.createdAt };
                          acc[o.clientEmail].orders++;
                          if (new Date(o.createdAt) > new Date(acc[o.clientEmail].last)) acc[o.clientEmail].last = o.createdAt;
                          return acc;
                        }, {})
                      ).map(c=>(
                        <tr key={c.email}>
                          <td style={{fontWeight:600}}>{c.name}</td>
                          <td style={{color:'var(--accent)',fontSize:'0.82rem'}}>{c.email}</td>
                          <td style={{color:'var(--text-3)'}}>{c.phone||'—'}</td>
                          <td><span className="badge badge-new">{c.orders}</span></td>
                          <td style={{color:'var(--text-3)',fontSize:'0.78rem'}}>{new Date(c.last).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── SETTINGS ── */}
          {page === 'settings' && (
            <>
              <div className="page-head">
                <h1 className="page-title">Settings</h1>
                <p className="page-sub">Admin configuration and system info.</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem'}}>
                <div className="card" style={{marginBottom:0}}>
                  <div className="card-title" style={{marginBottom:'1rem'}}>System Info</div>
                  {[['Panel Version','v2.0.0'],['Backend','Express.js + MongoDB'],['Auth','JWT + API Key'],['Email','Nodemailer + Gmail SMTP'],['Deployment','Railway + Vercel']].map(([l,v])=>(
                    <div className="detail-row" key={l}><span className="detail-label">{l}</span><span className="detail-val">{v}</span></div>
                  ))}
                </div>
                <div className="card" style={{marginBottom:0}}>
                  <div className="card-title" style={{marginBottom:'1rem'}}>Quick Stats</div>
                  {[['Total Orders',orders.length],['Completed',orders.filter(o=>o.status==='completed').length],['Success Rate',`${orders.length?Math.round(orders.filter(o=>o.status==='completed').length/orders.length*100):0}%`],['Total Messages',messages.length],['Unread',unreadCount]].map(([l,v])=>(
                    <div className="detail-row" key={l}><span className="detail-label">{l}</span><span className="detail-val" style={{fontFamily:'var(--font-display)',fontSize:'1rem'}}>{v}</span></div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );

  function fetchOrders() { fetchAll(); }
}
