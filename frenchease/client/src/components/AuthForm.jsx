import { useState } from 'react';
import { loginUser, registerUser } from '../services/api.js';

const AuthForm = ({ onAuthenticated }) => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isRegistering = mode === 'register';

  const submitAuth = async (event) => {
    event.preventDefault();
    setError('');
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

  return (
    <section className="auth-page fade-in">
      <div className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">Private learning space</p>
          <h1>{isRegistering ? 'Create your FrenchEase account' : 'Log in to FrenchEase'}</h1>
          <p>Save your translation history, keep your practice organized, and use the Groq assistant securely.</p>
        </div>

        <form className="auth-form" onSubmit={submitAuth}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              placeholder="Password"
              required
            />
          </label>

          {isRegistering ? (
            <p className="password-rules">Use 8+ characters with lowercase, uppercase, number, and special character.</p>
          ) : null}

          {error ? <p className="error-banner">{error}</p> : null}

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Please wait...' : isRegistering ? 'Create account' : 'Log in'}
          </button>
        </form>

        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setMode(isRegistering ? 'login' : 'register');
            setError('');
          }}
        >
          {isRegistering ? 'Already have an account? Log in' : 'Need an account? Create one'}
        </button>
      </div>
    </section>
  );
};

export default AuthForm;
