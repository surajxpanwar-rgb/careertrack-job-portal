// Usage: npm run seed          (adds demo jobs if the database has none)
//        npm run seed -- --force  (deletes ALL jobs and applications first)
const dns = require('dns'); dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose'); const Job = require('../models/Job'); const Application = require('../models/Application');
const days = n => new Date(Date.now() + n * 864e5);
const J = (title, company, location, employmentType, experienceLevel, salaryMin, salaryMax, skills, deadline, status = 'published') => ({
  title, company, location, employmentType, experienceLevel, salaryMin, salaryMax, skills, deadline, status,
  description: `${company} is hiring a ${title} to join its team in ${location}.`,
  responsibilities: ['Build and maintain features end to end', 'Write clean, tested, documented code', 'Collaborate with designers and teammates in code reviews'],
  qualifications: ["Bachelor's degree in Computer Science or a related field, or equivalent experience", 'Good problem-solving and communication skills'],
  benefits: ['Health insurance', 'Flexible working hours', 'Learning budget'],
});
const jobs = [
  J('Frontend Developer', 'BrightLeaf Tech', 'Bengaluru', 'Full-time', 'Junior', 600000, 900000, ['React', 'JavaScript', 'CSS'], days(30)),
  J('MERN Stack Developer', 'Nimbus Labs', 'Noida', 'Full-time', 'Mid', 900000, 1400000, ['MongoDB', 'Express', 'React', 'Node.js'], days(45)),
  J('Backend Engineer (Node.js)', 'Orbit Systems', 'Hyderabad', 'Full-time', 'Mid', 1000000, 1600000, ['Node.js', 'REST APIs', 'MongoDB'], days(40)),
  J('Web Development Intern', 'Pixel Forge', 'Remote', 'Internship', 'Fresher', 120000, 240000, ['HTML', 'CSS', 'JavaScript'], days(20)),
  J('UI/UX Designer', 'Marigold Studio', 'Pune', 'Full-time', 'Junior', 500000, 800000, ['Figma', 'Prototyping', 'User research'], days(35)),
  J('DevOps Engineer', 'CloudNest', 'Gurugram', 'Full-time', 'Senior', 1800000, 2800000, ['AWS', 'Docker', 'CI/CD'], days(50)),
  J('QA Automation Engineer', 'Testwise Solutions', 'Chennai', 'Contract', 'Mid', 700000, 1100000, ['Selenium', 'Jest', 'API testing'], days(25)),
  J('Data Analyst', 'Insightly Analytics', 'Mumbai', 'Full-time', 'Fresher', 450000, 700000, ['SQL', 'Excel', 'Power BI'], days(28)),
  J('React Native Developer', 'Orbit Systems', 'Remote', 'Part-time', 'Junior', 400000, 650000, ['React Native', 'JavaScript'], days(60)),
  J('Technical Content Writer', 'BrightLeaf Tech', 'Delhi', 'Contract', 'Junior', 300000, 500000, ['Technical writing', 'SEO'], days(-5), 'closed'),
  J('Full Stack Developer (Draft)', 'Nimbus Labs', 'Noida', 'Full-time', 'Senior', 1500000, 2400000, ['React', 'Node.js', 'System design'], null, 'draft'),
];
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    if (process.argv.includes('--force')) { await Application.deleteMany({}); await Job.deleteMany({}); console.log('Cleared existing jobs and applications'); }
    else if (await Job.countDocuments()) { console.log('Jobs already exist. Run "npm run seed -- --force" to replace them.'); return; }
    await Job.insertMany(jobs);
    console.log(`Added ${jobs.length} demo jobs (${jobs.filter(j => j.status === 'published').length} published, 1 closed, 1 draft)`);
  } catch (e) { console.error('Seed failed:', e.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
