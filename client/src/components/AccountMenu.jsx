import { useEffect, useRef, useState } from 'react';

const AccountIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

const ChevronIcon = ({ isOpen }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={isOpen ? 'is-open' : ''}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const AccountMenu = ({ username, onChangePassword, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAction = (callback) => {
    setIsOpen(false);
    callback();
  };

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        className="account-trigger"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open account menu"
      >
        <span className="account-trigger-icon">
          <AccountIcon />
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen ? (
        <div className="account-dropdown" role="menu" aria-label="Account menu">
          <div className="account-summary">
            <span className="label">Signed in as</span>
            <strong>{username}</strong>
          </div>
          <button type="button" className="account-dropdown-button" role="menuitem" onClick={() => handleAction(onChangePassword)}>
            Change password
          </button>
          <button type="button" className="account-dropdown-button account-dropdown-button--danger" role="menuitem" onClick={() => handleAction(onLogout)}>
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default AccountMenu;
