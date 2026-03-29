from datetime import date as date_type
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import verify_password, create_access_token, hash_password


def _normalize_role_value(role: str | UserRole) -> str:
    if isinstance(role, UserRole):
        return role.value
    return str(role).strip().lower()


def _build_username(db: Session, email: str, full_name: str) -> str:
    base_username = email.split("@", 1)[0].strip() or full_name.strip().lower().replace(" ", "_")
    username = base_username
    suffix = 1

    while db.query(User).filter(User.username == username).first():
        suffix += 1
        username = f"{base_username}{suffix}"

    return username


# Logic checker for login - returns user data with role for frontend redirection
def authenticate_user(db: Session, email: str, password: str):
    """
    Authenticate user and return access token with role information.
    Frontend uses the role to redirect to appropriate dashboard.
    """
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not user.is_active:
        return None

    # Debug: log stored hash and verification attempt (temporary)
    try:
        print(f"DEBUG: Stored hashed password for {email}: {user.password}")
        ok = verify_password(password, user.password)
        print(f"DEBUG: verify_password result for {email}: {ok}")
    except Exception as e:
        print(f"DEBUG: password verify error for {email}: {e}")
        ok = False

    if not ok:
        return None

    normalized_role = _normalize_role_value(user.role)
    full_name = user.full_name or user.username

    token_data = {
        "user_id": user.id,
        "role": normalized_role
    }

    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": normalized_role,
        "full_name": full_name,
        "user_id": user.id
    }

# Create user with role validation
def create_user(db: Session, full_name: str, email: str, password: str, role: str,
                username: str = None, birthday: str = None, age: int = None,
                sex: str = None, address: str = None, birth_place: str = None):
    """
    Create a new user with one of three roles: nurse, doctor, or admin.
    Validates that role is one of the allowed types.
    """
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return None  # User already exists

    # Validate role is one of the allowed types
    try:
        user_role = UserRole(role.lower())
    except ValueError:
        raise ValueError(f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}")

    # Validate and assign username
    if username and username.strip():
        username = username.strip()
        if db.query(User).filter(User.username == username).first():
            raise ValueError("Username is already taken")
    else:
        username = _build_username(db, email, full_name)

    hashed_password = hash_password(password)

    parsed_birthday = None
    if birthday:
        try:
            parsed_birthday = date_type.fromisoformat(birthday)
        except ValueError:
            pass

    user = User(
        full_name=full_name,
        email=email,
        password=hashed_password,
        username=username,
        role=user_role,
        birthday=parsed_birthday,
        age=age,
        sex=sex,
        address=address,
        birth_place=birth_place,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: int):
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session):
    """Get all user accounts for admin views."""
    return db.query(User).order_by(User.id.asc()).all()


def get_users_by_role(db: Session, role: str):
    """Get all users by a specific role"""
    try:
        user_role = UserRole(role.lower())
    except ValueError:
        return []
    
    return db.query(User).filter(User.role == user_role.value).all()


def update_user_role(db: Session, user_id: int, new_role: str):
    """Update a user's role"""
    try:
        user_role = UserRole(new_role.lower())
    except ValueError:
        raise ValueError(f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    user.role = user_role.value
    db.commit()
    db.refresh(user)
    return user


def update_user_info(db: Session, user_id: int, update_data):
    """Update user profile information (all fields except password)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    # Update fields if provided
    if update_data.full_name is not None:
        user.full_name = update_data.full_name.strip()
    
    if update_data.email is not None:
        # Check if email is already taken by another user
        existing = db.query(User).filter(User.email == update_data.email, User.id != user_id).first()
        if existing:
            raise ValueError("Email is already in use")
        user.email = update_data.email.strip()
    
    if update_data.username is not None:
        username = update_data.username.strip()
        # Check if username is already taken by another user
        existing = db.query(User).filter(User.username == username, User.id != user_id).first()
        if existing:
            raise ValueError("Username is already taken")
        user.username = username
    
    if update_data.age is not None:
        user.age = update_data.age
    
    if update_data.sex is not None:
        user.sex = update_data.sex.strip()
    
    if update_data.address is not None:
        user.address = update_data.address.strip()
    
    if update_data.birth_place is not None:
        user.birth_place = update_data.birth_place.strip()
    
    if update_data.birthday is not None:
        try:
            parsed_birthday = date_type.fromisoformat(update_data.birthday)
            user.birthday = parsed_birthday
        except ValueError:
            raise ValueError("Invalid birthday format. Use YYYY-MM-DD")
    
    db.commit()
    db.refresh(user)
    return user


def deactivate_user(db: Session, user_id: int):
    """Deactivate a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def activate_user(db: Session, user_id: int):
    """Activate a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user

