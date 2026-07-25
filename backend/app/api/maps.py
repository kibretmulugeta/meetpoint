from fastapi import APIRouter, Depends, HTTPException, Query
from app.api.auth import get_current_user
from app.core.config import settings
import httpx

router = APIRouter()

@router.get("/search")
async def search_places(query: str, current_user: dict = Depends(get_current_user)):
    if not settings.GOOGLE_MAPS_API_KEY:
        raise HTTPException(status_code=500, detail="Google Maps API key not configured")
        
    url = f"https://maps.googleapis.com/maps/api/place/autocomplete/json?input={query}&key={settings.GOOGLE_MAPS_API_KEY}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        
    if data.get("status") != "OK" and data.get("status") != "ZERO_RESULTS":
        raise HTTPException(status_code=400, detail=f"Google API Error: {data.get('status')}")
        
    return {"results": data.get("predictions", [])}

@router.get("/place/{place_id}")
async def get_place_details(place_id: str, current_user: dict = Depends(get_current_user)):
    if not settings.GOOGLE_MAPS_API_KEY:
        raise HTTPException(status_code=500, detail="Google Maps API key not configured")
        
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,formatted_address,geometry,url&key={settings.GOOGLE_MAPS_API_KEY}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        
    if data.get("status") != "OK":
        raise HTTPException(status_code=400, detail=f"Google API Error: {data.get('status')}")
        
    result = data.get("result", {})
    
    return {
        "name": result.get("name"),
        "address": result.get("formatted_address"),
        "latitude": result.get("geometry", {}).get("location", {}).get("lat"),
        "longitude": result.get("geometry", {}).get("location", {}).get("lng"),
        "google_maps_url": result.get("url"),
        "place_id": place_id
    }
