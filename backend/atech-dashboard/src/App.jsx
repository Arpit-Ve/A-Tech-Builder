import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import './styles/global.css';

function UserRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-page"><div className="loader-ring"/><span className="loader-text">Loading...</span></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="loader-page"><div className="loader-ring"/><span className="loader-text">Loading...</span></div>;
  return admin ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background:'#12122a', color:'#f0f0ff', border:'1px solid rgba(139,92,246,0.25)', fontFamily:"'DM Sans',sans-serif" },
          success: { iconTheme:{ primary:'#10b981', secondary:'#12122a' } },
          error:   { iconTheme:{ primary:'#ef4444', secondary:'#12122a' } },
        }}/>
        <Routes>
          <Route path="/login"            element={<Login />} />
          <Route path="/admin"            element={<AdminLogin />} />
          <Route path="/dashboard/*"      element={<UserRoute><Dashboard /></UserRoute>} />
          <Route path="/admin/dashboard/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*"                 element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
