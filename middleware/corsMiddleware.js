const cors = require("cors");
require("dotenv").config();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : [];

const corsOptionsDelegate = function (req, callback) {
  const origin = req.header("Origin");

  // 🔹 Allow requests with no origin (Postman, curl, server-to-server)
  if (!origin) {
    return callback(null, {
      origin: true,
      methods: "GET,POST,PUT,DELETE,OPTIONS",
      allowedHeaders: ["Content-Type", "Authorization"],
    });
  }

  // 🔹 Browser requests
  if (allowedOrigins.includes(origin)) {
    return callback(null, {
      origin: true,
      methods: "GET,POST,PUT,DELETE,OPTIONS",
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: false,
      optionsSuccessStatus: 204
    });
  }

  // ❌ Block other origins
  return callback(null, { origin: false });
};

module.exports = cors(corsOptionsDelegate);
