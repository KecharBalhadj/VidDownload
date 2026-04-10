from flask import Blueprint, request, jsonify
from utils.video import analyze_video, get_download_url, is_valid_url, is_supported_url
from utils.security import get_client_ip
from models.models import get_session, Download, Like
import os

video_bp = Blueprint('video', __name__)


@video_bp.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json(silent=True) or {}
    url = (data.get('url') or '').strip()

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    if not is_valid_url(url):
        return jsonify({'error': 'Invalid URL format'}), 400

    if not is_supported_url(url):
        return jsonify({'error': 'Platform not supported'}), 422

    try:
        info = analyze_video(url)
        return jsonify(info), 200
    except Exception as e:
        err_msg = str(e)
        if 'rate' in err_msg.lower() or '429' in err_msg:
            return jsonify({'error': 'Rate limited by platform. Please try again later.'}), 429
        if 'private' in err_msg.lower() or 'login' in err_msg.lower():
            return jsonify({'error': 'This video is private or requires login.'}), 403
        return jsonify({'error': 'Could not fetch video info. Please check the URL.'}), 500


@video_bp.route('/api/download', methods=['POST'])
def download():
    data = request.get_json(silent=True) or {}
    url = (data.get('url') or '').strip()
    format_id = (data.get('format_id') or 'best').strip()
    browser_id = (data.get('browser_id') or '').strip()

    if not url or not is_valid_url(url):
        return jsonify({'error': 'Invalid URL'}), 400

    if not is_supported_url(url):
        return jsonify({'error': 'Platform not supported'}), 422

    try:
        download_url = get_download_url(url, format_id)

        # Log the download
        try:
            session = get_session()
            dl = Download(
                browser_id=browser_id or 'anonymous',
                ip_address=get_client_ip(),
                url=url,
                format_id=format_id,
            )
            session.add(dl)
            session.commit()
            session.close()
        except Exception:
            pass  # Don't fail on logging error

        return jsonify({'download_url': download_url}), 200
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500


@video_bp.route('/api/like', methods=['POST'])
def like_post():
    data = request.get_json(silent=True) or {}
    post_id = str(data.get('post_id') or '').strip()
    browser_id = str(data.get('browser_id') or '').strip()

    if not post_id or not browser_id:
        return jsonify({'error': 'post_id and browser_id are required'}), 400

    try:
        session = get_session()

        # Check if already liked
        existing = session.query(Like).filter_by(
            post_id=post_id, browser_id=browser_id
        ).first()

        if existing:
            count = session.query(Like).filter_by(post_id=post_id).count()
            session.close()
            return jsonify({'likes': count, 'already_liked': True}), 200

        # Add like
        like = Like(post_id=post_id, browser_id=browser_id)
        session.add(like)
        session.commit()
        count = session.query(Like).filter_by(post_id=post_id).count()
        session.close()
        return jsonify({'likes': count, 'already_liked': False}), 200
    except Exception as e:
        return jsonify({'error': 'Like failed'}), 500


@video_bp.route('/api/likes/<post_id>', methods=['GET'])
def get_likes(post_id):
    try:
        session = get_session()
        count = session.query(Like).filter_by(post_id=post_id).count()
        session.close()
        return jsonify({'likes': count}), 200
    except Exception:
        return jsonify({'likes': 0}), 200
