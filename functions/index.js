const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAppCheck } = require("firebase-admin/app-check");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const serviceAccount = require("./serviceAccount.json");
const functions = require("firebase-functions");
const dotenv = require("dotenv");

dotenv.config();

// Zainicjuj Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

// Pobierz klucz reCAPTCHA secret z pliku .env
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

// Funkcja do weryfikacji App Check
const verifyAppCheck = async (req, res, next) => {
  const appCheckToken = req.header("X-Firebase-AppCheck");

  if (!appCheckToken) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const appCheckClaims = await getAppCheck().verifyToken(appCheckToken);
    req.appCheckClaims = appCheckClaims;
    next();
  } catch (err) {
    console.error("App Check verification failed", err);
    res.status(401).send("Unauthorized");
  }
};

exports.verifyReCaptcha = onRequest({
  enforceAppCheck: true,
  consumeAppCheckToken: true,
}, (req, res) => {
  cors(req, res, async () => {
    // Ustaw dozwolone domeny
    const allowedOrigins = [
      "https://auth-vue-bf3ca.web.app",
      "https://auth-vue-bf3ca.firebaseapp.com",
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }

    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Firebase-AppCheck");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    await verifyAppCheck(req, res, async () => {
      const token = req.body.token;
      if (!token) {
        console.log("Token is missing");
        return res.status(400).send("Token is missing");
      }

      console.log("Received reCAPTCHA token:", token);

      try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
          params: {
            secret: RECAPTCHA_SECRET,
            response: token,
          },
        });

        console.log("Response from reCAPTCHA verification:", response.data);

        if (response.data.success) {
          return res.status(200).send({ success: true });
        } else {
          console.log("Failed reCAPTCHA verification:", response.data["error-codes"]);
          return res.status(400).send({
            "success": false,
            "error-codes": response.data["error-codes"],
          });
        }
      } catch (error) {
        console.error("reCAPTCHA verification failed", error);
        return res.status(500).send("Server error");
      }
    });
  });
});

exports.yourV2CallableFunction = onCall({
  enforceAppCheck: true,
  consumeAppCheckToken: true,
}, (data, context) => {
  if (!context.app) {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called from an App Check verified app.",
    );
  }

  // Logika funkcji
  return { message: "Function executed successfully in V2", data };
});
