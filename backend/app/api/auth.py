from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from app.models.user import UserCreate, UserInDB, UserResponse, LoginRequest, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.database import get_db
from passlib.context import CryptContext
from jose import jwt, JWTError
from bson import ObjectId

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    user["_id"] = str(user["_id"])
    return user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    db = get_db()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_in_db = UserInDB(**user.model_dump(exclude={"password"}))
    if user.password:
        user_in_db.hashed_password = get_password_hash(user.password)
        
    result = await db.users.insert_one(user_in_db.model_dump(by_alias=True))
    
    # Return user without password
    created_user = await db.users.find_one({"_id": result.inserted_id})
    # Convert ObjectId to string for response
    created_user["_id"] = str(created_user["_id"])
    return created_user

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    db = get_db()
    
    user = await db.users.find_one({"email": login_data.email})
    if not user or not user.get("hashed_password"):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/google")
async def google_login():
    # TODO: Implement Google OAuth URL generation
    return {"url": "https://accounts.google.com/o/oauth2/v2/auth?..."}

@router.get("/google/callback")
async def google_callback(code: str):
    # TODO: Exchange code for Google token and register/login user
    return {"message": "Google callback placeholder", "code": code}

@router.get("/github")
async def github_login():
    # TODO: Implement GitHub OAuth URL generation
    return {"url": "https://github.com/login/oauth/authorize?..."}

@router.get("/github/callback")
async def github_callback(code: str):
    # TODO: Exchange code for GitHub token and register/login user
    return {"message": "GitHub callback placeholder", "code": code}
