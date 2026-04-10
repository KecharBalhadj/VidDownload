'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title_en: '', title_ar: '', content_en: '', content_ar: '', excerpt_en: '', excerpt_ar: '', slug: '', category: 'Tutorial', read_time: '3 min', is_published: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.getPosts().then(d => { setPosts(d.posts || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title_en: '', title_ar: '', content_en: '', content_ar: '', excerpt_en: '', excerpt_ar: '', slug: '', category: 'Tutorial', read_time: '3 min', is_published: true });
    setEditing(null);
  };

  const openEdit = (post: any) => {
    setEditing(post);
    setForm({ title_en: post.title_en || '', title_ar: post.title_ar || '', content_en: '', content_ar: '', excerpt_en: '', excerpt_ar: '', slug: post.slug || '', category: post.category || 'Tutorial', read_time: post.read_time || '3 min', is_published: post.is_published });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      if (editing) {
        await api.updatePost(editing.id, form);
      } else {
        await api.createPost(form);
      }
      setMsg('Saved successfully!');
      setShowForm(false);
      resetForm();
      load();
    } catch (e: any) {
      setMsg(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.deletePost(id);
      load();
    } catch {}
  };

  const F = ({ label, field, type = 'text', rows = 0 }: any) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {rows > 0
        ? <textarea rows={rows} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
        : <input type={type} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: type === 'checkbox' ? (e.target as any).checked : e.target.value }))} />
      }
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Blog Posts</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ Cancel' : '+ New Post'}
        </button>
      </div>

      {msg && <div style={{ marginBottom: '1rem', padding: '0.65rem 1rem', background: msg.includes('success') ? 'rgba(0,204,136,0.1)' : 'rgba(255,68,102,0.1)', border: `1px solid ${msg.includes('success') ? 'rgba(0,204,136,0.3)' : 'rgba(255,68,102,0.3)'}`, borderRadius: 'var(--radius)', color: msg.includes('success') ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem' }}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontWeight: 700 }}>{editing ? 'Edit Post' : 'New Post'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <F label="Slug (URL)" field="slug" />
            <F label="Category" field="category" />
            <F label="Title (English)" field="title_en" />
            <F label="Title (Arabic)" field="title_ar" />
            <F label="Excerpt (English)" field="excerpt_en" />
            <F label="Excerpt (Arabic)" field="excerpt_ar" />
            <F label="Read Time" field="read_time" />
          </div>
          <F label="Content (English — Markdown)" field="content_en" rows={8} />
          <F label="Content (Arabic — Markdown)" field="content_ar" rows={8} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="pub" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} style={{ width: 'auto' }} />
            <label htmlFor="pub" style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Published</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Post'}</button>
            <button className="btn btn-ghost" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : (
          <table>
            <thead><tr>
              <th>Title</th><th>Category</th><th>Status</th><th>Likes</th><th>Date</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {posts.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No posts yet. Create your first post!</td></tr>
              )}
              {posts.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title_en}</td>
                  <td><span className="badge badge-primary">{p.category}</span></td>
                  <td><span className={`badge badge-${p.is_published ? 'success' : 'danger'}`}>{p.is_published ? 'Published' : 'Draft'}</span></td>
                  <td style={{ color: 'var(--muted)' }}>{p.likes_count || 0}</td>
                  <td style={{ color: 'var(--muted)' }}>{p.created_at?.slice(0, 10)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
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
