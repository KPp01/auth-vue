const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: 'https://auth-vue-bf3ca.web.app',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Firebase-AppCheck'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://auth-vue-bf3ca.web.app");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Firebase-AppCheck");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.post('/verifyRecaptcha', async (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  try {
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    if (data.success) {
      res.json({ success: true, message: 'Recaptcha verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Recaptcha verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

const startServer = (port) => {
  const server = app.listen(port, () => console.log(`Server running on port ${port}`));

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use, trying another port...`);
      if (port < 65535) {
        startServer(port + 1);
      } else {
        console.error('No available ports');
      }
    } else {
      console.error(err);
    }
  });
};

const PORT = parseInt(process.env.PORT, 10) || 8080;
startServer(PORT);
