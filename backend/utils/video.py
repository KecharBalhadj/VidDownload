import yt_dlp
import os
import re
from typing import Optional


SUPPORTED_DOMAINS = {
    'youtube.com', 'youtu.be',
    'tiktok.com',
    'instagram.com',
    'facebook.com', 'fb.watch',
    'twitter.com', 'x.com',
    'pinterest.com', 'pin.it',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv',
    'reddit.com',
    'threads.net',
    'linkedin.com',
    'snapchat.com',
}


def detect_platform(url: str) -> str:
    url_lower = url.lower()
    if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
        return 'youtube'
    if 'tiktok.com' in url_lower:
        return 'tiktok'
    if 'instagram.com' in url_lower:
        return 'instagram'
    if 'facebook.com' in url_lower or 'fb.watch' in url_lower:
        return 'facebook'
    if 'twitter.com' in url_lower or 'x.com' in url_lower:
        return 'twitter'
    if 'pinterest.com' in url_lower or 'pin.it' in url_lower:
        return 'pinterest'
    if 'vimeo.com' in url_lower:
        return 'vimeo'
    if 'dailymotion.com' in url_lower:
        return 'dailymotion'
    if 'twitch.tv' in url_lower:
        return 'twitch'
    if 'reddit.com' in url_lower:
        return 'reddit'
    if 'threads.net' in url_lower:
        return 'threads'
    if 'linkedin.com' in url_lower:
        return 'linkedin'
    if 'snapchat.com' in url_lower:
        return 'snapchat'
    return 'unknown'


def is_supported_url(url: str) -> bool:
    for domain in SUPPORTED_DOMAINS:
        if domain in url.lower():
            return True
    return False


def is_valid_url(url: str) -> bool:
    pattern = re.compile(
        r'^https?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE
    )
    return bool(pattern.match(url))


def get_ydl_opts_info(platform: str) -> dict:
    opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True,
    }
    if platform == 'tiktok':
        opts['http_headers'] = {
            'User-Agent': 'TikTok/26.2.0 (iPhone; iOS 14.4.2; Scale/3.00)',
        }
    return opts


def normalize_formats(formats: list, platform: str) -> list:
    result = []
    seen_qualities = set()

    for f in formats:
        if not f.get('url') and not f.get('format_id'):
            continue

        vcodec = f.get('vcodec', '')
        acodec = f.get('acodec', '')
        height = f.get('height') or 0
        ext = f.get('ext', 'mp4')

        if vcodec and vcodec != 'none' and acodec and acodec != 'none':
            ftype = 'video'
        elif vcodec and vcodec != 'none' and (not acodec or acodec == 'none'):
            ftype = 'video_only'
        elif (not vcodec or vcodec == 'none') and acodec and acodec != 'none':
            ftype = 'audio'
        else:
            ftype = 'video'

        if height >= 2160:
            quality = '2160p'
        elif height >= 1440:
            quality = '1440p'
        elif height >= 1080:
            quality = '1080p'
        elif height >= 720:
            quality = '720p'
        elif height >= 480:
            quality = '480p'
        elif height >= 360:
            quality = '360p'
        elif height >= 240:
            quality = '240p'
        elif height >= 144:
            quality = '144p'
        elif ftype == 'audio':
            abr = f.get('abr', 0) or 0
            quality = f'{int(abr)}kbps' if abr else 'audio'
        else:
            quality = 'auto'

        key = f'{ftype}_{quality}_{ext}'
        if key in seen_qualities and quality != 'auto':
            continue
        seen_qualities.add(key)

        result.append({
            'format_id': f.get('format_id', 'best'),
            'quality': quality,
            'ext': ext,
            'filesize': f.get('filesize') or f.get('filesize_approx'),
            'vcodec': vcodec if vcodec != 'none' else None,
            'acodec': acodec if acodec != 'none' else None,
            'type': ftype,
            'height': height,
        })

    # Add auto option first
    result.insert(0, {
        'format_id': 'best[ext=mp4]/best',
        'quality': 'auto',
        'ext': 'mp4',
        'filesize': None,
        'vcodec': None,
        'acodec': None,
        'type': 'video',
        'height': 0,
    })

    # Sort by height descending within each type
    video_formats = sorted([f for f in result if f['type'] == 'video' and f['quality'] != 'auto'],
                           key=lambda x: x.get('height', 0), reverse=True)
    audio_formats = sorted([f for f in result if f['type'] == 'audio'],
                           key=lambda x: x.get('quality', ''), reverse=True)
    video_only = sorted([f for f in result if f['type'] == 'video_only'],
                        key=lambda x: x.get('height', 0), reverse=True)

    auto = [f for f in result if f['quality'] == 'auto']
    return auto + video_formats + audio_formats + video_only


def analyze_video(url: str) -> dict:
    platform = detect_platform(url)
    opts = get_ydl_opts_info(platform)

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)

    if not info:
        raise ValueError('Could not extract video information')

    formats = info.get('formats', [])
    normalized = normalize_formats(formats, platform)

    return {
        'title': info.get('title', 'Unknown Title'),
        'duration': info.get('duration', 0) or 0,
        'thumbnail': info.get('thumbnail', ''),
        'platform': platform,
        'uploader': info.get('uploader') or info.get('channel'),
        'view_count': info.get('view_count'),
        'formats': normalized,
    }


def get_download_url(url: str, format_id: str) -> str:
    opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'format': format_id,
    }

    # TikTok: remove watermark
    if 'tiktok.com' in url.lower():
        opts['http_headers'] = {
            'User-Agent': 'TikTok/26.2.0 (iPhone; iOS 14.4.2; Scale/3.00)',
        }

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)

    if not info:
        raise ValueError('Could not get download URL')

    # Get the direct URL for the requested format
    requested_url = None
    if 'url' in info:
        requested_url = info['url']
    elif 'formats' in info:
        for f in info['formats']:
            if f.get('format_id') == format_id and f.get('url'):
                requested_url = f['url']
                break
        if not requested_url:
            best = info['formats'][-1]
            requested_url = best.get('url', '')

    if not requested_url:
        raise ValueError('Could not extract download URL')

    return requested_url
