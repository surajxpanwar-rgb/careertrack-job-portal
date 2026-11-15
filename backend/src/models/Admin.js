const mongoose = require('mongoose'); const bcrypt = require('bcryptjs');
const s = new mongoose.Schema({ email: { type: String, required: true, unique: true, lowercase: true, trim: true }, password: { type: String, required: true, select: false } }, { timestamps: true });
s.pre('save', async function (next) { if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12); next(); });
s.methods.matches = function (p) { return bcrypt.compare(p, this.password); };
module.exports = mongoose.model('Admin', s);
