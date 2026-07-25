from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import get_db
from app.notifications.email import send_invitation_email
from app.notifications.sms import send_invitation_sms
from datetime import datetime, timedelta, timezone

scheduler = AsyncIOScheduler()

async def check_upcoming_appointments():
    db = get_db()
    if db is None:
        return
        
    now = datetime.now(timezone.utc)
    target_time = now + timedelta(minutes=15)
    
    # Check for appointments starting in exactly 15-16 minutes that haven't had a reminder sent
    cursor = db.appointments.find({
        "start_time": {
            "$gte": now + timedelta(minutes=14),
            "$lte": now + timedelta(minutes=16)
        },
        "status": "confirmed"
    })
    
    appointments = await cursor.to_list(length=100)
    for app in appointments:
        # TODO: Prevent duplicate reminders by tracking in DB
        organizer = await db.users.find_one({"_id": app["organizer_id"]})
        org_name = organizer["full_name"] if organizer else "Organizer"
        
        for participant in app.get("participants", []):
            if participant.get("status") == "accepted":
                user_id = participant.get("user_id")
                user = await db.users.find_one({"_id": user_id}) if user_id else None
                
                # Send Email
                if user and user.get("email_notifications", True):
                    send_invitation_email(participant["email"], participant["name"], org_name, app)
                    
                # Send SMS
                if user and user.get("sms_notifications", False) and user.get("phone_number"):
                    send_invitation_sms(user["phone_number"], org_name, app)

def start_scheduler():
    scheduler.add_job(check_upcoming_appointments, 'interval', minutes=1)
    scheduler.start()
    print("APScheduler started")

def stop_scheduler():
    scheduler.shutdown()
    print("APScheduler stopped")
