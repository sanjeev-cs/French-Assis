import { useState } from 'react';
import { loginUser, registerUser } from '../services/api.js';

const EyeIcon = ({ visible }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <path d="M1 1l22 22" />
      </>
    )}
  </svg>
);

const PasswordInput = ({ value, onChange, autoComplete, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-field">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        className="eye-toggle"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        <EyeIcon visible={showPassword} />
      </button>
    </div>
  );
};

const AuthForm = ({ onAuthenticated }) => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isRegistering = mode === 'register';

  const submitAuth = async (event) => {
    event.preventDefault();
    setError('');

    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const action = isRegistering ? registerUser : loginUser;
      const data = await action({ username, password });
      onAuthenticated(data.user);
    } catch (requestError) {
      setError(requestError.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isRegistering ? 'login' : 'register');
    setError('');
    setConfirmPassword('');
  };

  return (
    <section className="auth-page fade-in">
      <div className="auth-card">
        <h1>{isRegistering ? 'Create account' : 'Welcome back'}</h1>

        <form className="auth-form" onSubmit={submitAuth}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="Enter username"
              required
            />
          </label>

          <label>
            Password
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              placeholder="Enter password"
            />
          </label>

          {isRegistering ? (
            <>
              <label>
                Confirm password
                <PasswordInput
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                />
              </label>
              <p className="password-rules">Min 8 characters — uppercase, lowercase, number, special character.</p>
            </>
          ) : null}

          {error ? <p className="error-banner">{error}</p> : null}

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Please wait...' : isRegistering ? 'Create account' : 'Log in'}
          </button>
        </form>

        <button className="auth-switch" type="button" onClick={switchMode}>
          {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </section>
  );
};

export default AuthForm;
