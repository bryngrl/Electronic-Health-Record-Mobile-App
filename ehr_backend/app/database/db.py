from sqlalchemy import create_engine
from sqlalchemy import inspect, text
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


def _sync_users_table_schema():
    """
    Best-effort bootstrap for legacy `users` tables.
    `create_all()` will not alter existing tables, so align old schemas here.
    """
    try:
        inspector = inspect(engine)
        if "users" not in inspector.get_table_names():
            return

        existing_columns = {column["name"] for column in inspector.get_columns("users")}
        alter_statements = []

        if "full_name" not in existing_columns:
            alter_statements.append("ADD COLUMN full_name VARCHAR(150) NULL AFTER id")
        if "username" not in existing_columns:
            alter_statements.append("ADD COLUMN username VARCHAR(100) NULL AFTER email")
        if "birthday" not in existing_columns:
            alter_statements.append("ADD COLUMN birthday DATE NULL AFTER password")
        if "age" not in existing_columns:
            alter_statements.append("ADD COLUMN age INT NULL AFTER birthday")
        if "sex" not in existing_columns:
            alter_statements.append("ADD COLUMN sex VARCHAR(20) NULL AFTER age")
        if "address" not in existing_columns:
            alter_statements.append("ADD COLUMN address TEXT NULL AFTER sex")
        if "birth_place" not in existing_columns:
            alter_statements.append("ADD COLUMN birth_place VARCHAR(255) NULL AFTER address")
        if "is_active" not in existing_columns:
            alter_statements.append("ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER role")
        if "created_at" not in existing_columns:
            alter_statements.append("ADD COLUMN created_at DATETIME NULL AFTER is_active")

        with engine.begin() as connection:
            if alter_statements:
                connection.execute(text(f"ALTER TABLE users {', '.join(alter_statements)}"))

            connection.execute(text("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'nurse'"))
            connection.execute(text("UPDATE users SET role = LOWER(role) WHERE role IS NOT NULL"))

            refreshed_columns = {
                column["name"] for column in inspect(connection).get_columns("users")
            }

            if "full_name" in refreshed_columns and "username" in refreshed_columns:
                connection.execute(
                    text(
                        "UPDATE users "
                        "SET full_name = COALESCE(NULLIF(full_name, ''), username) "
                        "WHERE full_name IS NULL OR full_name = ''"
                    )
                )

            if "is_active" in refreshed_columns:
                connection.execute(
                    text("UPDATE users SET is_active = TRUE WHERE is_active IS NULL")
                )

            if "created_at" in refreshed_columns:
                connection.execute(
                    text("UPDATE users SET created_at = NOW() WHERE created_at IS NULL")
                )
                connection.execute(
                    text("ALTER TABLE users MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")
                )

            if "username" in refreshed_columns:
                # Fill missing usernames and deduplicate existing values.
                rows = connection.execute(
                    text("SELECT id, email, username FROM users ORDER BY id")
                ).mappings().all()

                used_usernames = set()

                for row in rows:
                    user_id = row["id"]
                    existing_username = (row["username"] or "").strip().lower()
                    email = (row["email"] or "").strip().lower()

                    if existing_username:
                        base_username = existing_username
                    else:
                        base_username = email.split("@", 1)[0] if "@" in email else email

                    if not base_username:
                        base_username = f"user{user_id}"

                    base_username = "_".join(base_username.split())
                    candidate = base_username
                    suffix = 1

                    while not candidate or candidate in used_usernames:
                        suffix += 1
                        candidate = f"{base_username}{suffix}"

                    used_usernames.add(candidate)

                    if existing_username != candidate:
                        connection.execute(
                            text("UPDATE users SET username = :username WHERE id = :user_id"),
                            {"username": candidate, "user_id": user_id},
                        )

                indexes = {
                    idx.get("name") for idx in inspect(connection).get_indexes("users")
                }
                if "ix_users_username" not in indexes:
                    connection.execute(
                        text("CREATE UNIQUE INDEX ix_users_username ON users (username)")
                    )

                connection.execute(
                    text("ALTER TABLE users MODIFY COLUMN username VARCHAR(100) NOT NULL")
                )
    except Exception:
        # best-effort: don't prevent app from starting if schema sync fails
        return


_sync_users_table_schema()

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
