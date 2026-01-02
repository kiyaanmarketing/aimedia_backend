const cors = require("cors");

module.exports = cors({
  origin: true, // 🔥 allow all domains
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
});
