const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const applicationsRoutes = require("./routes/applications");

const app = express();

// --- CORS (lock to your domains) ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function(origin, cb) {
    // allow server-to-server, curl, etc.
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) return cb(null, true);

    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked for origin: " + origin));
  },
  credentials: false
}));

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "gfar-careers-backend" });
});

// Routes
app.use("/api/applications", applicationsRoutes);

// Error handler (including CORS errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ ok: false, error: err.message || "Bad Request" });
});

// Connect DB + start server
(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI in .env");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    const port = process.env.PORT || 10000;
    app.listen(port, () => console.log("✅ Server running on port", port));
  } catch (e) {
    console.error("❌ Startup error:", e.message);
    process.exit(1);
  }
})();
