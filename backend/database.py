"""
SQLite3 Database Module
Tables: users, leads
Seeds default admin on first run.
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "smartquotehub.db")


def get_db():
    """Get a database connection with row_factory for dict-like access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Create tables if they don't exist and seed the default admin."""
    conn = get_db()
    cursor = conn.cursor()

    # ── Users table ──────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'staff' CHECK(role IN ('admin', 'staff')),
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # ── Leads table ──────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            zip_code TEXT NOT NULL,
            date_of_birth TEXT,
            service_type TEXT NOT NULL,
            current_provider TEXT,
            household_size TEXT,
            annual_income_range TEXT,
            consent INTEGER NOT NULL DEFAULT 0,
            trusted_form_cert_url TEXT,
            trusted_form_retained INTEGER NOT NULL DEFAULT 0,
            trusted_form_cert_id TEXT DEFAULT '',
            status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'qualified', 'closed')),
            notes TEXT DEFAULT '',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # Check for missing columns in existing DB
    cursor.execute("PRAGMA table_info(leads)")
    existing_cols = [row[1] for row in cursor.fetchall()]
    if "trusted_form_retained" not in existing_cols:
        cursor.execute("ALTER TABLE leads ADD COLUMN trusted_form_retained INTEGER NOT NULL DEFAULT 0")
    if "trusted_form_cert_id" not in existing_cols:
        cursor.execute("ALTER TABLE leads ADD COLUMN trusted_form_cert_id TEXT DEFAULT ''")

    # ── Seed default admin ───────────────────────────
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
    if cursor.fetchone()[0] == 0:
        from auth import hash_password
        cursor.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
            ("admin", hash_password("admin123"), "admin"),
        )
        print("[DB] Default admin user created (admin / admin123)")

    conn.commit()
    conn.close()
    print(f"[DB] Database initialized at {DB_PATH}")


# ── Lead CRUD ────────────────────────────────────────

def create_lead(data: dict) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO leads (
            first_name, last_name, email, phone, zip_code, date_of_birth,
            service_type, current_provider, household_size, annual_income_range,
            consent, trusted_form_cert_url, trusted_form_retained, trusted_form_cert_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["first_name"], data["last_name"], data["email"], data["phone"],
        data["zip_code"], data.get("date_of_birth", ""),
        data["service_type"], data.get("current_provider", ""),
        data.get("household_size", ""), data.get("annual_income_range", ""),
        1 if data.get("consent") else 0,
        data.get("trusted_form_cert_url", ""),
        1 if data.get("trusted_form_retained") else 0,
        data.get("trusted_form_cert_id", ""),
    ))
    lead_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return lead_id


def get_leads(search: str = "", status: str = "", page: int = 1, per_page: int = 20):
    conn = get_db()
    cursor = conn.cursor()

    conditions = []
    params = []

    if search:
        conditions.append(
            "(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)"
        )
        s = f"%{search}%"
        params.extend([s, s, s, s])

    if status and status != "all":
        conditions.append("status = ?")
        params.append(status)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    # Count total
    cursor.execute(f"SELECT COUNT(*) FROM leads {where}", params)
    total = cursor.fetchone()[0]

    # Fetch page
    offset = (page - 1) * per_page
    cursor.execute(
        f"SELECT * FROM leads {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [per_page, offset],
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "leads": rows,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }


def get_lead_by_id(lead_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_lead(lead_id: int, data: dict):
    conn = get_db()
    cursor = conn.cursor()
    fields = []
    params = []
    for key in ["status", "notes", "first_name", "last_name", "email", "phone",
                 "zip_code", "service_type"]:
        if key in data:
            fields.append(f"{key} = ?")
            params.append(data[key])

    if not fields:
        conn.close()
        return False

    params.append(lead_id)
    cursor.execute(f"UPDATE leads SET {', '.join(fields)} WHERE id = ?", params)
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated


def delete_lead(lead_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


# ── User CRUD ────────────────────────────────────────

def get_user_by_username(username: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_staff():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def create_user(username: str, password_hash: str, role: str = "staff") -> int:
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
            (username, password_hash, role),
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        return -1


def delete_user(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    # Don't allow deleting the last admin
    cursor.execute("SELECT role FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    if row and row["role"] == "admin":
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        if cursor.fetchone()[0] <= 1:
            conn.close()
            return False
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted
