import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function Login() {
  const [tab, setTab]         = useState('login');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url  = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = tab === 'login' ? { email:form.email, password:form.password } : form;
      const { data } = await api.post(url, body);
      loginUser(data.user, data.token);
      toast.success(tab === 'login' ? `Welcome back, ${data.user.name}! 👋` : `Account created! Welcome, ${data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-orb" style={{ width:500, height:500, background:'radial-gradient(circle,#6366f1,transparent)', top:-200, left:-200 }}/>
        <div className="auth-orb" style={{ width:300, height:300, background:'radial-gradient(circle,#8b5cf6,transparent)', bottom:-100, right:300 }}/>
      </div>

      {/* Left — form */}
      <div className="auth-left">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">A</div>
            <span className="auth-logo-name">A'tech Builder</span>
          </div>

          <h1 className="auth-heading">
            {tab === 'login' ? 'Welcome back 👋' : 'Get started 🚀'}
          </h1>
          <p className="auth-sub">
            {tab === 'login'
              ? 'Sign in to track your orders and see what others are building.'
              : 'Create an account to order projects and track their progress.'}
          </p>

          <div className="tabs">
            <button className={`tab ${tab==='login'?'active':''}`} onClick={()=>setTab('login')}>Sign In</button>
            <button className={`tab ${tab==='register'?'active':''}`} onClick={()=>setTab('register')}>Register</button>
          </div>

          <form onSubmit={submit}>
            {tab === 'register' && (
              <div className="field">
                <label className="field-label">Full Name</label>
                <div className="field-wrap">
                  <User className="field-icon" size={16}/>
                  <input className="field-input" type="text" placeholder="Arpit Verma" value={form.name} onChange={set('name')} required/>
                </div>
              </div>
            )}
            <div className="field">
              <label className="field-label">Email Address</label>
              <div className="field-wrap">
                <Mail className="field-icon" size={16}/>
                <input className="field-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required/>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <Lock className="field-icon" size={16}/>
                <input className={`field-input has-eye`} type={showPw?'text':'password'} placeholder="••••••••" value={form.password} onChange={set('password')} required/>
                <button type="button" className="field-eye" onClick={()=>setShowPw(p=>!p)}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <Loader2 size={18} style={{animation:'spin 0.8s linear infinite'}}/> : <><ArrowRight size={16}/>{tab==='login'?'Sign In':'Create Account'}</>}
            </button>
          </form>

          <div className="divider"><span>or</span></div>

          <button className="btn btn-google btn-full" onClick={()=>toast('Google OAuth — coming soon!',{icon:'🔜'})}>
            <GoogleIcon/> Continue with Google
          </button>

          <p style={{textAlign:'center',marginTop:'1.25rem',fontSize:'0.82rem',color:'var(--text-3)'}}>
            Admin?{' '}
            <Link to="/admin" style={{color:'var(--purple-light)',textDecoration:'none',fontWeight:600}}>Admin login →</Link>
          </p>
        </div>
      </div>

      {/* Right — illustration */}
      <div className="auth-right">
        <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
          <div style={{position:'absolute',width:300,height:300,background:'radial-gradient(circle,rgba(139,92,246,0.08),transparent)',borderRadius:'50%',top:'20%',right:'10%'}}/>
        </div>
        <div className="auth-illustration">
          <div style={{textAlign:'center',marginBottom:'0.5rem'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:20,padding:'6px 16px',marginBottom:'1rem'}}>
              <Sparkles size={14} color="var(--purple-light)"/>
              <span style={{fontSize:'0.78rem',color:'var(--purple-light)',fontWeight:600}}>Live Project Tracking</span>
            </div>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',fontWeight:800,marginBottom:8,color:'var(--text-1)'}}>Track every project,<br/>every step of the way.</h2>
            <p style={{color:'var(--text-2)',fontSize:'0.88rem',lineHeight:1.6}}>See real-time status updates, communicate directly, and never lose track of your builds.</p>
          </div>

          {/* Mock order card */}
          <div className="auth-illustration-card">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
              <div>
                <div style={{fontWeight:700,fontSize:'0.9rem',color:'var(--text-1)'}}>Biblio AI Website</div>
                <div style={{fontSize:'0.75rem',color:'var(--text-3)',marginTop:2}}>Website Development · AI / ML</div>
              </div>
              <span className="badge badge-progress">In Progress</span>
            </div>
            <div style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',color:'var(--text-3)',marginBottom:6}}>
                <span>Progress</span><span style={{color:'var(--purple-light)',fontWeight:600}}>65%</span>
              </div>
              <div className="progress-wrap">
                <div className="progress-bar" style={{width:'65%',background:'var(--grad-1)'}}/>
              </div>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['React','Node.js','MongoDB','AI API'].map(t=>(
                <span key={t} style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:20,padding:'2px 10px',fontSize:'0.7rem',color:'var(--purple-light)'}}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mock stats */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,width:'100%'}}>
            {[{l:'Orders',v:'12',c:'var(--purple)'},{l:'Completed',v:'8',c:'var(--emerald)'},{l:'In Progress',v:'3',c:'var(--amber)'}].map(s=>(
              <div key={s.l} style={{background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:12,padding:'0.875rem',textAlign:'center'}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:'0.7rem',color:'var(--text-3)',marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
