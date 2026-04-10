'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slot: '', html_code: '', is_active: true });
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.getAds().then(d => { setAds(d.ads || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const reset = () => { setForm({ name: '', slot: '', html_code: '', is_active: true }); setEditing(null); };

  const openEdit = (ad: any) => {
    setEditing(ad);
    setForm({ name: ad.name, slot: ad.slot, html_code: ad.html_code || '', is_active: ad.is_active });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      if (editing) await api.updateAd(editing.id, form);
      else await api.createAd(form);
      setMsg('Ad saved!');
      setShowForm(false); reset(); load();
    } catch (e: any) { setMsg(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this ad?')) return;
    await api.deleteAd(id).catch(() => {});
    load();
  };

  const toggleActive = async (ad: any) => {
    await api.updateAd(ad.id, { is_active: !ad.is_active }).catch(() => {});
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ads Manager</h1>
        <button className="btn btn-primary" onClick={() => { reset(); setShowForm(!showForm); }}>
          {showForm ? '✕ Cancel' : '+ New Ad'}
        </button>
      </div>

      {msg && <div style={{ marginBottom: '1rem', padding: '0.65rem 1rem', background: 'rgba(0,204,136,0.1)', border: '1px solid rgba(0,204,136,0.3)', borderRadius: 'var(--radius)', color: 'var(--success)', fontSize: '0.85rem' }}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontWeight: 700 }}>{editing ? 'Edit Ad' : 'New Ad'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ad Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Banner Top" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Slot ID</label>
              <input value={form.slot} onChange={e => setForm(f => ({ ...f, slot: e.target.value }))} placeholder="e.g. top-banner" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>HTML / Ad Code</label>
            <textarea rows={5} value={form.html_code} onChange={e => setForm(f => ({ ...f, html_code: e.target.value }))} placeholder="Paste your Google AdSense code or custom HTML here..." />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ width: 'auto' }} />
            <label htmlFor="active" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Active</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Ad'}</button>
            <button className="btn btn-ghost" onClick={() => { setShowForm(false); reset(); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Slot</th><th>Status</th><th>Impressions</th><th>Clicks</th><th>Actions</th></tr></thead>
            <tbody>
              {ads.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No ads yet.</td></tr>
              )}
              {ads.map(ad => (
                <tr key={ad.id}>
                  <td style={{ fontWeight: 600 }}>{ad.name}</td>
                  <td><code style={{ background: 'var(--bg3)', padding: '0.15rem 0.4rem', borderRadius: 4, fontSize: '0.8rem', color: 'var(--muted)' }}>{ad.slot}</code></td>
                  <td>
                    <button className={`badge badge-${ad.is_active ? 'success' : 'danger'}`} style={{ border: 'none', cursor: 'pointer' }} onClick={() => toggleActive(ad)}>
                      {ad.is_active ? 'Active' : 'Paused'}
                    </button>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{ad.impressions?.toLocaleString()}</td>
                  <td style={{ color: 'var(--muted)' }}>{ad.clicks?.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost" onClick={() => openEdit(ad)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(ad.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
