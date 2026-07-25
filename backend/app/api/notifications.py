from fastapi import APIRouter, Depends, HTTPException, status
from app.api.auth import get_current_user
from app.database import get_db
from bson import ObjectId
from typing import List

router = APIRouter()

@router.get("/")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    cursor = db.notifications.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    notifications = await cursor.to_list(length=50)
    
    for n in notifications:
        n["_id"] = str(n["_id"])
        
    return notifications

@router.put("/{id}/read")
async def mark_as_read(id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid notification ID")
        
    result = await db.notifications.update_one(
        {"_id": ObjectId(id), "user_id": str(current_user["_id"])},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    return {"message": "Marked as read"}

@router.put("/read-all")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    await db.notifications.update_many(
        {"user_id": str(current_user["_id"]), "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "All marked as read"}
