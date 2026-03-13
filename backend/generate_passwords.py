#!/usr/bin/env python3
"""
Fixed password hash generator — works with Python 3.14 + modern bcrypt.
Uses bcrypt directly instead of passlib to avoid compatibility issues.

Usage:
  pip install bcrypt
  python generate_passwords.py
"""
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

print("=" * 55)
print("  Password Hash Generator")
print("=" * 55)

your_password = input("Enter YOUR password: ")
her_password  = input("Enter HER password:  ")

print("\n── Copy these into main.py ALLOWED_USERS ──\n")
print(f"Your hash:  {hash_password(your_password)}")
print(f"Her hash:   {hash_password(her_password)}")
print("\nDone! ✅")