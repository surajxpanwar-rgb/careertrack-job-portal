exports.wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
exports.str = v => (typeof v === 'string' ? v.trim() : '');
exports.list = v => (Array.isArray(v) ? v : String(v || '').split(/[\n,]/)).map(x => String(x).trim()).filter(Boolean);
exports.isEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
exports.isPhone = p => /^\+?[0-9][0-9\s-]{8,14}$/.test(p);
