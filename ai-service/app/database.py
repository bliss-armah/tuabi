import asyncpg
import os
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.pool = None
        
    async def init_db(self):
        """Initialize database connection pool"""
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is required")
            
        try:
            self.pool = await asyncpg.create_pool(database_url)
            logger.info("Database connection pool created successfully")
        except Exception as e:
            logger.error(f"Failed to create database pool: {e}")
            raise
    
    async def close(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            
    async def fetch_user_debtors_data(self, user_id: int) -> List[Dict[str, Any]]:
        """Fetch comprehensive debtor data for ML analysis"""
        query = """
        SELECT 
            d.id,
            d.name,
            d.amount_owed as "amountOwed",
            d.phone_number as "phoneNumber",
            d.created_at as "createdAt",
            d.updated_at as "updatedAt",
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', dh.id,
                        'amountChanged', dh.amount_changed,
                        'action', dh.action,
                        'timestamp', dh.timestamp,
                        'note', dh.note
                    ) ORDER BY dh.timestamp DESC
                ) FILTER (WHERE dh.id IS NOT NULL), 
                '[]'
            ) as history
        FROM debtors d
        LEFT JOIN debt_history dh ON d.id = dh.debtor_id
        WHERE d.user_id = $1
        GROUP BY d.id, d.name, d.amount_owed, d.phone_number, d.created_at, d.updated_at
        ORDER BY d.created_at DESC
        """
        
        async with self.pool.acquire() as connection:
            rows = await connection.fetch(query, user_id)
            return [dict(row) for row in rows]
    
    async def fetch_all_debtors_for_training(self) -> List[Dict[str, Any]]:
        """Fetch anonymized data for model training"""
        query = """
        SELECT 
            d.id,
            d.amount_owed as "amountOwed",
            d.created_at as "createdAt",
            d.updated_at as "updatedAt",
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - d.created_at))/86400 as days_since_creation,
            COUNT(dh.id) as payment_count,
            COALESCE(SUM(CASE WHEN dh.action = 'reduce' THEN dh.amount_changed ELSE 0 END), 0) as total_paid,
            COALESCE(SUM(CASE WHEN dh.action = 'add' THEN dh.amount_changed ELSE 0 END), 0) as total_added,
            COALESCE(AVG(CASE WHEN dh.action = 'reduce' THEN dh.amount_changed END), 0) as avg_payment,
            COALESCE(
                EXTRACT(EPOCH FROM (MAX(dh.timestamp) - MIN(dh.timestamp)))/86400,
                0
            ) as payment_span_days,
            CASE 
                WHEN d.amount_owed = 0 THEN 'settled'
                WHEN d.amount_owed > 0 THEN 'active'
                ELSE 'unknown'
            END as status
        FROM debtors d
        LEFT JOIN debt_history dh ON d.id = dh.debtor_id
        WHERE d.created_at >= CURRENT_TIMESTAMP - INTERVAL '2 years'
        GROUP BY d.id, d.amount_owed, d.created_at, d.updated_at
        HAVING COUNT(dh.id) > 0
        ORDER BY d.created_at DESC
        """
        
        async with self.pool.acquire() as connection:
            rows = await connection.fetch(query)
            return [dict(row) for row in rows]
    
    async def fetch_payment_patterns(self, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Fetch payment patterns for analysis"""
        where_clause = "WHERE d.user_id = $1" if user_id else ""
        params = [user_id] if user_id else []
        
        query = f"""
        SELECT 
            dh.debtor_id,
            dh.amount_changed,
            dh.action,
            dh.timestamp,
            d.amount_owed as current_amount,
            EXTRACT(DOW FROM dh.timestamp) as day_of_week,
            EXTRACT(HOUR FROM dh.timestamp) as hour_of_day,
            LAG(dh.timestamp) OVER (
                PARTITION BY dh.debtor_id 
                ORDER BY dh.timestamp
            ) as previous_payment_time
        FROM debt_history dh
        JOIN debtors d ON dh.debtor_id = d.id
        {where_clause}
        ORDER BY dh.timestamp DESC
        """
        
        async with self.pool.acquire() as connection:
            rows = await connection.fetch(query, *params)
            return [dict(row) for row in rows]

# Global database instance
db = Database()

async def init_db():
    """Initialize database connection"""
    await db.init_db()

async def close_db():
    """Close database connection"""
    await db.close() 