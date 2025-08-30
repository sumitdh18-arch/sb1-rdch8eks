import React from 'react';
import { AppProvider } from '../context/AppContext';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import { useApp } from '../context/AppContext';

function AdminAppContent() {
  const { state } = useApp();

  return (
    <div className="admin-app">
      {state.currentAdmin ? <AdminPanel /> : <AdminLogin />}
    </div>
  );
}

export default function AdminApp() {
  return (
    <AppProvider>
      <AdminAppContent />
    </AppProvider>
  );
}