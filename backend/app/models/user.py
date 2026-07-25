from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    time_zone: Optional[str] = "UTC"
    profile_picture: Optional[str] = None
    account_provider: str = "email" # 'email', 'google', 'github'
    
    # Notification preferences
    email_notifications: bool = True
    sms_notifications: bool = False
    in_app_notifications: bool = True

class UserCreate(UserBase):
    password: Optional[str] = None

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    
    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
