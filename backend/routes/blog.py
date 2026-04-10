from flask import Blueprint, request, jsonify
from models.models import get_session, Post, Comment
from utils.security import sanitize_plain, sanitize_html, admin_required

blog_bp = Blueprint('blog', __name__)


@blog_bp.route('/api/blog', methods=['GET'])
def list_posts():
    lang = request.args.get('lang', 'en')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    try:
        session = get_session()
        query = session.query(Post).filter_by(is_published=True)
        total = query.count()
        posts = query.order_by(Post.created_at.desc()) \
                     .offset((page - 1) * per_page) \
                     .limit(per_page).all()

        result = []
        for p in posts:
            result.append({
                'id': p.id,
                'slug': p.slug,
                'title': p.title_ar if lang == 'ar' and p.title_ar else p.title_en,
                'excerpt': p.excerpt_ar if lang == 'ar' and p.excerpt_ar else p.excerpt_en,
                'category': p.category,
                'read_time': p.read_time,
                'likes_count': p.likes_count,
                'created_at': p.created_at.isoformat() if p.created_at else None,
            })

        session.close()
        return jsonify({'posts': result, 'total': total, 'page': page}), 200
    except Exception as e:
        return jsonify({'posts': [], 'total': 0}), 200


@blog_bp.route('/api/blog/<slug>', methods=['GET'])
def get_post(slug):
    lang = request.args.get('lang', 'en')
    try:
        session = get_session()
        post = session.query(Post).filter_by(slug=slug, is_published=True).first()
        if not post:
            session.close()
            return jsonify({'error': 'Post not found'}), 404

        comments = session.query(Comment).filter_by(
            post_id=post.id, is_approved=True
        ).order_by(Comment.created_at.desc()).all()

        result = {
            'id': post.id,
            'slug': post.slug,
            'title': post.title_ar if lang == 'ar' and post.title_ar else post.title_en,
            'content': post.content_ar if lang == 'ar' and post.content_ar else post.content_en,
            'excerpt': post.excerpt_ar if lang == 'ar' and post.excerpt_ar else post.excerpt_en,
            'category': post.category,
            'read_time': post.read_time,
            'likes_count': post.likes_count,
            'created_at': post.created_at.isoformat() if post.created_at else None,
            'comments': [{
                'id': c.id,
                'name': c.name,
                'content': c.content,
                'created_at': c.created_at.isoformat() if c.created_at else None,
            } for c in comments],
        }
        session.close()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500


@blog_bp.route('/api/blog/<slug>/comment', methods=['POST'])
def add_comment(slug):
    data = request.get_json(silent=True) or {}
    name = sanitize_plain(str(data.get('name') or '').strip())[:120]
    content = sanitize_plain(str(data.get('content') or '').strip())[:2000]

    if not name or not content:
        return jsonify({'error': 'Name and content are required'}), 400

    try:
        session = get_session()
        post = session.query(Post).filter_by(slug=slug, is_published=True).first()
        if not post:
            session.close()
            return jsonify({'error': 'Post not found'}), 404

        comment = Comment(post_id=post.id, name=name, content=content)
        session.add(comment)
        session.commit()
        session.close()
        return jsonify({'success': True}), 201
    except Exception:
        return jsonify({'error': 'Could not save comment'}), 500


# Admin: Create post
@blog_bp.route('/api/admin/posts', methods=['POST'])
@admin_required
def create_post():
    data = request.get_json(silent=True) or {}
    try:
        session = get_session()
        post = Post(
            slug=sanitize_plain(data.get('slug', '')),
            title_en=sanitize_plain(data.get('title_en', '')),
            title_ar=sanitize_plain(data.get('title_ar', '')),
            content_en=sanitize_html(data.get('content_en', '')),
            content_ar=sanitize_html(data.get('content_ar', '')),
            excerpt_en=sanitize_plain(data.get('excerpt_en', '')),
            excerpt_ar=sanitize_plain(data.get('excerpt_ar', '')),
            category=sanitize_plain(data.get('category', 'General')),
            read_time=sanitize_plain(data.get('read_time', '3 min')),
            is_published=data.get('is_published', True),
        )
        session.add(post)
        session.commit()
        post_id = post.id
        session.close()
        return jsonify({'success': True, 'id': post_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@blog_bp.route('/api/admin/posts', methods=['GET'])
@admin_required
def admin_list_posts():
    try:
        session = get_session()
        posts = session.query(Post).order_by(Post.created_at.desc()).all()
        result = [{
            'id': p.id, 'slug': p.slug, 'title_en': p.title_en,
            'category': p.category, 'is_published': p.is_published,
            'likes_count': p.likes_count,
            'created_at': p.created_at.isoformat() if p.created_at else None,
        } for p in posts]
        session.close()
        return jsonify({'posts': result}), 200
    except Exception:
        return jsonify({'posts': []}), 200


@blog_bp.route('/api/admin/posts/<int:post_id>', methods=['PUT'])
@admin_required
def update_post(post_id):
    data = request.get_json(silent=True) or {}
    try:
        session = get_session()
        post = session.query(Post).filter_by(id=post_id).first()
        if not post:
            session.close()
            return jsonify({'error': 'Not found'}), 404
        for field in ['title_en', 'title_ar', 'content_en', 'content_ar', 'excerpt_en', 'excerpt_ar', 'category', 'read_time', 'is_published']:
            if field in data:
                setattr(post, field, data[field])
        session.commit()
        session.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@blog_bp.route('/api/admin/posts/<int:post_id>', methods=['DELETE'])
@admin_required
def delete_post(post_id):
    try:
        session = get_session()
        post = session.query(Post).filter_by(id=post_id).first()
        if post:
            session.delete(post)
            session.commit()
        session.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
