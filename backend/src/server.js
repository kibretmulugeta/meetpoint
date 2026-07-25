const app = require('./app');
const { startReminders } = require('./reminders/cron');

app.get('/', (req, res) => {
  res.status(200).send('Scheduler API is running!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`==========================================`);
  console.log(`🚀 Scheduler API Server is running!`);
  console.log(`🔗 Local Base URL: http://0.0.0.0:${PORT}`);
  console.log(`==========================================`);
  startReminders();
});
