from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    # Using a default database name 'scheduler'
    db.db = db.client.get_default_database("scheduler")
    print("Connected to MongoDB!")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection.")

def get_db():
    return db.db
