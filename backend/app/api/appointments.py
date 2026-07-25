from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.models.appointment import AppointmentCreate, AppointmentInDB, AppointmentResponse
from app.api.auth import get_current_user
from app.database import get_db
from bson import ObjectId
from typing import List, Optional
from datetime import datetime, timezone

router = APIRouter()

@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(appointment: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    # Ensure times are stored as UTC
    if appointment.start_time.tzinfo is None:
        appointment.start_time = appointment.start_time.replace(tzinfo=timezone.utc)
    if appointment.end_time.tzinfo is None:
        appointment.end_time = appointment.end_time.replace(tzinfo=timezone.utc)
        
    app_in_db = AppointmentInDB(
        **appointment.model_dump(),
        organizer_id=str(current_user["_id"])
    )
    
    result = await db.appointments.insert_one(app_in_db.model_dump(by_alias=True))
    
    created_app = await db.appointments.find_one({"_id": result.inserted_id})
    created_app["_id"] = str(created_app["_id"])
    
    # TODO: Trigger background tasks for invitations (Email, SMS)
    
    return created_app

@router.get("/", response_model=List[AppointmentResponse])
async def get_appointments(
    start_date: Optional[datetime] = Query(None, description="Start date (UTC) for filtering"),
    end_date: Optional[datetime] = Query(None, description="End date (UTC) for filtering"),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user_id = str(current_user["_id"])
    
    # Query for appointments where the user is either the organizer OR a participant
    query = {
        "$or": [
            {"organizer_id": user_id},
            {"participants.email": current_user["email"]} # Also check by email to catch invites to their email before they registered
        ]
    }
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query["$gte"] = start_date
        if end_date:
            date_query["$lte"] = end_date
        query["start_time"] = date_query
        
    cursor = db.appointments.find(query)
    appointments = await cursor.to_list(length=100)
    
    for app in appointments:
        app["_id"] = str(app["_id"])
        
    return appointments

@router.get("/{id}", response_model=AppointmentResponse)
async def get_appointment(id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid appointment ID")
        
    app = await db.appointments.find_one({"_id": ObjectId(id)})
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Authorization check
    is_organizer = app.get("organizer_id") == str(current_user["_id"])
    is_participant = any(p.get("email") == current_user["email"] for p in app.get("participants", []))
    
    if not (is_organizer or is_participant):
        raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
        
    app["_id"] = str(app["_id"])
    return app

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid appointment ID")
        
    app = await db.appointments.find_one({"_id": ObjectId(id)})
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Only organizer can delete
    if app.get("organizer_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Only the organizer can delete this appointment")
        
    await db.appointments.delete_one({"_id": ObjectId(id)})
    return None

@router.post("/{id}/rsvp", response_model=AppointmentResponse)
async def rsvp_appointment(id: str, status: str = Query(..., regex="^(accepted|declined|tentative)$"), current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid appointment ID")
        
    app = await db.appointments.find_one({"_id": ObjectId(id)})
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    user_email = current_user["email"]
    
    # Check if user is a participant
    participant_index = next(
        (i for i, p in enumerate(app.get("participants", [])) if p.get("email") == user_email),
        None
    )
    
    if participant_index is None:
        raise HTTPException(status_code=403, detail="You are not a participant in this appointment")
        
    # Update the participant's status
    update_path = f"participants.{participant_index}.status"
    
    await db.appointments.update_one(
        {"_id": ObjectId(id)},
        {"$set": {update_path: status, f"participants.{participant_index}.user_id": str(current_user["_id"])}}
    )
    
    # Check if all participants have responded (optional logic for changing global appointment status)
    
    updated_app = await db.appointments.find_one({"_id": ObjectId(id)})
    updated_app["_id"] = str(updated_app["_id"])
    return updated_app
