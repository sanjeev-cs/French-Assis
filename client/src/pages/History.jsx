import HistoryPanel from '../components/HistoryPanel.jsx';

const History = ({ onSearchAgain }) => {
  return (
    <section className="history-page fade-in">
      <div className="page-heading">
        <h1>History</h1>
      </div>
      <HistoryPanel onSearchAgain={onSearchAgain} />
    </section>
  );
};

export default History;
