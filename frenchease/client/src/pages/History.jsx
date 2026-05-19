import HistoryPanel from '../components/HistoryPanel.jsx';

const BackArrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const History = ({ onSearchAgain, onBack }) => {
  return (
    <section className="history-page fade-in">
      <button className="back-btn" type="button" onClick={onBack}>
        <BackArrow />
        Back to search
      </button>
      <div className="page-heading">
        <h1>History</h1>
      </div>
      <HistoryPanel onSearchAgain={onSearchAgain} />
    </section>
  );
};

export default History;
