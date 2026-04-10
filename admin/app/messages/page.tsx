'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const load = () => {
    setLoading(true);
    api.getMessages()
      .then(d => { setMessages(d.messages || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await api.markRead(id).catch(() => {});
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    if (selected?.id === id) setSelected((s: any) => s ? { ...s, is_read: true } : s);
  };

  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          Messages
          {unread > 0 && (
            <span style={{ marginLeft: '0.75rem', background: 'var(--danger)', color: 'white', borderRadius: '100px', padding: '0.15rem 0.6rem', fontSize: '0.8rem', fontWeight: 700 }}>
              {unread} new
            </span>
          )}
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Contact form submissions from visitors.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
          ) : messages.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No messages yet.</div>
          ) : (
            messages.map(m => (
              <div
                key={m.id}
                onClick={() => { setSelected(m); if (!m.is_read) markRead(m.id); }}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: selected?.id === m.id ? 'var(--bg3)' : !m.is_read ? 'rgba(99,102,241,0.05)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: m.is_read ? 500 : 700, fontSize: '0.875rem', color: 'var(--text)' }}>{m.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{m.created_at?.slice(0, 10)}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.email}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.2rem' }}>
                  {m.message?.slice(0, 60)}...
                </div>
                {!m.is_read && (
                  <div style={{ width: 7, height: 7, background: 'var(--primary)', borderRadius: '50%', marginTop: '0.4rem' }} />
                )}
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selected.name}</h2>
                <a href={`mailto:${selected.email}`} style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>{selected.email}</a>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`badge badge-${selected.is_read ? 'success' : 'primary'}`}>
                  {selected.is_read ? 'Read' : 'Unread'}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{selected.created_at?.slice(0, 16).replace('T', ' ')}</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', lineHeight: 1.7, color: 'var(--text)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
              {selected.message}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href={`mailto:${selected.email}`} className="btn btn-primary">
                Reply via Email
              </a>
              {!selected.is_read && (
                <button className="btn btn-ghost" onClick={() => markRead(selected.id)}>
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--muted)', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>✉️</span>
            <p>Select a message to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
