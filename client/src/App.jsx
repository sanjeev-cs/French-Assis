import { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';
import Loader from './components/Loader.jsx';
import LogoutModal from './components/LogoutModal.jsx';
import Home from './pages/Home.jsx';
import History from './pages/History.jsx';
import { fetchCurrentUser, logoutUser, onUnauthorized } from './services/api.js';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 8v4l3 3M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

const App = () => {
  const [view, setView] = useState('home');
  const [replaySearch, setReplaySearch] = useState(null);
  const [user, setUser] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        <nav>
          <span className="user-pill">{user.username}</span>
          <button
            className={`nav-btn ${view === 'home' ? 'active' : ''}`}
            type="button"
            onClick={() => setView('home')}
          >
            <SearchIcon />
            Search
          </button>
          <button
            className={`nav-btn ${view === 'history' ? 'active' : ''}`}
            type="button"
            onClick={() => setView('history')}
          >
            <HistoryIcon />
            History
          </button>
          <button
            className="nav-btn nav-btn--danger"
            type="button"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogoutIcon />
          </button>
        </nav>
      </header>

      <main>
        {view === 'home' ? <Home replaySearch={replaySearch} /> : <History onSearchAgain={handleSearchAgain} onBack={() => setView('home')} />}
      </main>

      <footer className="site-footer">
        Powered by Groq + MyMemory
      </footer>

      <ChatAssistant onSearchTerm={handleSearchAgain} />

      {showLogoutModal ? (
        <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      ) : null}
    </div>
  );
};

export default App;
