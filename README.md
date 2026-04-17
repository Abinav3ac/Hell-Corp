# Hellcorp Global Enterprise (HGE) — Management Console
## Official Corporate Security Research & Training Environment

> [!WARNING]  
> **LEGAL DISCLAIMER**: This application is strictly for educational and security research purposes. It contains intentional vulnerabilities that should **NEVER** be deployed on production servers or exposed to the public internet. Use only in isolated lab environments.

---

## 🎯 Project Purpose

**Hellcorp Global Enterprise (HGE)** is a state-of-the-art, intentionally vulnerable web application designed to simulate a modern corporate ERP and Management Console. Unlike basic CTF labs, HGE focuses on **realistic business logic flaws** and **sophisticated exploit chains** found in enterprise environments.

The mission of HGE is to provide a "no-hint" environment where researchers can practice identifying and exploiting:
- Complex Access Control failures (IDOR/BAC).
- Data integrity and Prototype Pollution.
- Infrastructure pivots (SSRF/RCE).
- Insecure serialization and template injection.

---

## 🏛️ System Architecture

HGE utilizes a distributed, multi-stack architecture to represent a real-world enterprise ecosystem:

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Management Console** | Node.js / Express | Primary API Gateway & Business Logic |
| **Enterprise Dashboard** | Vanilla JS / CSS3 | "Corporate Dark" ERP Interface |
| **Primary Data Lake** | MongoDB 6.0 | Personnel, Financial, and Asset Storage |
| **Global Event Bus** | Redis 7.0 | Session Management & Inter-service Messaging |
| **R&D Analytics** | Python / Flask | Proprietary algorithm monitoring & reporting |
| **Legacy Wiki** | PHP 8.2 | Internal documentation & "Shadow" data storage |

---

## 🔓 Vulnerability Matrix

The HGE environment features a broad attack surface across multiple vectors:

### 🛡️ Access & Authorization
- **IDOR (Personnel/Finance)**: Unauthorized access to private employee records and ledger transactions.
- **Vertical Privilege Escalation**: Bypassing role-based checks to access administrative control panels.
- **JWT Tampering**: Exploiting weak signature or algorithm implementations.

### 💾 Data & Logic
- **NoSQL Injection**: Bypassing authentication and leaking data via MongoDB query manipulation.
- **Prototype Pollution**: Overwriting core object properties to achieve RCE or logic bypass.
- **Mass Assignment**: Manipulating internal object states during asset provisioning.

### 🌐 Infrastructure & Execution
- **SSRF (Internal Probe)**: Pivoting from the infrastructure monitor to internal-only services.
- **OS Command Injection**: Executing system commands via the diagnostic "ping" tool.
- **XXE (XML External Entities)**: Extracting local files through the R&D reporting engine.
- **SSTI (Server-Side Template Injection)**: Gaining shell access via the project previewer.

---

## 🚀 Setup & Deployment

### 🐳 Method 1: Docker (Recommended)
Deploy the full HGE cluster with a single command:
```bash
docker-compose up --build
```

### 🛠️ Method 2: Manual Initialization
Ensure you have **Node.js 18+**, **MongoDB 6+**, and **Redis 7+** installed.

1. **Backend Provisioning**:
   ```bash
   cd backend
   npm install
   npm run seed  # Critical: Seeds enterprise users and flags
   npm run dev   # Runs on http://localhost:3001
   ```
2. **Frontend Deployment**:
   ```bash
   cd frontend
   # The dashboard is served via Nginx in Docker, 
   # or can be opened directly at http://localhost:3000
   ```
3. **Services**:
   - **Analytics**: Run `python services/analytics/app.py` (Port 5005)
   - **Legacy Wiki**: Serves via PHP-FPM/Nginx (Port 8085)

---

## 🎮 Usage Guide

### 1. Navigating the Console
Once deployed, access the **HGE Management Console** at `http://localhost:3000`. You will need to authenticate or find a bypass to enter the main dashboard.

### 2. The Infrastructure Terminal
The dashboard includes a simulated terminal. Monitor the logs for "Unauthorized Activity" errors—these are often breadcrumbs for potential exploit paths.

### 3. Diagnostic Tooling
A healthcheck script is provided to verify the reachability of major vulnerability paths:
```bash
python tools/healthcheck.py
```

### 🚩 CTF Mechanics
- **Flag Format**: `HC{...}`
- **Starting Point**: Investigate the **Personnel Search** or the **Financial Ledger** for IDOR/NoSQLi leads.

---

## 📧 Support & Contributions
For research queries or to contribute new enterprise-grade vulnerabilities:
- **Project Lead**: [Abinav3ac](https://github.com/Abinav3ac)
- **Email**: `security@hellcorp-global.int` (Placeholder)

---
© 2026 Hellcorp Global Enterprise. Authorized security research only.
