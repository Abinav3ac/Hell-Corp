# HGE Setup & Node Deployment

This guide details the procedures for initializing a Hellcorp Global Enterprise (HGE) Management Console node.

## 📦 System Connectivity

| Service | Protocol | Access Point | Description |
| :--- | :--- | :--- | :--- |
| **Management UI** | HTTP | http://localhost:3000 | Primary control interface |
| **Core API** | HTTP | http://localhost:3001 | Central backend gateway |
| **Analytics** | HTTP | http://localhost:5005 | R&D monitoring node |
| **Legacy Wiki** | HTTP | http://localhost:8085 | Internal documentation |
| **Database UI** | HTTP | http://localhost:8081 | Mongo Express interface |

---

## 🛠️ Step-by-Step Initialization

### A. Docker Deployment (Standard)
Deploy the entire sharded infrastructure using a single command:
```bash
docker-compose up --build
```

### B. Manual Provisioning
If deploying for localized debugging:

1. **Environment Setup**
   Copy `.env.example` to `.env` and configure internal connection strings.

2. **Backend Services**
   ```bash
   cd backend
   npm install
   npm run seed  # Critical: Populates enterprise assets and flags
   npm run dev
   ```

3. **Frontend Dashboard**
   ```bash
   cd frontend
   npm install
   npm start
   ```

---

## 🔐 Internal Credentials

The following personnel identities are provisioned by default for system testing:

| Username | Department | Access Level |
| :--- | :--- | :--- |
| `admin` | IT Infrastructure | `admin` |
| `shadowroot` | Security Operations | `operator` |
| `crypt0forge` | Research & Development | `employee` |

---

## 🏗️ Diagnostic Endpoints (Internal Use)

As part of HGE's self-healing architecture, the following endpoints are available to authorized personnel:

- `/api/infrastructure/health`: Real-time node status monitor.
- `/api/infrastructure/diagnostic`: Network connectivity verification tool.
- `/api/dev/diagnostics/system`: Baseline environment dump.
- `/api/hr/documents/v1/stream`: Direct access to the HGE Document Vault.

---

*HGE Global Enterprise — Securing the Future.*
