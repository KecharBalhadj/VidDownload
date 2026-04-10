from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime,
    ForeignKey, BigInteger, create_engine
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import os

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default='user')  # user | admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Download(Base):
    __tablename__ = 'downloads'
    id = Column(Integer, primary_key=True)
    browser_id = Column(String(100), nullable=False, index=True)
    ip_address = Column(String(45))
    url = Column(Text, nullable=False)
    platform = Column(String(50))
    format_id = Column(String(50))
    quality = Column(String(20))
    title = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Like(Base):
    __tablename__ = 'likes'
    id = Column(Integer, primary_key=True)
    post_id = Column(String(50), nullable=False, index=True)
    browser_id = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Log(Base):
    __tablename__ = 'logs'
    id = Column(Integer, primary_key=True)
    level = Column(String(10), default='INFO')
    message = Column(Text)
    ip_address = Column(String(45))
    path = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)


class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Ad(Base):
    __tablename__ = 'ads'
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    slot = Column(String(80), nullable=False)
    html_code = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    impressions = Column(BigInteger, default=0)
    clicks = Column(BigInteger, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Post(Base):
    __tablename__ = 'posts'
    id = Column(Integer, primary_key=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    title_en = Column(String(255), nullable=False)
    title_ar = Column(String(255))
    content_en = Column(Text, nullable=False)
    content_ar = Column(Text)
    excerpt_en = Column(Text)
    excerpt_ar = Column(Text)
    category = Column(String(80), default='General')
    read_time = Column(String(20), default='3 min')
    is_published = Column(Boolean, default=True)
    likes_count = Column(Integer, default=0)
    author_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship('User', backref='posts')
    comments = relationship('Comment', backref='post', cascade='all, delete-orphan')


class Comment(Base):
    __tablename__ = 'comments'
    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    name = Column(String(120), nullable=False)
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class NewsletterSubscriber(Base):
    __tablename__ = 'newsletter_subscribers'
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    lang = Column(String(10), default='en')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_engine():
    db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/vidget')
    return create_engine(db_url, pool_pre_ping=True, pool_recycle=300)


def get_session():
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    return Session()


def init_db():
    engine = get_engine()
    Base.metadata.create_all(engine)
    print("Database tables created.")
