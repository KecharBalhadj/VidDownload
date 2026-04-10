from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.models import get_session, User, NewsletterSubscriber, Message, Ad
from utils.security import hash_password, check_password, is_valid_email, sanitize_plain, admin_required, get_client_ip
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)
newsletter_bp = Blueprint('newsletter', __name__)
contact_bp = Blueprint('contact', __name__)
ads_bp = Blueprint('ads', __name__)


# ─── AUTH ───────────────────────────────────────────
@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    try:
        session = get_session()
        user = session.query(User).filter_by(email=email, is_active=True).first()
        session.close()

        if not user or not check_password(password, user.password_hash):
            return jsonify({'error': 'Invalid credentials'}), 401

        token = create_access_token(
            identity=str(user.id),
            additional_claims={'role': user.role, 'username': user.username},
            expires_delta=timedelta(days=7)
        )
        return jsonify({
            'access_token': token,
            'user': {'id': user.id, 'username': user.username, 'role': user.role}
        }), 200
    except Exception as e:
        return jsonify({'error': 'Login failed'}), 500


@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = sanitize_plain(str(data.get('username') or '').strip())[:80]
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not username or not email or not password:
        return jsonify({'error': 'All fields required'}), 400

    if not is_valid_email(email):
        return jsonify({'error': 'Invalid email'}), 400

    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    try:
        session = get_session()
        existing = session.query(User).filter_by(email=email).first()
        if existing:
            session.close()
            return jsonify({'error': 'Email already registered'}), 409

        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role='user',
        )
        session.add(user)
        session.commit()
        user_id = user.id
        session.close()
        return jsonify({'success': True, 'id': user_id}), 201
    except Exception as e:
        return jsonify({'error': 'Registration failed'}), 500


@auth_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    try:
        session = get_session()
        user = session.query(User).filter_by(id=int(user_id)).first()
        session.close()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'id': user.id, 'username': user.username, 'role': user.role}), 200
    except Exception:
        return jsonify({'error': 'Server error'}), 500


