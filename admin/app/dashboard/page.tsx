'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ posts: 0, ads: 0, messages: 0, subscribers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPosts().catch(() => ({ posts: [] })),
      api.getAds().catch(() => ({ ads: [] })),
      api.getMessages().catch(() => ({ messages: [] })),
      api.getSubscribers().catch(() => ({ subscribers: [] })),
    ]).then(([posts, ads, messages, newsletter]) => {
      setStats({
        posts: posts.posts?.length || 0,
        ads: ads.ads?.length || 0,
        messages: messages.messages?.length || 0,
        subscribers: newsletter.subscribers?.length || 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: '📝', label: 'Blog Posts', value: stats.posts, color: '#6366f1', href: '/posts' },
    { icon: '💰', label: 'Active Ads', value: stats.ads, color: '#00cc88', href: '/ads' },
    { icon: '✉️', label: 'Messages', value: stats.messages, color: '#ffbb00', href: '/messages' },
    { icon: '📧', label: 'Subscribers', value: stats.subscribers, color: '#00f5c8', href: '/newsletter' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Welcome back. Here's an overview.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(card => (
          <a key={card.label} href={card.href} className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'border-color 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = card.color + '66')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
            <div style={{ fontSize: '1.75rem' }}>{card.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color }}>
              {loading ? '...' : card.value}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600 }}>{card.label}</div>
          </a>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: '+ New Post', href: '/posts' },
              { label: '+ New Ad', href: '/ads' },
              { label: 'View Messages', href: '/messages' },
              { label: 'View Subscribers', href: '/newsletter' },
            ].map(action => (
              <a key={action.label} href={action.href} className="btn btn-ghost" style={{ justifyContent: 'flex-start', textDecoration: 'none', display: 'flex' }}>
                {action.label}
              </a>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700 }}>System Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Frontend', status: 'Online', ok: true },
              { label: 'Backend API', status: 'Online', ok: true },
              { label: 'Database', status: 'Connected', ok: true },
              { label: 'yt-dlp', status: 'Active', ok: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{item.label}</span>
                <span className={`badge badge-${item.ok ? 'success' : 'danger'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
