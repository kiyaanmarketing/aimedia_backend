const cors = require("cors");

module.exports = cors({
  origin: "*", // 🔥 'true' ki jagah '*' use karein (Sabko allow karega)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: false, // Agar cookies nahi bhej rahe to false hi rakhein
  optionsSuccessStatus: 200 // Kuch purane browsers 204 handle nahi karte
});