const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const { callOpenAI } = require('./aiModel'); // Import pliku aiModel.js

const app = express();

// Używanie bodyParser do obsługi JSON-ów
app.use(bodyParser.json());

// Ustawienia CORS
const corsOptions = {
  origin: 'https://auth-vue-bf3ca.web.app',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Firebase-AppCheck'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware CORS dla różnych metod i nagłówków
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://auth-vue-bf3ca.web.app');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Firebase-AppCheck');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Obsługa zapytań do modelu AI
app.post('/api/aiModel', async (req, res) => {
  const { message, model, maxTokens } = req.body;

  if (!message || !model || !maxTokens) {
    return res.status(400).json({ error: 'Niekompletne dane w zapytaniu.' });
  }

  try {
    const result = await callOpenAI(message, model, maxTokens);
    res.json(result);
  } catch (error) {
    console.error('Błąd podczas komunikacji z OpenAI:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas komunikacji z OpenAI.' });
  }
});

// Obsługa weryfikacji reCAPTCHA
app.post('/verifyRecaptcha', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Brak tokenu reCAPTCHA.' });
  }

  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.VITE_RECAPTCHA_SECRET_KEY,
        response: token,
      },
    });

    const data = response.data;
    if (data.success) {
      return res.json({ success: true, message: 'Weryfikacja reCAPTCHA zakończona sukcesem.' });
    } else {
      return res.status(400).json({ success: false, message: 'Nieudana weryfikacja reCAPTCHA.' });
    }
  } catch (error) {
    console.error('Błąd podczas weryfikacji reCAPTCHA:', error.message);
    return res.status(500).json({ success: false, message: 'Błąd serwera podczas weryfikacji reCAPTCHA.' });
  }
});

// Funkcja do uruchamiania serwera z automatycznym wyborem dostępnego portu
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} jest zajęty. Próbuję kolejny port...`);
      if (port < 65535) {
        startServer(port + 1); // Spróbuj uruchomić serwer na kolejnym dostępnym porcie
      } else {
        console.error('Brak dostępnych portów do uruchomienia serwera.');
      }
    } else {
      console.error('Błąd podczas uruchamiania serwera:', err);
    }
  });
};

// Ustawienie portu serwera z domyślną wartością 8080, jeśli nie ma zmiennej środowiskowej
const PORT = parseInt(process.env.PORT, 10) || 8080;
startServer(PORT);
