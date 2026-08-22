import { useState, useEffect } from 'react';
import { AuthPage } from './pages/AuthPage';
import { ProfilePreferencesPage } from './pages/ProfilePreferencesPage';

export function App() {
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  }, [user]);

  const handleLoginSuccess = (userData: any, token: string) => {
    localStorage.setItem('access_token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleUpdateUser = (updatedUserData: any) => {
    setUser(updatedUserData);
  };

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <ProfilePreferencesPage
      user={user}
      onUpdateUser={handleUpdateUser}
      onLogout={handleLogout}
    />
  );
}

export default App;
