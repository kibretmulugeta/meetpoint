import resend
from app.core.config import settings

def send_invitation_email(to_email: str, recipient_name: str, organizer_name: str, appointment_details: dict):
    if not settings.EMAIL_API_KEY:
        print(f"Mock Email to {to_email}: You have been invited by {organizer_name} to {appointment_details['title']}")
        return True
        
    resend.api_key = settings.EMAIL_API_KEY
    
    html_content = f"""
    <h2>Hello {recipient_name},</h2>
    <p><strong>{organizer_name}</strong> has invited you to a new appointment.</p>
    
    <h3>{appointment_details['title']}</h3>
    <p>{appointment_details.get('description', '')}</p>
    
    <ul>
        <li><strong>Date:</strong> {appointment_details['start_time']}</li>
        <li><strong>Location:</strong> {appointment_details['location']['name']} - {appointment_details['location']['address']}</li>
    </ul>
    
    <p><a href="{settings.FRONTEND_URL}/appointments/{appointment_details['_id']}">View Appointment Details</a></p>
    """
    
    try:
        response = resend.Emails.send({
            "from": settings.EMAIL_FROM,
            "to": to_email,
            "subject": "You have been invited to a new appointment",
            "html": html_content
        })
        print(f"Email sent: {response}")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
