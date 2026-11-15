const router = require('express').Router(); const jwt = require('jsonwebtoken'); const path = require('path'); const fs = require('fs');
const Admin = require('../models/Admin'); const Job = require('../models/Job'); const Application = require('../models/Application');
const auth = require('../middleware/auth'); const { wrap, esc, str, list } = require('../utils/helpers');

router.post('/login', wrap(async (req, res) => {
  const email = str(req.body.email).toLowerCase(), pw = typeof req.body.password === 'string' ? req.body.password : '';
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !(await admin.matches(pw))) return res.status(401).json({ message: 'Incorrect email or password' });
  res.json({ token: jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '8h' }), email: admin.email });
}));

router.use(auth);

router.get('/stats', wrap(async (req, res) => {
  const now = new Date();
  const [total, active, closed, applications] = await Promise.all([Job.countDocuments(), Job.countDocuments({ status: 'published', $or: [{ deadline: null }, { deadline: { $gte: now } }] }),
    Job.countDocuments({ $or: [{ status: 'closed' }, { deadline: { $lt: now } }] }), Application.countDocuments()]);
  res.json({ total, active, closed, applications });
}));

const endOfDay = d => { const x = /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? new Date(d + 'T23:59:59+05:30') : null; return x && !isNaN(x) ? x : null; };
const num = v => (v === '' || v == null ? null : Number(v));
const jobBody = b => ({ title: str(b.title), company: str(b.company), location: str(b.location), employmentType: b.employmentType, experienceLevel: b.experienceLevel,
  salaryMin: num(b.salaryMin), salaryMax: num(b.salaryMax), description: str(b.description),
  responsibilities: list(b.responsibilities), qualifications: list(b.qualifications), skills: list(b.skills), benefits: list(b.benefits),
  howToApply: str(b.howToApply) || 'Fill in the application form and upload your résumé.',
  deadline: endOfDay(b.deadline), status: ['draft', 'published', 'closed'].includes(b.status) ? b.status : 'draft' });
const jobError = d => Number.isNaN(d.salaryMin) || Number.isNaN(d.salaryMax) ? 'Salary must be a number'
  : d.salaryMin != null && d.salaryMax != null && d.salaryMin > d.salaryMax ? 'Minimum salary cannot be higher than the maximum' : null;

router.get('/jobs', wrap(async (req, res) => {
  const { q, status, sort = '-createdAt' } = req.query, page = Math.max(1, parseInt(req.query.page) || 1), limit = Math.min(100, parseInt(req.query.limit) || 8), f = {};
  if (typeof q === 'string' && q) f.$or = [{ title: new RegExp(esc(q), 'i') }, { company: new RegExp(esc(q), 'i') }];
  if (['draft', 'published', 'closed'].includes(status)) f.status = status;
  const s = ['createdAt', '-createdAt', 'title', 'deadline'].includes(sort) ? sort : '-createdAt';
  const [jobs, total] = await Promise.all([Job.find(f).sort(s).skip((page - 1) * limit).limit(limit).lean(), Job.countDocuments(f)]);
  const counts = await Application.aggregate([{ $match: { job: { $in: jobs.map(j => j._id) } } }, { $group: { _id: '$job', n: { $sum: 1 } } }]);
  const m = Object.fromEntries(counts.map(c => [String(c._id), c.n]));
  res.json({ jobs: jobs.map(j => ({ ...j, applications: m[String(j._id)] || 0 })), total, page, pages: Math.ceil(total / limit) });
}));
router.get('/jobs/:id', wrap(async (req, res) => { const j = await Job.findById(req.params.id); j ? res.json(j) : res.status(404).json({ message: 'Job not found' }); }));
router.post('/jobs', wrap(async (req, res) => {
  const d = jobBody(req.body), e = jobError(d); if (e) return res.status(400).json({ message: e });
  res.status(201).json(await Job.create(d));
}));
router.put('/jobs/:id', wrap(async (req, res) => {
  const d = jobBody(req.body), e = jobError(d); if (e) return res.status(400).json({ message: e });
  const j = await Job.findByIdAndUpdate(req.params.id, d, { new: true, runValidators: true });
  j ? res.json(j) : res.status(404).json({ message: 'Job not found' });
}));
router.patch('/jobs/:id/status', wrap(async (req, res) => {
  if (!['draft', 'published', 'closed'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
  const j = await Job.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  j ? res.json(j) : res.status(404).json({ message: 'Job not found' });
}));
router.delete('/jobs/:id', wrap(async (req, res) => {
  if (await Application.exists({ job: req.params.id })) return res.status(409).json({ message: 'This job has applications. Close it instead of deleting.' });
  const j = await Job.findByIdAndDelete(req.params.id);
  j ? res.json({ message: 'Job deleted' }) : res.status(404).json({ message: 'Job not found' });
}));

const appFilter = q => {
  const f = {}; if (typeof q.job === 'string' && q.job) f.job = q.job; if (Application.STATUSES.includes(q.status)) f.status = q.status;
  if (q.from || q.to) { f.createdAt = {}; if (q.from) f.createdAt.$gte = new Date(q.from); if (q.to) f.createdAt.$lte = new Date(q.to + 'T23:59:59'); }
  return f;
};
router.get('/applications/export.csv', wrap(async (req, res) => {
  const rows = await Application.find(appFilter(req.query)).populate('job', 'title company').sort('-createdAt').lean();
  const c = v => `"${String(v ?? '').replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
  const csv = [['Name', 'Email', 'Phone', 'Job', 'Company', 'Education', 'Experience', 'Skills', 'Status', 'Applied on'].map(c).join(',')]
    .concat(rows.map(a => [a.name, a.email, a.phone, a.job?.title, a.job?.company, a.education, a.experience, a.skills.join('; '), a.status, a.createdAt.toISOString().slice(0, 10)].map(c).join(','))).join('\n');
  res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="applications.csv"' }).send(csv);
}));
router.get('/applications', wrap(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1), limit = 10, f = appFilter(req.query);
  const [apps, total] = await Promise.all([Application.find(f).populate('job', 'title company').sort('-createdAt').skip((page - 1) * limit).limit(limit), Application.countDocuments(f)]);
  res.json({ applications: apps, total, page, pages: Math.ceil(total / limit), statuses: Application.STATUSES });
}));
router.patch('/applications/:id', wrap(async (req, res) => {
  const a = await Application.findById(req.params.id); if (!a) return res.status(404).json({ message: 'Application not found' });
  if (req.body.status) { if (!Application.STATUSES.includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' }); a.status = req.body.status; }
  if (str(req.body.note)) a.notes.push({ text: str(req.body.note) });
  await a.save(); res.json(a);
}));
router.get('/applications/:id/resume', wrap(async (req, res) => {
  const a = await Application.findById(req.params.id).select('+resumeFile resumeName');
  const file = a && path.join(__dirname, '../../uploads', path.basename(a.resumeFile));
  if (!file || !fs.existsSync(file)) return res.status(404).json({ message: 'Résumé not found' });
  res.download(file, a.resumeName);
}));
module.exports = router;
