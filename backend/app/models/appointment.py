from pydantic import BaseModel, Field
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

class Location(BaseModel):
    name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    place_id: Optional[str] = None
    google_maps_url: Optional[str] = None

class Participant(BaseModel):
    user_id: Optional[str] = None # Linked user if they have an account
    name: str
    email: str
    phone: Optional[str] = None
    status: str = "pending" # 'pending', 'accepted', 'declined', 'tentative'

class AppointmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime # MUST be UTC
    end_time: datetime # MUST be UTC
    timezone: str # E.g., 'America/New_York'
    location: Location
    participants: List[Participant] = []

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentInDB(AppointmentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    organizer_id: str
    status: str = "pending" # 'pending', 'confirmed', 'cancelled', 'completed'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AppointmentResponse(AppointmentBase):
    id: str = Field(alias="_id")
    organizer_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
