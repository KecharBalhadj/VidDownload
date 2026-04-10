import { useState } from 'react';
import { subscribeNewsletter } from '../../utils/api';
import { getTranslations, getLangFromStorage, type Lang } from '../../utils/i18n';

interface Props {
  lang?: Lang;
}

export default function Newsletter({ lang = 'en' }: Props) {
  const t = getTranslations(lang);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!email.includes('@')) return;
    setStatus('loading');
    try {
      const userLang = typeof window !== 'undefined' ? getLangFromStorage() : lang;
      await subscribeNewsletter(email, userLang);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="newsletter-box">
      <div className="newsletter-icon">📧</div>
      <h3 className="newsletter-title">{t.newsletter.title}</h3>
      <p className="newsletter-desc">{t.newsletter.description}</p>

      {status === 'success' ? (
        <div className="newsletter-success">
          <span>✓</span> {t.newsletter.success}
        </div>
      ) : (
        <div className="newsletter-form">
          <input
            type="email"
            className="input-field"
            placeholder={t.newsletter.placeholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            disabled={status === 'loading'}
          />
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={status === 'loading' || !email}
          >
            {status === 'loading' ? <span className="loading-spinner" /> : null}
            {t.newsletter.subscribe}
          </button>
          {status === 'error' && (
            <p className="newsletter-error">{t.newsletter.error}</p>
          )}
        </div>
      )}

      <style>{`
        .newsletter-box {
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(0,245,200,0.06));
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .newsletter-icon { font-size: 2.5rem; }
        .newsletter-title { font-size: 1.5rem; color: var(--text); }
        .newsletter-desc { color: var(--text-muted); font-size: 0.9rem; max-width: 400px; }
        .newsletter-form {
          display: flex; gap: 0.75rem; width: 100%; max-width: 460px; flex-wrap: wrap; justify-content: center;
        }
        .newsletter-form .input-field { flex: 1; min-width: 200px; }
        .newsletter-success {
          color: var(--accent); font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;
        }
        .newsletter-error { color: #ff8888; font-size: 0.8rem; width: 100%; text-align: center; }
      `}</style>
    </div>
  );
}
