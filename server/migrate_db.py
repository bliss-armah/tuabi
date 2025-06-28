import sqlite3
from pathlib import Path

# Path to the SQLite database
DB_PATH = Path('./tuab_db.db')

def add_phone_number_column():
    """Add phone_number column to debtors table if it doesn't exist"""
    print("Starting database migration...")
    
    # Connect to the database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if the column exists
    cursor.execute("PRAGMA table_info(debtors)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'phone_number' not in columns:
        print("Adding phone_number column to debtors table...")
        cursor.execute("ALTER TABLE debtors ADD COLUMN phone_number TEXT")
        conn.commit()
        print("Column added successfully!")
    else:
        print("phone_number column already exists in debtors table.")
    
    # Close the connection
    conn.close()
    print("Migration completed.")

def add_is_subscribed_column():
    """Add is_subscribed column to users table if it doesn't exist"""
    print("Checking for 'is_subscribed' column in users...")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]

    if 'is_subscribed' not in columns:
        print("Adding 'is_subscribed' column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN is_subscribed BOOLEAN DEFAULT 0")
        conn.commit()
        print("Column added successfully!")
    else:
        print("'is_subscribed' column already exists.")

    conn.close()

if __name__ == "__main__":
    add_phone_number_column()
    add_is_subscribed_column()