# ─── NEWSLETTER ─────────────────────────────────────
@newsletter_bp.route('/api/newsletter/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    lang = (data.get('lang') or 'en').strip()[:10]

    if not email or not is_valid_email(email):
        return jsonify({'error': 'Valid email required'}), 400

    try:
        session = get_session()
        existing = session.query(NewsletterSubscriber).filter_by(email=email).first()
        if existing:
            if not existing.is_active:
                existing.is_active = True
                existing.lang = lang
                session.commit()
            session.close()
            return jsonify({'success': True, 'message': 'Already subscribed'}), 200

        sub = NewsletterSubscriber(email=email, lang=lang)
        session.add(sub)
        session.commit()
        session.close()
        return jsonify({'success': True}), 201
    except Exception:
        return jsonify({'error': 'Subscription failed'}), 500


@newsletter_bp.route('/api/newsletter/unsubscribe', methods=['POST'])
def unsubscribe():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    if not email:
        return jsonify({'error': 'Email required'}), 400
    try:
        session = get_session()
        sub = session.query(NewsletterSubscriber).filter_by(email=email).first()
        if sub:
            sub.is_active = False
            session.commit()
        session.close()
        return jsonify({'success': True}), 200
    except Exception:
        return jsonify({'error': 'Unsubscribe failed'}), 500


@newsletter_bp.route('/api/admin/newsletter', methods=['GET'])
@admin_required
def admin_list_subscribers():
    try:
        session = get_session()
        subs = session.query(NewsletterSubscriber).filter_by(is_active=True).all()
        result = [{'id': s.id, 'email': s.email, 'lang': s.lang, 'created_at': s.created_at.isoformat()} for s in subs]
        session.close()
        return jsonify({'subscribers': result, 'total': len(result)}), 200
    except Exception:
        return jsonify({'subscribers': []}), 200


# ─── CONTACT ────────────────────────────────────────
@contact_bp.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json(silent=True) or {}
    name = sanitize_plain(str(data.get('name') or '').strip())[:120]
    email = (data.get('email') or '').strip().lower()
    message = sanitize_plain(str(data.get('message') or '').strip())[:5000]

    if not name or not email or not message:
        return jsonify({'error': 'All fields required'}), 400

    if not is_valid_email(email):
        return jsonify({'error': 'Invalid email'}), 400

    try:
        session = get_session()
        msg = Message(name=name, email=email, message=message)
        session.add(msg)
        session.commit()
        session.close()
        return jsonify({'success': True}), 201
    except Exception:
        return jsonify({'error': 'Could not send message'}), 500


@contact_bp.route('/api/admin/messages', methods=['GET'])
@admin_required
def admin_messages():
    try:
        session = get_session()
        msgs = session.query(Message).order_by(Message.created_at.desc()).all()
        result = [{
            'id': m.id, 'name': m.name, 'email': m.email,
            'message': m.message, 'is_read': m.is_read,
            'created_at': m.created_at.isoformat()
        } for m in msgs]
        session.close()
        return jsonify({'messages': result}), 200
    except Exception:
        return jsonify({'messages': []}), 200


@contact_bp.route('/api/admin/messages/<int:msg_id>/read', methods=['PATCH'])
@admin_required
def mark_read(msg_id):
    try:
        session = get_session()
        msg = session.query(Message).filter_by(id=msg_id).first()
        if msg:
            msg.is_read = True
            session.commit()
        session.close()
        return jsonify({'success': True}), 200
    except Exception:
        return jsonify({'error': 'Failed'}), 500


# ─── ADS ─────────────────────────────────────────────
@ads_bp.route('/api/ads/<slot>', methods=['GET'])
def get_ad(slot):
    try:
        session = get_session()
        ad = session.query(Ad).filter_by(slot=slot, is_active=True).first()
        if not ad:
            session.close()
            return jsonify({'ad': None}), 200

        ad.impressions += 1
        session.commit()
        result = {'id': ad.id, 'html_code': ad.html_code, 'slot': ad.slot}
        session.close()
        return jsonify({'ad': result}), 200
    except Exception:
        return jsonify({'ad': None}), 200


@ads_bp.route('/api/admin/ads', methods=['GET'])
@admin_required
def admin_list_ads():
    try:
        session = get_session()
        ads = session.query(Ad).all()
        result = [{
            'id': a.id, 'name': a.name, 'slot': a.slot,
            'is_active': a.is_active, 'impressions': a.impressions, 'clicks': a.clicks
        } for a in ads]
        session.close()
        return jsonify({'ads': result}), 200
    except Exception:
        return jsonify({'ads': []}), 200


@ads_bp.route('/api/admin/ads', methods=['POST'])
@admin_required
def create_ad():
    data = request.get_json(silent=True) or {}
    try:
        session = get_session()
        ad = Ad(
            name=sanitize_plain(data.get('name', '')),
            slot=sanitize_plain(data.get('slot', '')),
            html_code=data.get('html_code', ''),
            is_active=data.get('is_active', True),
        )
        session.add(ad)
        session.commit()
        ad_id = ad.id
        session.close()
        return jsonify({'success': True, 'id': ad_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ads_bp.route('/api/admin/ads/<int:ad_id>', methods=['PUT'])
@admin_required
def update_ad(ad_id):
    data = request.get_json(silent=True) or {}
    try:
        session = get_session()
        ad = session.query(Ad).filter_by(id=ad_id).first()
        if not ad:
            session.close()
            return jsonify({'error': 'Not found'}), 404
        for field in ['name', 'slot', 'html_code', 'is_active']:
            if field in data:
                setattr(ad, field, data[field])
        session.commit()
        session.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ads_bp.route('/api/admin/ads/<int:ad_id>', methods=['DELETE'])
@admin_required
def delete_ad(ad_id):
    try:
        session = get_session()
        ad = session.query(Ad).filter_by(id=ad_id).first()
        if ad:
            session.delete(ad)
            session.commit()
        session.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
