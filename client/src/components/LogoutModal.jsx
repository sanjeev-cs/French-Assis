import { useEffect } from 'react';

const LogoutModal = ({ onConfirm, onCancel }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Confirm logout">
      <div className="modal-card">
        <h2>Log out?</h2>
        <p>Your session will end and you'll need to sign in again.</p>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="button" className="modal-confirm" onClick={onConfirm}>Log out</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
