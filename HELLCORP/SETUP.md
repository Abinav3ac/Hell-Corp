# HELLCORP SETUP — QUICK START

## Method 1: Docker (Recommended)
cd HELLCORP
docker-compose up --build

## Method 2: Manual
### Terminal 1 — Start MongoDB
mongod --dbpath /tmp/hellcorp-db

### Terminal 2 — Start Redis  
redis-server

### Terminal 3 — Backend
cd HELLCORP/backend
npm install
npm run seed
npm run dev

### Terminal 4 — Frontend
cd HELLCORP/frontend
npx serve -p 3000 .

## Access
- Frontend:  http://localhost:3000
- API:       http://localhost:3001
- GraphQL:   http://localhost:3001/graphql
- WS:        ws://localhost:3001/ws

## Default Admin Credentials
Username: h3llm4st3r
Password: admin123
Role: admin

## Hidden/Undocumented Endpoints
- GET  /api/debug          (full server config)
- GET  /api/backup         (full DB dump)
- POST /api/fetch          (SSRF proxy)
- GET  /api/file?path=...  (LFI)
- GET  /api/admin/config   (secrets dump)
- POST /api/admin/exec     (RCE)
- GET  /.git/              (source disclosure)
