const mongoose = require('mongoose');
const STATUSES = ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
const s = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true }, education: { type: String, required: true }, experience: { type: String, required: true },
  skills: { type: [String], default: [] }, coverLetter: { type: String, default: '' },
  resumeFile: { type: String, required: true, select: false }, resumeName: String,
  status: { type: String, enum: STATUSES, default: 'Submitted' },
  notes: [{ text: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });
s.index({ job: 1, email: 1 }, { unique: true }); s.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model('Application', s); module.exports.STATUSES = STATUSES;
