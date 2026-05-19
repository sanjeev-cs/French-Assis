import { useState } from 'react';
import ChatAssistant from './components/ChatAssistant.jsx';
import Home from './pages/Home.jsx';
import History from './pages/History.jsx';

const App = () => {
  const [view, setView] = useState('home');
  const [replaySearch, setReplaySearch] = useState(null);

  const handleSearchAgain = (text) => {
    setReplaySearch({ text, key: Date.now() });
    setView('home');
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand-button" type="button" onClick={() => setView('home')}>
          <span className="brand-name">FrenchEase</span>
        </button>
        <nav>
          <button className="nav-link" type="button" onClick={() => setView(view === 'home' ? 'history' : 'home')}>
            {view === 'home' ? 'History' : 'Search'}
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
