import { useEffect, useState } from 'react';
import { deleteHistory, fetchHistory } from '../services/api.js';
import Loader from './Loader.jsx';

const formatDate = (value) => {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
};

const HistoryPanel = ({ onSearchAgain }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await fetchHistory({ limit: 20 });
      setItems(data.items || []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const removeItem = async (id) => {
    await deleteHistory(id);
    setItems((current) => current.filter((item) => item._id !== id));
  };

  if (isLoading) {
    return <Loader message="Loading history..." />;
  }

  return (
    <div className="history-panel">
      {error ? <p className="error-banner">{error}</p> : null}
      {!items.length && !error ? <p className="empty-state">No searches yet.</p> : null}

      {items.map((item) => (
        <article className="history-card" key={item._id}>
          <div>
            <p className="history-text">
              {item.inputText} to <strong>{item.translatedText}</strong>
            </p>
            <time>{formatDate(item.createdAt)}</time>
          </div>
          <div className="history-actions">
            <button className="secondary-button" type="button" onClick={() => onSearchAgain(item.inputText)}>
              Search again
            </button>
            <button className="ghost-danger" type="button" onClick={() => removeItem(item._id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default HistoryPanel;
