import { useEffect, useState } from 'react';
import AccountMenu from './components/AccountMenu.jsx';
import AuthForm from './components/AuthForm.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';
import ChangePasswordModal from './components/ChangePasswordModal.jsx';
import Loader from './components/Loader.jsx';
import LogoutModal from './components/LogoutModal.jsx';
import ViewSwitcher from './components/ViewSwitcher.jsx';
import Home from './pages/Home.jsx';
import History from './pages/History.jsx';
import { fetchCurrentUser, logoutUser, onUnauthorized } from './services/api.js';

const App = () => {
  const [view, setView] = useState('home');
  const [replaySearch, setReplaySearch] = useState(null);
  const [user, setUser] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await fetchCurrentUser();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setIsSessionLoading(false);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    return onUnauthorized(() => {
      setUser(null);
      setReplaySearch(null);
      setView('home');
    });
  }, []);

  const handleSearchAgain = (text) => {
    setReplaySearch({ text, key: Date.now() });
    setView('home');
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logoutUser();
    setUser(null);
    setReplaySearch(null);
    setView('home');
  };

  if (isSessionLoading) {
    return (
      <div className="app-shell">
        <Loader message="Loading session..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell">
        <header className="site-header">
          <button className="brand-button" type="button">
            <span className="brand-name">FrenchEase</span>
          </button>
        </header>
        <main>
          <AuthForm onAuthenticated={setUser} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand-button" type="button" onClick={() => setView('home')}>
          <span className="brand-name">FrenchEase</span>
        </button>
        <div className="site-header-actions">
          <AccountMenu
            username={user.username}
            onChangePassword={() => setShowChangePasswordModal(true)}
            onLogout={() => setShowLogoutModal(true)}
          />
        </div>
      </header>

      <div className="top-toolbar">
        <ViewSwitcher view={view} onChange={setView} />
      </div>

      <main>
        {view === 'home' ? <Home replaySearch={replaySearch} /> : <History onSearchAgain={handleSearchAgain} />}
      </main>

      <footer className="site-footer">
        Powered by Groq + MyMemory
      </footer>

      <ChatAssistant onSearchTerm={handleSearchAgain} />

      {showLogoutModal ? (
        <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      ) : null}

      {showChangePasswordModal ? (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      ) : null}
    </div>
  );
};

export default App;
