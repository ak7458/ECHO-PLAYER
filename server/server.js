const express = require('express');
const cors = require('cors');
const path = require('path');
const musicRoutes = require('./routes/musicRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/music', musicRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`HLS Streaming Backend running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error("Server encountered an error:", err);
});

process.on('uncaughtException', (err) => {
  console.error("Uncaught exception:", err);
});

setInterval(() => {}, 10000);
