# Hellcorp Global Enterprise (HGE) — Management Console
## Official Corporate CTF Research Lab

> [!IMPORTANT]  
> **PROPRIETARY AND CONFIDENTIAL.**  
> This platform is an enterprise-grade CTF (Capture The Flag) lab designed for security research and offensive simulation. It contains 100+ intentional vulnerabilities and realistic corporate data.

---

## 🏛️ Enterprise Architecture

HGE is built on a multi-stack, distributed architecture simulating a modern global corporation:

- **Core API Gateway**: Node.js / Express
- **Distributed DB**: MongoDB 6.0 (Sharded Simulation)
- **Central Cache**: Redis 7.0 (Session & Event Bus)
- **Analytics Engine**: Python / Flask (Asset Monitoring & R&D)
- **Legacy Systems**: PHP 8.2 (Corporate Wiki & Knowledge Base)
- **Design System**: "Corporate Dark" (High-end ERP Aesthetic)

## 🔓 Vulnerability Surface

The HGE environment features a sophisticated, non-obvious attack surface modeled after real-world enterprise flaws:

- **Access Control**: Complex IDOR, Horizontal/Vertical Privilege Escalation, and Weak JWT implementations.
- **Data Integrity**: NoSQL Injection, Prototype Pollution, and Mass Assignment.
- **Infrastructure**: SSRF via diagnostic nodes, OS Command Injection in node health checks.
- **Serialization**: XXE in deployment reports and SSTI in project preview engines.
- **Client-Side**: DOM XSS and DOM Clobbering in the unified dashboard.

---

## 🚀 Deployment Guide

### Option 1: Docker (Enterprise Standard)
The fastest way to deploy the HGE stack is via Docker Compose:

```bash
docker-compose up --build
```

### Option 2: Manual Node Initialization
If deploying outside of containers:

1. **Database Layer**: Ensure MongoDB and Redis are reachable.
2. **Backend**:
   ```bash
   cd backend
   npm install && npm run seed
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd frontend
   # Served on http://localhost:3000
   ```

---

## 🚩 CTF Mechanics

The HGE lab uses a standard flag format: `HC{...}`.
Flags are strategically placed across system environment variables, hidden database metadata, and internal server logs. 

> [!TIP]  
> Start with the **HR Personnel Directory** or the **Infrastructure Diagnostic Tool** to find your first pivot point.

---

© 2026 Hellcorp Global Enterprise. All rights reserved. Authorized security research only.
