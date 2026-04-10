import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

from routes.video import video_bp
from routes.blog import blog_bp
from routes.misc import auth_bp, newsletter_bp, contact_bp, ads_bp
from models.models import init_db

app = Flask(__name__)

# ─── Config ────────────────────────────────────────
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change-this-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

# ─── Extensions ────────────────────────────────────
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:4321')
ADMIN_URL = os.getenv('ADMIN_URL', 'http://localhost:3000')

CORS(
    app,
    origins=[FRONTEND_URL, ADMIN_URL, 'http://localhost:4321', 'http://localhost:3000'],
    supports_credentials=True
)

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=['200 per day', '50 per hour'],
    storage_uri=os.getenv('REDIS_URL', 'memory://'),
)

# Apply stricter limits to download endpoints
limiter.limit('10 per minute')(video_bp)

jwt = JWTManager(app)

# ─── Blueprints ────────────────────────────────────
app.register_blueprint(video_bp)
app.register_blueprint(blog_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(newsletter_bp)
app.register_blueprint(contact_bp)
app.register_blueprint(ads_bp)

# ─── Health check ──────────────────────────────────
@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'VidGet API'}), 200

# ─── Error handlers ────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(429)
def rate_limit_exceeded(e):
    return jsonify({'error': 'Too many requests. Please slow down.'}), 429

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# ─── ✅ Database Init (مهم لـ Render) ─────────────────
try:
    init_db()
except Exception as e:
    print(f'DB init warning: {e}')

# ─── Startup (محلي فقط) ────────────────────────────
if __name__ == '__main__':
    debug = os.getenv('FLASK_DEBUG', '0') == '1'
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=debug)
