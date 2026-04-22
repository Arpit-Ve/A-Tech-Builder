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
          style: { background:'#0a0a0a', color:'#fff', border:'1px solid rgba(255,255,255,0.06)', fontFamily:"'Inter',sans-serif", fontWeight:300 },
          success: { iconTheme:{ primary:'#4ade80', secondary:'#0a0a0a' } },
          error:   { iconTheme:{ primary:'#ef4444', secondary:'#0a0a0a' } },
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
