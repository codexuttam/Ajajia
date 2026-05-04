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
      bottom: '20px',
      right: '20px',
      background: 'var(--doc-bg)',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: '1px solid var(--doc-border)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Simulate User:</span>
      <select
        value={currentUser}
        onChange={handleUserChange}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid var(--doc-border)',
          background: 'var(--background)',
          color: 'var(--foreground)'
        }}
      >
        {USERS.map(user => (
          <option key={user.id} value={user.id}>{user.name}</option>
        ))}
      </select>
    </div>
  );
}
