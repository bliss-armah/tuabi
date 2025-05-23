import sqlite3
from pathlib import Path

# Path to the SQLite database
DB_PATH = Path('./blog.db')

def fix_amount_owed_column():
    """Fix NULL values in amount_owed column by setting them to 0.0"""
    print("Starting database fix...")
    
    # Connect to the database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check for NULL values in amount_owed
    cursor.execute("SELECT COUNT(*) FROM debtors WHERE amount_owed IS NULL")
    null_count = cursor.fetchone()[0]
    
    if null_count > 0:
        print(f"Found {null_count} records with NULL amount_owed values. Fixing...")
        cursor.execute("UPDATE debtors SET amount_owed = 0.0 WHERE amount_owed IS NULL")
        conn.commit()
        print(f"Fixed {null_count} records. amount_owed is now set to 0.0 for these records.")
    else:
        print("No NULL values found in amount_owed column.")
    
    # Close the connection
    conn.close()
    print("Fix completed.")

if __name__ == "__main__":
    fix_amount_owed_column()
