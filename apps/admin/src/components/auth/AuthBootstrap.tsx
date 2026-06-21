import { useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import { getEnv } from '@/lib/utils';
import { store } from '@/store';
import { setCredentials, logout } from '@/store/slices/authSlice';
import { PageLoader } from '@/components/ui/spinner';

const API_URL = getEnv('VITE_API_URL', '/api/v1');

/** Restore session on load via refresh cookie; block protected routes until complete. */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = store.getState().auth.accessToken;
      if (!token) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
          if (!cancelled && data?.data?.accessToken) {
            store.dispatch(setCredentials({ accessToken: data.data.accessToken, user: data.data.user }));
          }
        } catch {
          if (!cancelled) store.dispatch(logout());
        }
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return <PageLoader />;
  return children;
}
