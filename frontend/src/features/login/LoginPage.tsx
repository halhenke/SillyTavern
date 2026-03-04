import { KeyboardEvent, useEffect, useMemo, useState } from 'react';

type UserViewModel = {
  handle: string;
  name: string;
  avatar: string;
  password: boolean;
};

type RecoveryState = {
  code: string;
  newPassword: string;
};

async function getCsrfToken() {
  const response = await fetch('/csrf-token');
  if (!response.ok) {
    throw new Error('Could not get CSRF token');
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

async function getUsers(csrfToken: string): Promise<{ discreet: boolean; users: UserViewModel[] }> {
  const response = await fetch('/api/users/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
  });

  if (response.status === 204) {
    return { discreet: true, users: [] };
  }

  if (!response.ok) {
    const errorData = (await response.json()) as { error?: string };
    throw new Error(errorData.error ?? 'Could not fetch users');
  }

  return { discreet: false, users: (await response.json()) as UserViewModel[] };
}

function redirectToHome() {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete('noauto');
  currentUrl.pathname = '/';
  window.location.href = currentUrl.toString();
}

export function LoginPage() {
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [discreet, setDiscreet] = useState(false);
  const [users, setUsers] = useState<UserViewModel[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserViewModel | null>(null);
  const [userHandle, setUserHandle] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recovery, setRecovery] = useState<RecoveryState>({ code: '', newPassword: '' });
  const [error, setError] = useState('');

  const activeHandle = useMemo(() => {
    return discreet ? userHandle.trim() : (selectedUser?.handle ?? '');
  }, [discreet, selectedUser?.handle, userHandle]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const token = await getCsrfToken();
        if (!mounted) return;
        setCsrfToken(token);

        const result = await getUsers(token);
        if (!mounted) return;

        setDiscreet(result.discreet);
        setUsers(result.users);
        setError('');
      } catch (bootstrapError) {
        const message = bootstrapError instanceof Error ? bootstrapError.message : 'Could not initialize login';
        if (mounted) {
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  async function performLogin(handle: string, nextPassword: string) {
    setError('');

    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ handle, password: nextPassword }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      setError(errorData.error ?? 'Login failed');
      return;
    }

    redirectToHome();
  }

  async function requestRecovery(handle: string) {
    const response = await fetch('/api/users/recover-step1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ handle }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      setError(errorData.error ?? 'Recovery request failed');
      return;
    }

    setError('');
    setRecoveryOpen(true);
  }

  async function submitRecovery(handle: string) {
    const response = await fetch('/api/users/recover-step2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        handle,
        code: recovery.code,
        newPassword: recovery.newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      setError(errorData.error ?? 'Password recovery failed');
      return;
    }

    await performLogin(handle, recovery.newPassword);
  }

  async function handlePrimaryAction() {
    if (!activeHandle) {
      setError('User handle is required');
      return;
    }

    if (recoveryOpen) {
      await submitRecovery(activeHandle);
      return;
    }

    if (discreet || selectedUser?.password) {
      await performLogin(activeHandle, password);
      return;
    }

    await performLogin(activeHandle, '');
  }

  async function handleForgotPassword() {
    if (!activeHandle) {
      setError('User handle is required');
      return;
    }

    await requestRecovery(activeHandle);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    void handlePrimaryAction();
  }

  return (
    <main className="st-screen" onKeyDown={handleKeyDown}>
      <section className="st-panel st-login-panel">
        <header>
          <h1>Welcome to SillyTavern</h1>
          <p>{discreet ? 'Enter login details' : 'Select an account'}</p>
        </header>

        {loading ? <p>Loading accounts...</p> : null}

        {!loading && !discreet ? (
          <div className="st-user-list">
            {users.map((user) => (
              <button
                key={user.handle}
                className={`st-user-card${selectedUser?.handle === user.handle ? ' st-user-card--selected' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedUser(user);
                  setRecoveryOpen(false);
                  setError('');
                }}
              >
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
                <small>@{user.handle}</small>
              </button>
            ))}
          </div>
        ) : null}

        {discreet ? (
          <label className="st-field">
            <span>User handle</span>
            <input
              autoComplete="username"
              id="userHandle"
              type="text"
              value={userHandle}
              onChange={(event) => setUserHandle(event.target.value)}
            />
          </label>
        ) : null}

        {(discreet || selectedUser?.password) ? (
          <label className="st-field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              id="userPassword"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        ) : null}

        {recoveryOpen ? (
          <>
            <p className="st-note">Recovery code has been posted to the server console.</p>
            <label className="st-field">
              <span>Recovery code</span>
              <input
                type="text"
                value={recovery.code}
                onChange={(event) => setRecovery((prev) => ({ ...prev, code: event.target.value }))}
              />
            </label>
            <label className="st-field">
              <span>New password</span>
              <input
                autoComplete="new-password"
                type="password"
                value={recovery.newPassword}
                onChange={(event) => setRecovery((prev) => ({ ...prev, newPassword: event.target.value }))}
              />
            </label>
          </>
        ) : null}

        <div className="st-actions">
          <button type="button" onClick={() => void handlePrimaryAction()}>
            {recoveryOpen ? 'Send recovery' : 'Login'}
          </button>
          {(discreet || selectedUser?.password) && !recoveryOpen ? (
            <button className="st-button--ghost" type="button" onClick={() => void handleForgotPassword()}>
              Forgot password?
            </button>
          ) : null}
          {recoveryOpen ? (
            <button className="st-button--ghost" type="button" onClick={() => setRecoveryOpen(false)}>
              Cancel recovery
            </button>
          ) : null}
          <a className="st-button--ghost" href="/legacy-login">
            Open legacy login
          </a>
        </div>

        {error ? <p className="st-error">{error}</p> : null}
      </section>
    </main>
  );
}
