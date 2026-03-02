from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import verify_password, create_access_token, hash_password


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

    if not verify_password(password, user.password):
        return None

    token_data = {
        "user_id": user.id,
        "role": user.role.value  # Convert enum to string
    }

    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,  # Return role as string: "nurse", "doctor", or "admin"
        "full_name": user.full_name,
        "user_id": user.id
    }

# Create user with role validation
def create_user(db: Session, full_name: str, email: str, password: str, role: str):
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
    
    hashed_password = hash_password(password)
    user = User(
        full_name=full_name,
        email=email,
        password=hashed_password,
        role=user_role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: int):
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_users_by_role(db: Session, role: str):
    """Get all users by a specific role"""
    try:
        user_role = UserRole(role.lower())
    except ValueError:
        return []
    
    return db.query(User).filter(User.role == user_role).all()


def update_user_role(db: Session, user_id: int, new_role: str):
    """Update a user's role"""
    try:
        user_role = UserRole(new_role.lower())
    except ValueError:
        raise ValueError(f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    user.role = user_role
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

