from twilio.rest import Client
from app.core.config import settings

def send_sms_notification(to_phone: str, message: str):
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        print(f"Mock SMS to {to_phone}: {message}")
        return True
        
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        print(f"SMS sent: {message.sid}")
        return True
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False

def send_invitation_sms(to_phone: str, organizer_name: str, appointment_details: dict):
    message = (
        f"You have been invited to {appointment_details['title']} "
        f"with {organizer_name}. "
        f"Location: {appointment_details['location']['name']}. "
        f"View details: {settings.FRONTEND_URL}/appointments/{appointment_details['_id']}"
    )
    return send_sms_notification(to_phone, message)
