import { createClient } from '@supabase/supabase-js';

function cookieStorage() {
  return {
    getItem(key) {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(
        new RegExp('(?:^|;\\s*)' + encodeURIComponent(key) + '=([^;]*)')
      );
      return match ? decodeURIComponent(match[1]) : null;
    },
    setItem(key, value) {
      if (typeof document === 'undefined') return;
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; SameSite=Lax; max-age=604800`;
    },
    removeItem(key) {
      if (typeof document === 'undefined') return;
      document.cookie = `${encodeURIComponent(key)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    },
  };
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: cookieStorage(),
      storageKey: 'sb-portal-auth',
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
