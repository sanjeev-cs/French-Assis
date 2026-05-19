const ViewSwitcher = ({ view, onChange }) => {
  return (
    <div className="view-switcher" aria-label="Primary navigation">
      <button
        className={`view-switcher-button ${view === 'home' ? 'active' : ''}`}
        type="button"
        onClick={() => onChange('home')}
      >
        Search
      </button>
      <button
        className={`view-switcher-button ${view === 'history' ? 'active' : ''}`}
        type="button"
        onClick={() => onChange('history')}
      >
        History
      </button>
    </div>
  );
};

export default ViewSwitcher;
