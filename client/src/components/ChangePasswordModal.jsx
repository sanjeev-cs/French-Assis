import { useEffect, useState } from 'react';
import { changePassword } from '../services/api.js';

const INITIAL_FORM = {
  currentPassword: '',
  nextPassword: '',
  confirmPassword: ''
};

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError('');
    setSuccess('');
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();

    if (form.nextPassword !== form.confirmPassword) {
      setError('New password and confirmation must match.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const data = await changePassword({
        currentPassword: form.currentPassword,
        nextPassword: form.nextPassword
      });

      setSuccess(data.message || 'Password updated successfully.');
      setForm(INITIAL_FORM);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Change password">
      <div className="modal-card modal-card--form">
        <h2>Change password</h2>
        <p>Use at least 8 characters with lowercase, uppercase, number, and special character.</p>

        <form className="account-form" onSubmit={submitPasswordChange}>
          <label>
            Current password
            <input type="password" value={form.currentPassword} onChange={updateField('currentPassword')} required />
          </label>
          <label>
            New password
            <input type="password" value={form.nextPassword} onChange={updateField('nextPassword')} required />
          </label>
          <label>
            Confirm new password
            <input type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} required />
          </label>

          {error ? <p className="account-form-error">{error}</p> : null}
          {success ? <p className="account-form-success">{success}</p> : null}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Close</button>
            <button type="submit" className="modal-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
