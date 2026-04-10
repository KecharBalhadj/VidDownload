'use client';
import './globals.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/posts', icon: '📝', label: 'Posts' },
  { href: '/ads', icon: '💰', label: 'Ads' },
  { href: '/messages', icon: '✉️', label: 'Messages' },
  { href: '/newsletter', icon: '📧', label: 'Newsletter' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const isLogin = pathname === '/login';

  useEffect(() => {
    if (isLogin) return;
    const token = document.cookie.match(/vidget_token=([^;]*)/)?.[1];
    if (!token) { router.push('/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {
      headers: { Authorization: `Bearer ${decodeURIComponent(token)}` }
    }).then(r => r.json()).then(d => {
      if (d.error) router.push('/login');
      else setUser(d);
    }).catch(() => router.push('/login'));
  }, [pathname]);

  const logout = () => {
    document.cookie = 'vidget_token=; max-age=0; path=/';
    router.push('/login');
  };

  if (isLogin) return (
    <html lang="en"><body style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </body></html>
  );

  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <aside style={{
            width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                ⬇ Vid<span style={{ color: 'var(--primary)' }}>Get</span>
              </span>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.2rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
            <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {NAV.map(item => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    padding: '0.55rem 0.85rem', borderRadius: '8px',
                    color: active ? 'var(--text)' : 'var(--muted)',
                    background: active ? 'var(--bg3)' : 'transparent',
                    fontWeight: active ? 700 : 500, fontSize: '0.875rem',
                    transition: 'all 0.15s',
                    textDecoration: 'none',
                  }}>
                    <span>{item.icon}</span>
                    {item.label}
                    {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, background: 'var(--primary)', borderRadius: '50%' }} />}
                  </Link>
                );
              })}
            </nav>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
              {user && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                👤 {user.username}
              </div>}
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main */}
          <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
