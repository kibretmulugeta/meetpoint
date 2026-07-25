const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
// In a real app, import twilio and resend wrappers here

const startReminders = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const targetTimeStart = new Date(now.getTime() + 14 * 60000); // 14 mins from now
      const targetTimeEnd = new Date(now.getTime() + 16 * 60000);   // 16 mins from now

      const upcomingApps = await Appointment.find({
        start_time: { $gte: targetTimeStart, $lte: targetTimeEnd },
        status: 'confirmed'
      }).populate('organizer_id');

      upcomingApps.forEach(app => {
        app.participants.forEach(async (participant) => {
          if (participant.status === 'accepted') {
            const user = await User.findById(participant.user_id);
            if (user) {
              if (user.email_notifications) {
                console.log(`Sending email to ${participant.email} for ${app.title}`);
                // resend logic
              }
              if (user.sms_notifications) {
                console.log(`Sending SMS to phone for ${app.title}`);
                // twilio logic
              }
            }
          }
        });
      });
    } catch (error) {
      console.error("Cron error:", error);
    }
  });
  console.log("Started node-cron scheduler for reminders");
};

module.exports = { startReminders };
