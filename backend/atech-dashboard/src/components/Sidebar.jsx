import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Sidebar({ links, active, setActive, isAdmin, isOpen, setOpen, badge }) {
  const { user, admin, logoutUser, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const person = isAdmin ? admin : user;

  const logout = () => {
    if (isAdmin) { logoutAdmin(); navigate('/admin'); }
    else { logoutUser(); navigate('/login'); }
    toast.success('Logged out.');
  };

  const initials = person?.name
    ? person.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
    : 'U';

  const gradBg = isAdmin
    ? 'linear-gradient(135deg,#fff,rgba(255,255,255,0.7))'
    : '#fff';

  return (
    <>
      <div className={`overlay ${isOpen?'show':''}`} onClick={()=>setOpen(false)}/>
      <aside className={`sidebar ${isOpen?'open':''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{background:gradBg}}>A</div>
          <span className="sidebar-logo-name">A'tech Builder</span>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ id, icon: Icon, label, section, count }) => (
            <React.Fragment key={id}>
              {section && <div className="sidebar-section-label">{section}</div>}
              <button
                className={`nav-item ${active===id?'active':''}`}
                onClick={() => { setActive(id); setOpen(false); }}
              >
                <Icon size={17}/>
                {label}
                {count > 0 && <span className="nav-badge">{count}</span>}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar" style={{background:gradBg}}>{initials}</div>
            <div className="user-info">
              <div className="user-name">{person?.name || 'Admin'}</div>
              <div className="user-role">{isAdmin ? '🛡️ Admin' : '👤 User'}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Logout">
              <LogOut size={15}/>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
