'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const USERS = [
  { id: 'user1', name: 'Alice (user1)' },
  { id: 'user2', name: 'Bob (user2)' },
  { id: 'user3', name: 'Charlie (user3)' },
];

export function UserSwitcher() {
  const [currentUser, setCurrentUser] = useState('user1');

  useEffect(() => {
    const savedUser = Cookies.get('userId');
    if (savedUser) {
      setCurrentUser(savedUser);
    } else {
      Cookies.set('userId', 'user1');
    }
  }, []);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setCurrentUser(userId);
    Cookies.set('userId', userId);
    window.location.reload(); // Reload to refresh data with new user
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: '10px 16px',
      borderRadius: '9999px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
      border: '1px solid var(--doc-border)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'fadeUp 0.5s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>Simulating:</span>
      </div>
      <select
        value={currentUser}
        onChange={handleUserChange}
        style={{
          padding: '6px 12px',
          borderRadius: '9999px',
          border: 'none',
          background: 'var(--primary)',
          color: 'white',
          fontWeight: 600,
          outline: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {USERS.map(user => (
          <option key={user.id} value={user.id}>{user.name}</option>
        ))}
      </select>
    </div>
  );
}
