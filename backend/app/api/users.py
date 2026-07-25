from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import UserResponse, UserBase
from app.api.auth import get_current_user
from app.database import get_db
from bson import ObjectId

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_my_profile(user_update: UserBase, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        return current_user
        
    await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user
