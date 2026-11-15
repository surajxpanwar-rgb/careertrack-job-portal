const mongoose = require('mongoose');
const Admin = require('../models/Admin');
module.exports = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD && !(await Admin.countDocuments())) {
    await Admin.create({ email: ADMIN_EMAIL.toLowerCase(), password: ADMIN_PASSWORD });
    console.log('Seeded admin account from .env');
  }
  console.log('MongoDB connected');
};
