const multer = require('multer'); const path = require('path'); const crypto = require('crypto');
const OK = { '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
module.exports = multer({
  storage: multer.diskStorage({ destination: path.join(__dirname, '../../uploads'), filename: (r, f, cb) => cb(null, crypto.randomUUID() + path.extname(f.originalname).toLowerCase()) }),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (r, f, cb) => { const e = path.extname(f.originalname).toLowerCase(); OK[e] && f.mimetype === OK[e] ? cb(null, true) : cb(Object.assign(new Error('Résumé must be a PDF or DOCX file'), { status: 400 })); },
}).single('resume');
