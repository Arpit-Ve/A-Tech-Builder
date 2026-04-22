import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function AdminLogin() {
  const [showKey, setShowKey] = useState(false);
  const [key, setKey]         = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/admin-login', { apiKey: key });
      loginAdmin(data.admin, data.token);
      toast.success('Welcome, Admin! 🛡️');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap" style={{justifyContent:'center',alignItems:'center'}}>
      <div className="auth-bg">
        <div className="auth-orb" style={{width:500,height:500,background:'radial-gradient(circle,rgba(200,184,138,0.06),transparent)',top:-200,right:-200}}/>
        <div className="auth-orb" style={{width:300,height:300,background:'radial-gradient(circle,rgba(242,240,235,0.04),transparent)',bottom:-100,left:-100}}/>
      </div>

      <div className="auth-card" style={{maxWidth:400}}>
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{background:'#fff'}}>A</div>
          <span className="auth-logo-name">A'tech Builder</span>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem'}}>
          <div style={{width:48,height:48,borderRadius:14,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Shield size={24} color="var(--accent)"/>
          </div>
          <div>
            <h1 style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',fontWeight:600,color:'var(--text-1)'}}>Admin Portal</h1>
            <p style={{fontSize:'0.8rem',color:'var(--text-3)'}}>Restricted access only</p>
          </div>
        </div>

        <p className="auth-sub">Enter your admin API key to access the full dashboard with order management, analytics and messages.</p>

        <form onSubmit={submit}>
          <div className="field">
            <label className="field-label">Admin API Key</label>
            <div className="field-wrap">
              <Key className="field-icon" size={16}/>
              <input
                className="field-input has-eye"
                type={showKey?'text':'password'}
                placeholder="sb-admin-2026-••••••••"
                value={key} onChange={e=>setKey(e.target.value)} required
              />
              <button type="button" className="field-eye" onClick={()=>setShowKey(p=>!p)}>
                {showKey ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <Loader2 size={18} style={{animation:'spin 0.8s linear infinite'}}/> : <><Shield size={16}/>Access Dashboard</>}
          </button>
        </form>

        <p style={{textAlign:'center',marginTop:'1.25rem',fontSize:'0.82rem',color:'var(--text-3)'}}>
          Not admin?{' '}
          <Link to="/login" style={{color:'var(--accent)',textDecoration:'none',fontWeight:600}}>User Login →</Link>
        </p>
      </div>
    </div>
  );
}
