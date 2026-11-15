const jwt = require('jsonwebtoken'); const Admin = require('../models/Admin');
module.exports = async (req, res, next) => {
  try {
    const t = (req.headers.authorization || '').replace('Bearer ', '');
    if (!t) return res.status(401).json({ message: 'Authentication required' });
    const { id } = jwt.verify(t, process.env.JWT_SECRET);
    if (!(await Admin.exists({ _id: id }))) return res.status(401).json({ message: 'Invalid account' });
    req.adminId = id; next();
  } catch { res.status(401).json({ message: 'Invalid or expired token' }); }
};
