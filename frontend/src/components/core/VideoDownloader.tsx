import { useState, useCallback } from 'react';
import { analyzeVideo, getDownloadUrl, type VideoInfo, type VideoFormat } from '../../utils/api';
import { detectPlatform, getPlatformTheme, PLATFORM_THEMES } from '../../utils/platforms';
import { getBrowserId } from '../../utils/browserid';
import { getTranslations, type Lang } from '../../utils/i18n';

interface Props {
  lang?: Lang;
}

export default function VideoDownloader({ lang = 'en' }: Props) {
  const t = getTranslations(lang);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [formatType, setFormatType] = useState<'video' | 'audio' | 'video_only'>('video');
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [downloading, setDownloading] = useState(false);
  const [platform, setPlatform] = useState('unknown');

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      setError(t.errors.invalid_url);
      return;
    }
    setError('');
    setLoading(true);
    setVideoInfo(null);
    const detected = detectPlatform(url);
    setPlatform(detected);
    document.body.dataset.platform = detected;
    try {
      const info = await analyzeVideo(url);
      setVideoInfo(info);
      // Set default format
      const first = info.formats.find(f => f.type === 'video') || info.formats[0];
      if (first) setSelectedFormat(first.format_id);
    } catch (e: any) {
      setError(e.message || t.errors.fetch_failed);
    } finally {
      setLoading(false);
    }
  }, [url, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyze();
  };

  const handleDownload = useCallback(async () => {
    if (!videoInfo || !selectedFormat) return;
    setDownloading(true);
    try {
      const browserId = getBrowserId();
      const { download_url } = await getDownloadUrl({ url, format_id: selectedFormat, browser_id: browserId });
      const a = document.createElement('a');
      a.href = download_url;
      a.download = videoInfo.title || 'video';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e: any) {
      setError(e.message || t.errors.fetch_failed);
    } finally {
      setDownloading(false);
    }
  }, [videoInfo, selectedFormat, url, t]);

  const theme = getPlatformTheme(url);
  const filteredFormats = videoInfo?.formats.filter(f => f.type === formatType) ?? [];

  const qualityLabels: Record<string, string> = {
    auto: t.quality.auto,
    '2160p': t.quality['4k'],
    '1080p': t.quality['1080p'],
    '720p': t.quality['720p'],
    '480p': t.quality['480p'],
    '360p': t.quality['360p'],
    '240p': t.quality['240p'],
    '144p': t.quality['144p'],
  };

  return (
    <div className="downloader">
      {/* URL Input */}
      <div className="url-box card">
        <div className="url-input-row">
          <div className="url-input-wrap">
            {platform !== 'unknown' && url && (
              <span className="platform-badge" style={{ background: theme.primary + '22', color: theme.primary, border: `1px solid ${theme.primary}44` }}>
                {PLATFORM_THEMES[platform as keyof typeof PLATFORM_THEMES]?.emoji} {theme.name}
              </span>
            )}
            <input
              type="url"
              className="input-field url-input"
              placeholder={t.hero.placeholder}
              value={url}
              onChange={e => { setUrl(e.target.value); setPlatform(detectPlatform(e.target.value)); }}
              onKeyDown={handleKeyDown}
              dir="ltr"
            />
          </div>
          <button
            className="btn btn-primary analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <><span className="loading-spinner" />{t.hero.analyzing}</>
            ) : (
              <>{t.hero.analyze}</>
            )}
          </button>
        </div>

        {error && (
          <div className="error-msg">
            <span>⚠</span> {error}
          </div>
        )}
      </div>

      {/* Video Info */}
      {videoInfo && (
        <div className="video-result animate-fade-in">
          {/* Thumbnail & Info */}
          <div className="video-info-row card">
            <div className="thumbnail-wrap">
              <img src={videoInfo.thumbnail} alt={videoInfo.title} className="thumbnail" />
              <div className="thumbnail-overlay">
                <span className="play-icon">▶</span>
              </div>
            </div>
            <div className="video-meta">
              <h3 className="video-title">{videoInfo.title}</h3>
              {videoInfo.uploader && (
                <p className="video-uploader">
                  <span>👤</span> {videoInfo.uploader}
                </p>
              )}
              <div className="video-stats">
                {videoInfo.duration > 0 && (
                  <span className="stat-chip">
                    ⏱ {Math.floor(videoInfo.duration / 60)}:{String(videoInfo.duration % 60).padStart(2, '0')}
                  </span>
                )}
                {videoInfo.view_count && (
                  <span className="stat-chip">
                    👁 {videoInfo.view_count.toLocaleString()}
                  </span>
                )}
                <span className="stat-chip" style={{ background: theme.primary + '22', color: theme.primary }}>
                  {theme.emoji} {theme.name}
                </span>
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="download-options card">
            {/* Format Type */}
            <div className="option-group">
              <label className="option-label">{t.download.format}</label>
              <div className="toggle-group">
                {(['video', 'audio', 'video_only'] as const).map(type => (
                  <button
                    key={type}
                    className={`toggle-btn ${formatType === type ? 'active' : ''}`}
                    onClick={() => { setFormatType(type); setSelectedFormat(''); }}
                  >
                    {type === 'video' ? `🎬 ${t.download.video}` :
                     type === 'audio' ? `🎵 ${t.download.audio_only}` :
                     `📹 ${t.download.no_audio}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="option-group">
              <label className="option-label">{t.download.quality}</label>
              <div className="quality-grid">
                {filteredFormats.length > 0 ? filteredFormats.map(f => (
                  <button
                    key={f.format_id}
                    className={`quality-chip ${selectedFormat === f.format_id ? 'active' : ''}`}
                    onClick={() => setSelectedFormat(f.format_id)}
                  >
                    <span className="quality-label">{qualityLabels[f.quality] || f.quality}</span>
                    {f.ext && <span className="quality-ext">.{f.ext}</span>}
                    {f.filesize && (
                      <span className="quality-size">{(f.filesize / 1024 / 1024).toFixed(0)}MB</span>
                    )}
                  </button>
                )) : (
                  <p className="no-formats">No formats available for this type.</p>
                )}
              </div>
            </div>

            {/* Download Button */}
            <button
              className="btn btn-primary download-btn"
              onClick={handleDownload}
              disabled={downloading || !selectedFormat}
              style={{ background: theme.primary }}
            >
              {downloading ? (
                <><span className="loading-spinner" /> Preparing download...</>
              ) : (
                <>⬇ {t.download.download}</>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .downloader { display: flex; flex-direction: column; gap: 1.5rem; }

        .url-box { padding: 1.5rem; }
        .url-input-row { display: flex; gap: 0.75rem; align-items: flex-end; }
        .url-input-wrap { flex: 1; position: relative; display: flex; flex-direction: column; gap: 0.5rem; }
        .platform-badge {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.2rem 0.6rem; border-radius: 100px;
          font-size: 0.75rem; font-weight: 700; width: fit-content;
        }
        .url-input { font-size: 1rem; padding: 0.9rem 1.25rem; }
        .analyze-btn { white-space: nowrap; min-width: 120px; justify-content: center; }

        .error-msg {
          margin-top: 0.75rem; padding: 0.75rem 1rem;
          background: rgba(255,100,100,0.1); border: 1px solid rgba(255,100,100,0.3);
          border-radius: var(--radius); color: #ff8888; font-size: 0.85rem;
          display: flex; align-items: center; gap: 0.5rem;
        }

        .video-result { display: flex; flex-direction: column; gap: 1.25rem; }

        .video-info-row {
          display: flex; gap: 1.5rem; align-items: flex-start; padding: 1.25rem;
        }

        .thumbnail-wrap {
          position: relative; flex-shrink: 0; width: 200px;
          border-radius: 10px; overflow: hidden; cursor: pointer;
        }
        .thumbnail { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
        .thumbnail-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
        }
        .thumbnail-wrap:hover .thumbnail-overlay { opacity: 1; }
        .play-icon { font-size: 2rem; color: white; }

        .video-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.75rem; }
        .video-title { font-size: 1.1rem; color: var(--text); font-weight: 700; line-height: 1.4; }
        .video-uploader { color: var(--text-muted); font-size: 0.85rem; display: flex; align-items: center; gap: 0.4rem; }

        .video-stats { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .stat-chip {
          padding: 0.25rem 0.65rem; background: var(--bg3); border: 1px solid var(--border);
          border-radius: 100px; font-size: 0.78rem; color: var(--text-muted);
          display: flex; align-items: center; gap: 0.3rem;
        }

        .download-options { display: flex; flex-direction: column; gap: 1.5rem; }

        .option-group { display: flex; flex-direction: column; gap: 0.6rem; }
        .option-label {
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--text-muted);
        }

        .toggle-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .toggle-btn {
          padding: 0.5rem 1rem; background: var(--bg3); border: 1.5px solid var(--border);
          border-radius: var(--radius); color: var(--text-muted); font-size: 0.85rem;
          font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .toggle-btn:hover { color: var(--text); border-color: var(--primary); }
        .toggle-btn.active { background: rgba(99,102,241,0.15); border-color: var(--primary); color: var(--primary); }

        .quality-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; }
        .quality-chip {
          display: flex; flex-direction: column; align-items: center; gap: 0.1rem;
          padding: 0.5rem 0.9rem; background: var(--bg3); border: 1.5px solid var(--border);
          border-radius: var(--radius); cursor: pointer; transition: all 0.2s; min-width: 80px;
        }
        .quality-chip:hover { border-color: var(--primary); }
        .quality-chip.active { background: rgba(99,102,241,0.15); border-color: var(--primary); }
        .quality-label { font-size: 0.85rem; font-weight: 700; color: var(--text); }
        .quality-ext { font-size: 0.7rem; color: var(--text-muted); }
        .quality-size { font-size: 0.7rem; color: var(--accent); }

        .no-formats { color: var(--text-muted); font-size: 0.85rem; }

        .download-btn {
          width: 100%; justify-content: center; padding: 1rem;
          font-size: 1rem; border-radius: var(--radius);
        }
        .download-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

        @media (max-width: 640px) {
          .url-input-row { flex-direction: column; }
          .analyze-btn { width: 100%; }
          .video-info-row { flex-direction: column; }
          .thumbnail-wrap { width: 100%; }
        }
      `}</style>
    </div>
  );
}
