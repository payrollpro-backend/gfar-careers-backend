const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, trim: true },
    startDate: { type: String, trim: true },
    workType: { type: String, trim: true },
    availability: { type: String, trim: true },
    payExpectation: { type: String, required: true, trim: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    portfolio: { type: String, trim: true },

    experience: { type: String, required: true, trim: true },
    tools: { type: String, trim: true },
    coverLetter: { type: String, trim: true },
    referral: { type: String, trim: true },

    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);
