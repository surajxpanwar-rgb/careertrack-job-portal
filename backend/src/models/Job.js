const mongoose = require('mongoose');
const list = { type: [String], default: [] };
const s = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  location: { type: String, required: true, trim: true },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], required: true },
  experienceLevel: { type: String, enum: ['Fresher', 'Junior', 'Mid', 'Senior'], required: true },
  salaryMin: { type: Number, min: 0 }, salaryMax: { type: Number, min: 0 },
  description: { type: String, default: '' },
  responsibilities: list, qualifications: list, skills: list, benefits: list,
  howToApply: { type: String, default: 'Fill in the application form and upload your résumé.' },
  deadline: Date,
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
}, { timestamps: true });
s.index({ status: 1, createdAt: -1 });
s.methods.isOpen = function () { return this.status === 'published' && (!this.deadline || this.deadline >= new Date()); };
module.exports = mongoose.model('Job', s);
