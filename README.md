# CareerTrack – Full-Stack Job Portal and Recruitment Management System

MERN job portal. Public visitors browse jobs and apply without an account. Administrators manage jobs and applications through a secure dashboard.

## Features
- **Public:** job list with search (title/company/location), filters, sorting, pagination, job detail pages, application form with PDF/DOCX résumé upload (max 2 MB).
- **Applications:** server-side validation, duplicate prevention (unique `job + email`), rejection for unpublished/expired/closed jobs, private résumé storage.
- **Admin:** bcrypt + JWT login, protected routes, dashboard stats, job create/edit/publish/unpublish/close/delete, application filters, 6-stage status updates, internal notes, CSV export, authorised résumé download.
- **Security:** helmet, CORS allow-list, rate limiting (stricter on login), NoSQL-injection sanitisation, regex escaping, secrets in `.env`, résumés never served as public static files.

## Tech stack
React 18 + Vite + React Router · Node.js + Express 4 · MongoDB + Mongoose · JWT · Multer

## Architecture
```
backend/src  config/ models/ routes/ middleware/ utils/ server.js
frontend/src pages/ api.js App.jsx
```

## Prerequisites
Node.js 18+, MongoDB (local or Atlas).

## Setup
```bash
# Backend
cd backend && cp .env.example .env     # then edit values
npm install && npm run dev             # http://localhost:5000
# Frontend (new terminal)
cd frontend && cp .env.example .env
npm install && npm run dev             # http://localhost:5173
```
Optional: add demo jobs with `npm run seed` in `backend` (use `npm run seed -- --force` to reset jobs and applications).

On first start the backend creates one admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`. Use a demo account for evaluators; never commit real credentials.

## API summary
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /api/jobs | – | List active jobs (`q, location, type, level, sort, page`) |
| GET | /api/jobs/:id | – | Job detail |
| POST | /api/jobs/:id/apply | – | Submit application (multipart, field `resume`) |
| POST | /api/admin/login | – | Admin login, returns JWT |
| GET | /api/admin/stats | Admin | Dashboard counts |
| GET/POST | /api/admin/jobs | Admin | List / create jobs |
| GET/PUT/DELETE | /api/admin/jobs/:id | Admin | Read / update / delete job |
| PATCH | /api/admin/jobs/:id/status | Admin | `draft`, `published`, `closed` |
| GET | /api/admin/applications | Admin | List (`job, status, from, to, page`) |
| PATCH | /api/admin/applications/:id | Admin | Update `status`, add `note` |
| GET | /api/admin/applications/:id/resume | Admin | Download résumé |
| GET | /api/admin/applications/export.csv | Admin | CSV export |

## Deployment
Backend: Render/Railway with env vars from `.env.example` (`CLIENT_ORIGIN` = frontend URL). Database: MongoDB Atlas. Frontend: Vercel/Netlify with `VITE_API_URL=https://<backend>/api`. Note: free hosts wipe local disk, so uploaded résumés need persistent storage (Render disk, or switch Multer to cloud storage).

## Known limitations / future work
Local-disk résumé storage, no email notifications, no automated test suite yet.
