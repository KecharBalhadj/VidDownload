#!/usr/bin/env python3
"""Run this script once to create the first admin user."""
import os
from dotenv import load_dotenv
load_dotenv()

from models.models import init_db, get_session, User
from utils.security import hash_password

def create_admin():
    print("=== VidGet Admin Setup ===\n")
    init_db()

    username = input("Admin username: ").strip()
    email = input("Admin email: ").strip().lower()
    password = input("Admin password (min 8 chars): ").strip()

    if not username or not email or len(password) < 8:
        print("Invalid input. Username, email, and password (8+ chars) required.")
        return

    session = get_session()
    existing = session.query(User).filter_by(email=email).first()
    if existing:
        print(f"User with email {email} already exists.")
        session.close()
        return

    admin = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role='admin',
        is_active=True,
    )
    session.add(admin)
    session.commit()
    print(f"\n✅ Admin user '{username}' created successfully!")
    print(f"   Login at: https://admin.vidget.app/login")
    session.close()

if __name__ == '__main__':
    create_admin()
