const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const adminAuth = require("../middleware/adminAuth");

// Basic server-side validation
function validate(body) {
  const required = ["role", "payExpectation", "firstName", "lastName", "email", "experience"];
  const missing = required.filter(k => !String(body[k] || "").trim());
  if (missing.length) return `Missing required fields: ${missing.join(", ")}`;
  if (!String(body.email).includes("@")) return "Invalid email address";
  return null;
}

/**
 * POST /api/applications
 * Public endpoint: receives application submissions from careers-apply.html
 */
router.post("/", async (req, res) => {
  try {
    const err = validate(req.body);
    if (err) return res.status(400).json({ ok: false, error: err });

    const doc = await Application.create({
      ...req.body,
      ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "",
      userAgent: req.headers["user-agent"] || ""
    });

    res.status(201).json({ ok: true, id: doc._id });
  } catch (e) {
    console.error("POST /api/applications error:", e);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/applications
 * Admin-only: list applications
 * Query params:
 *  - q= search across name/email/role
 *  - limit= (default 50)
 *  - page= (default 1)
 */
router.get("/", adminAuth, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const page = Math.max(Number(req.query.page || 1), 1);

    const filter = q
      ? {
          $or: [
            { role: new RegExp(q, "i") },
            { firstName: new RegExp(q, "i") },
            { lastName: new RegExp(q, "i") },
            { email: new RegExp(q, "i") }
          ]
        }
      : {};

    const total = await Application.countDocuments(filter);
    const items = await Application.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ ok: true, total, page, limit, items });
  } catch (e) {
    console.error("GET /api/applications error:", e);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * GET /api/applications/:id
 * Admin-only: view one application
 */
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const doc = await Application.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, item: doc });
  } catch (e) {
    res.status(400).json({ ok: false, error: "Invalid id" });
  }
});

module.exports = router;

