'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');

  useEffect(() => {
    api.getSubscribers()
      .then(d => { setSubscribers(d.subscribers || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const LANGS = ['all', 'en', 'ar', 'es', 'fr', 'hi', 'zh', 'ru'];

  const filtered = subscribers.filter(s => {
    const matchSearch = !search || s.email.toLowerCase().includes(search.toLowerCase());
    const matchLang = filterLang === 'all' || s.lang === filterLang;
    return matchSearch && matchLang;
  });

  const langCounts = subscribers.reduce((acc: any, s) => {
    acc[s.lang] = (acc[s.lang] || 0) + 1;
    return acc;
  }, {});

  const copyEmails = () => {
    const emails = filtered.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails).catch(() => {});
    alert(`Copied ${filtered.length} emails!`);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Newsletter</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
            {subscribers.length} total subscribers
          </p>
        </div>
        <button className="btn btn-ghost" onClick={copyEmails} disabled={filtered.length === 0}>
          📋 Copy Emails ({filtered.length})
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {Object.entries(langCounts).map(([lang, count]: any) => (
          <div key={lang} className="card" style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{count}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.2rem' }}>{lang}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 260 }}
        />
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {LANGS.map(l => (
            <button
              key={l}
              className={`btn ${filterLang === l ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterLang(l)}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Language</th>
                <th>Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
                    No subscribers match your filter.
                  </td>
                </tr>
              )}
              {filtered.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--muted)', width: 50 }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{s.email}</td>
                  <td>
                    <span className="badge badge-primary">{s.lang?.toUpperCase()}</span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{s.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
