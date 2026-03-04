import { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useFrontendFlags } from '../services/frontendFlags';
import { LoginPage } from '../features/login/LoginPage';
import { ShellPage } from '../features/shell/ShellPage';

function LoadingScreen() {
  return (
    <main className="st-screen">
      <section className="st-panel st-panel--center">
        <h1>Loading frontend runtime</h1>
        <p>Reading feature flags from the server.</p>
      </section>
    </main>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <main className="st-screen">
      <section className="st-panel st-panel--center">
        <h1>Frontend bootstrap error</h1>
        <p>{message}</p>
        <p>
          Use <a href="/legacy">legacy app</a> or <a href="/legacy-login">legacy login</a>.
        </p>
      </section>
    </main>
  );
}

export function App() {
  const location = useLocation();
  const { data, isLoading, isError, error } = useFrontendFlags();

  const path = useMemo(() => location.pathname, [location.pathname]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !data) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return <ErrorScreen message={message} />;
  }

  if (path === '/login') {
    return data.reactLoginEnabled ? <LoginPage /> : <Navigate to="/legacy-login" replace />;
  }

  return data.reactShellEnabled ? <ShellPage /> : <Navigate to="/legacy" replace />;
}
