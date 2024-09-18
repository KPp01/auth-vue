const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getAppCheck } = require("firebase-admin/app-check");
const fs = require("fs");
const path = require("path");
const cors = require("cors")({ origin: true });
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

let app;

// Inicjalizacja aplikacji Firebase
const initializeFirebaseApp = async () => {
  if (!app) {
    try {
      console.log("[INFO] Attempting to initialize Firebase...");
      const serviceAccountPath = path.resolve(__dirname, "serviceAccount.json");
      console.log(`[DEBUG] serviceAccountPath: ${serviceAccountPath}`);

      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`[ERROR] File serviceAccount.json not found at path: ${serviceAccountPath}`);
      }

      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      console.log("[DEBUG] Parsed serviceAccount:", serviceAccount);

      app = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("[INFO] Firebase initialized successfully");
    } catch (error) {
      console.error("[ERROR] Error initializing Firebase:", error.message);
      throw new Error("Initialization failed: " + error.message);
    }
  } else {
    console.log("[INFO] Firebase app already initialized");
  }
  return app;
};

// Funkcja do weryfikacji tokenu App Check
const verifyAppCheck = async (req, res, next) => {
  console.log("[INFO] Verifying App Check token...");
  if (!app) {
    console.error("[ERROR] App is not initialized.");
    return res.status(500).send("Server Error: Firebase app is not initialized.");
  }

  const appCheckToken = req.header("X-Firebase-AppCheck");
  if (!appCheckToken) {
    console.error("[ERROR] App Check token missing in request headers.");
    return res.status(401).send("Unauthorized: App Check token is missing.");
  }

  try {
    const appCheckClaims = await getAppCheck(app).verifyToken(appCheckToken);
    req.appCheckClaims = appCheckClaims;
    console.log("[INFO] App Check verification successful:", appCheckClaims);
    next();
  } catch (err) {
    console.error("[ERROR] App Check verification failed:", err);
    res.status(401).send("Unauthorized: Invalid App Check token.");
  }
};

// Funkcja chmurowa do przypisywania roli użytkownikowi
exports.setUserRole = onCall(
  {
    enforceAppCheck: false,
    consumeAppCheckToken: true,
  },
  async (data, context) => {
    try {
      console.log("[INFO] Starting setUserRole function");

      if (!context || !context.auth) {
        console.error("[ERROR] Brak kontekstu autoryzacji. Użytkownik nie jest zalogowany.");
        console.log("[DEBUG] Kontekst:", JSON.stringify(context)); // Logowanie całego kontekstu dla diagnostyki
        throw new HttpsError("unauthenticated", "Funkcja może być wywoływana tylko przez zalogowanego użytkownika.");
      }

      const app = await initializeFirebaseApp();
      const auth = getAuth(app);
      console.log("[INFO] Firebase Auth initialized.");

      const { uid: targetUid, role } = data;
      if (!targetUid || !role) {
        console.error("[ERROR] Brak UID lub roli w danych wejściowych.");
        throw new HttpsError("invalid-argument", "UID i rola muszą być podane.");
      }
      console.log(`[INFO] Przypisywanie roli ${role} użytkownikowi o UID ${targetUid}.`);

      await auth.setCustomUserClaims(targetUid, { permissions: role });

      const updatedUser = await auth.getUser(targetUid);
      console.log(`[INFO] Rola ${role} została pomyślnie przypisana użytkownikowi ${updatedUser.email}. Aktualne uprawnienia: ${updatedUser.customClaims?.permissions}`);

      return { message: "Rola została pomyślnie przypisana." };
    } catch (error) {
      console.error("[ERROR] Błąd podczas przypisywania roli:", error.message);
      throw new HttpsError("internal", `Błąd przy przypisywaniu roli: ${error.message}`);
    }
  }
);

// Funkcja chmurowa do przypisywania roli Administratora przy logowaniu
exports.assignAdminRoleOnLogin = onCall(async (data, context) => {
  try {
    console.log("[INFO] Starting assignAdminRoleOnLogin function");
    const app = await initializeFirebaseApp();
    const auth = getAuth(app);

    if (!context.auth) {
      console.error("[ERROR] Brak autoryzacji użytkownika.");
      throw new HttpsError("unauthenticated", "Funkcja musi być wywoływana przez zalogowanego użytkownika.");
    }

    console.log(`[INFO] Fetching user with UID: ${context.auth.uid}`);
    const user = await auth.getUser(context.auth.uid);

    console.log(`[INFO] Assigning Administrator role to user with UID: ${user.uid}`);
    await auth.setCustomUserClaims(user.uid, { permissions: "Administrator" });
    console.log(`[INFO] User ${user.email} has been assigned Administrator role.`);

    return { message: `User ${user.email} is now an Administrator.` };
  } catch (error) {
    console.error("[ERROR] Error in assignAdminRoleOnLogin:", error.message);
    throw new HttpsError("internal", "Błąd podczas przypisywania roli Administratora.");
  }
});

// Funkcja chmurowa do weryfikacji reCAPTCHA
exports.verifyReCaptcha = onRequest(
  {
    enforceAppCheck: true,
    consumeAppCheckToken: true,
  },
  (req, res) => {
    cors(req, res, async () => {
      const allowedOrigins = [
        "https://auth-vue-bf3ca.web.app",
        "https://auth-vue-bf3ca.firebaseapp.com",
        "http://localhost:5000",
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
          console.log("[ERROR] Token is missing");
          return res.status(400).send("Token is missing");
        }

        console.log("[INFO] Received reCAPTCHA token:", token);

        try {
          const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
              secret: process.env.RECAPTCHA_SECRET_KEY,
              response: token,
            },
          });

          console.log("[INFO] Response from reCAPTCHA verification:", response.data);

          if (response.data.success) {
            return res.status(200).send({ success: true });
          } else {
            console.log("[ERROR] Failed reCAPTCHA verification:", response.data["error-codes"]);
            return res.status(400).send({
              success: false,
              "error-codes": response.data["error-codes"],
            });
          }
        } catch (error) {
          console.error("[ERROR] reCAPTCHA verification failed", error);
          return res.status(500).send("Server error");
        }
      });
    });
  }
);

// Funkcja chmurowa `yourV2CallableFunction`
exports.yourV2CallableFunction = onCall(
  {
    enforceAppCheck: true,
    consumeAppCheckToken: true,
  },
  async (data, context) => {
    try {
      console.log("[INFO] Starting yourV2CallableFunction function");
      const app = await initializeFirebaseApp();

      if (!context.auth) {
        console.error("[ERROR] Brak autoryzacji użytkownika.");
        throw new HttpsError("unauthenticated", "Funkcja musi być wywoływana przez zalogowanego użytkownika.");
      }

      console.log("[INFO] Function yourV2CallableFunction executed successfully.");
      return { message: "Function executed successfully in V2", data };
    } catch (error) {
      console.error("[ERROR] Błąd w yourV2CallableFunction:", error.message);
      throw new HttpsError("internal", `Błąd podczas wykonywania funkcji: ${error.message}`);
    }
  }
);
