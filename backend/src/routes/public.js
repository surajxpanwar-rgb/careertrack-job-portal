const router = require('express').Router(); const fs = require('fs'); const path = require('path');
const Job = require('../models/Job'); const Application = require('../models/Application');
const upload = require('../middleware/upload'); const { wrap, esc, str, list, isEmail, isPhone } = require('../utils/helpers');
const activeQ = () => ({ status: 'published', $or: [{ deadline: null }, { deadline: { $gte: new Date() } }] });
const PUBLIC = '-__v -status';
const validMagic = f => { try { const fd = fs.openSync(f.path, 'r'), b = Buffer.alloc(4); fs.readSync(fd, b, 0, 4, 0); fs.closeSync(fd);
  return path.extname(f.originalname).toLowerCase() === '.pdf' ? b.toString('latin1') === '%PDF' : b[0] === 0x50 && b[1] === 0x4b; } catch { return false; } };
const SORTS = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, salary: { salaryMax: -1 }, deadline: { deadline: 1 } };

router.get('/jobs', wrap(async (req, res) => {
  const { q, location, type, level, sort = 'newest' } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1), limit = Math.min(20, parseInt(req.query.limit) || 6);
  const f = activeQ();
  if (typeof q === 'string' && q) f.$and = [{ $or: [{ title: new RegExp(esc(q), 'i') }, { company: new RegExp(esc(q), 'i') }] }];
  if (typeof location === 'string' && location) f.location = new RegExp(esc(location), 'i');
  if (type) f.employmentType = str(type); if (level) f.experienceLevel = str(level);
  const [jobs, total] = await Promise.all([Job.find(f).select(PUBLIC).sort(SORTS[sort] || SORTS.newest).skip((page - 1) * limit).limit(limit), Job.countDocuments(f)]);
  res.json({ jobs, total, page, pages: Math.ceil(total / limit) });
}));

router.get('/jobs/:id', wrap(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, ...activeQ() }).select(PUBLIC);
  if (!job) return res.status(404).json({ message: 'This job is not available' });
  res.json(job);
}));

router.post('/jobs/:id/apply', upload, wrap(async (req, res) => {
  const discard = () => req.file && fs.unlink(req.file.path, () => {});
  try {
    const job = await Job.findById(req.params.id);
    if (!job || !job.isOpen()) { discard(); return res.status(400).json({ message: 'This job is not accepting applications' }); }
    const b = req.body, errors = [];
    const d = { name: str(b.name), email: str(b.email).toLowerCase(), phone: str(b.phone), education: str(b.education), experience: str(b.experience), coverLetter: str(b.coverLetter), skills: list(b.skills) };
    if (d.name.length < 2) errors.push('Enter your full name');
    if (!isEmail(d.email)) errors.push('Enter a valid email address');
    if (!isPhone(d.phone)) errors.push('Enter a valid phone number');
    if (!d.education) errors.push('Enter your educational qualifications');
    if (!d.experience) errors.push('Enter your experience (write "Fresher" if none)');
    if (!d.skills.length) errors.push('Enter at least one technical skill');
    if (!req.file) errors.push('Upload your résumé (PDF or DOCX)'); else if (!validMagic(req.file)) errors.push('The résumé is not a valid PDF or DOCX file');
    if (d.name.length > 100 || d.education.length > 300 || d.experience.length > 500 || d.coverLetter.length > 3000 || d.skills.length > 30) errors.push('One or more fields are too long');
    if (errors.length) { discard(); return res.status(400).json({ message: errors.join('. '), errors }); }
    const app = await Application.create({ ...d, job: job._id, resumeFile: req.file.filename, resumeName: req.file.originalname });
    res.status(201).json({ message: 'Application submitted successfully', applicationId: app._id });
  } catch (e) { discard(); throw e; }
}));
module.exports = router;
