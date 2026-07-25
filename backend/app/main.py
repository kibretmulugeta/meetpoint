from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.api import auth, users, contacts, appointments, maps, notifications

app = FastAPI(title="Scheduler API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    start_scheduler()

@app.on_event("shutdown")
async def shutdown_db_client():
    stop_scheduler()
    await close_mongo_connection()

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(contacts.router, prefix="/api/contacts", tags=["contacts"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(maps.router, prefix="/api/maps", tags=["maps"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Scheduler API"}
