const app = require('./app');
const { startReminders } = require('./reminders/cron');

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`==========================================`);
  console.log(`🚀 Scheduler API Server is running!`);
  console.log(`🔗 Local Base URL: http://0.0.0.0:${PORT}`);
  console.log(`==========================================`);
  startReminders();
});
