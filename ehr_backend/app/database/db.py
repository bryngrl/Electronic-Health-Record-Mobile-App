from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from fastapi import Depends

# This is the database credentials
# need palitan 'to na need match din sa web db natin para on sync sila :)
# For now yung phpMyAdmin nalang muna gamitin
DATABASE_URL = "mysql+pymysql://root@localhost:3306/ehr_db"


def _ensure_mysql_database(url: str):
    try:
        from sqlalchemy.engine.url import make_url
        import pymysql
    except Exception:
        return

    try:
        parsed = make_url(url)
        db_name = parsed.database
        if not db_name:
            return

        # connect to MySQL server without specifying a database
        host = parsed.host or "localhost"
        port = parsed.port or 3306
        user = parsed.username or "root"
        password = parsed.password or ""

        conn = pymysql.connect(host=host, user=user, password=password, port=port)
        try:
            with conn.cursor() as cur:
                cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            conn.commit()
        finally:
            conn.close()
    except Exception:
        # best-effort: don't prevent app from starting if DB creation fails
        return


# Ensure MySQL database exists (no-op for other backends)
if DATABASE_URL.startswith("mysql+pymysql://"):
    _ensure_mysql_database(DATABASE_URL)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# for safe access sa db
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()