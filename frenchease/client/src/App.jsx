import { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';
import Loader from './components/Loader.jsx';
import Home from './pages/Home.jsx';
import History from './pages/History.jsx';
import { fetchCurrentUser, logoutUser } from './services/api.js';

const App = () => {
  const [view, setView] = useState('home');
  const [replaySearch, setReplaySearch] = useState(null);
  const [user, setUser] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

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

  const handleSearchAgain = (text) => {
    setReplaySearch({ text, key: Date.now() });
    setView('home');
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setReplaySearch(null);
    setView('home');
  };

  if (isSessionLoading) {
    return (
      <div className="app-shell">
        <Loader message="Loading your session..." />
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
          <button className="nav-link" type="button" onClick={() => setView(view === 'home' ? 'history' : 'home')}>
            {view === 'home' ? 'History' : 'Search'}
          </button>
          <button className="nav-link" type="button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <main>
        {view === 'home' ? <Home replaySearch={replaySearch} /> : <History onSearchAgain={handleSearchAgain} />}
      </main>

      <footer className="site-footer">
        Powered by{' '}
        <a href="https://groq.com/" target="_blank" rel="noreferrer">
          Groq
        </a>{' '}
        +{' '}
        <a href="https://mymemory.translated.net/" target="_blank" rel="noreferrer">
          MyMemory
        </a>
      </footer>

      <ChatAssistant onSearchTerm={handleSearchAgain} />
    </div>
  );
};

export default App;
