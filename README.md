# FHMS — Faculty Housing Management System

A modern, production-grade web application for university faculty housing management, allocation, and maintenance lifecycle operations. 

Transformed from a legacy Java Swing desktop client into an enterprise-ready full-stack architecture featuring a typed **Node.js/Express TypeScript REST API**, a **React 18 + Vite + TypeScript** frontend, and a normalized **MySQL 8.0** schema with automated seniority-based allocation.

---

## Architecture Overview

```
                      +-----------------------------------+
                      |   React 18 + Vite + TypeScript    |
                      |  Tailwind CSS + TanStack Query    |
                      |   Zustand Auth + Theme Engine     |
                      +-----------------+-----------------+
                                        | (HTTPS / REST)
                                        v
                      +-----------------------------------+
                      |   Node.js / Express TypeScript    |
                      |   JWT Auth + Bcrypt + Zod Input   |
                      | Server Role & Ownership Guards    |
                      +--------+-----------------+--------+
                               |                 |
       +-----------------------+                 +-----------------------+
       |                                                                 |
       v                                                                 v
+-------------------------------+                       +-------------------------------+
|    Deterministic Allocation   |                       |    Resilient DB Connection    |
|   • Rank DESC / Seniority ASC |                       |   • Production: MySQL 8.0 Pool|
|   • Preview & Atomic Commit   |                       |   • Dev/Test: In-Memory Store |
+-------------------------------+                       +-------------------------------+
```

### Key Technical Highlights
- **Deterministic Seniority Allocation Engine**: Evaluates applications using academic grade rank (`grades.rank DESC`), institutional joining date (`faculty.joined_since ASC`), and application timestamp (`applications.id ASC`). Offers preview verification before atomic transactional commit.
- **Server-Side Role & Ownership Enforcement**: Role checks (`requireAdmin`, `requireFaculty`, `requireResident`) and resource ownership validations run strictly on the server. Frontend route guards exist purely for UX.
- **Resilient Dual-Mode Database Layer**: Connects to MySQL 8.0 pool in staging/production, while automatically providing an embedded in-memory SQL query engine for instant, zero-dependency local development and CI testing without needing a local MySQL server installed.
- **Modern Responsive UI**: Built with React 18, Vite, Tailwind CSS, Lucide icons, Sonner toast notifications, Recharts analytics, and dark/light mode toggle.
- **Security Hardened**: Bcrypt password hashing (replaces legacy plaintext passwords), JWT bearer tokens with expiration, Helmet headers, CORS restrictions, and audit logging for sensitive actions. Demo credential switcher is strictly gated behind `import.meta.env.DEV`.

---

## System Roles & Capabilities

### 1. System Administrator
- **KPI Dashboard**: Housing occupancy rate, pending applications, active repair tickets, and housing breakdown charts.
- **Housing Inventory**: Add and manage campus quarters, view tenant details, and mark quarters as vacated with automatic tenancy termination.
- **Allocation Center**: Live seniority queue ranking, conflict resolution panel, one-click auto-allocation preview modal, and transactional commit.
- **Maintenance Triage**: Review all maintenance tickets across campus quarters, filter by urgency/status, update repair progress, and add administrative resolution notes.
- **Audit Logs**: Immutable trail of administrative and lifecycle events with timestamps and IP addresses.

### 2. Faculty Applicant
- **Browse Vacant Quarters**: Filter available residences by capacity and view specifications.
- **Apply for Housing**: One-click application with pre-filled academic profile (automatically blocked if already assigned active housing).
- **Application Stepper**: Real-time visual lifecycle tracking (`Pending` -> `Allocated` / `Rejected`).
- **Self-Service Withdrawal**: Ability to withdraw pending applications before allocation runs.

### 3. Faculty Resident
- **Residence Dashboard**: Dedicated resident hero view showing assigned quarters number and address.
- **Maintenance Requests**: Submit repair tickets categorized by plumbing, electrical, carpentry, HVAC, or civil works with priority levels (including emergency alerts).
- **Repair Tracking & Cancellation**: Monitor repair progress (`Pending` -> `In Progress` -> `Resolved`) and cancel active tickets.

---

## Database Schema & Normalization

The database replaces the legacy non-normalized tables (`users`, `faculty`, `houses`, `occupiedhouses`, `applications`) with a normalized schema adhering to standard naming conventions:

- `grades`: Academic hierarchy (`rank INT` 10–70, e.g., Professor, Associate Professor, Assistant Professor, Lecturer).
- `faculty`: Academic personnel records with department, grade, contact info, and joining date.
- `users`: Authentication identities with email, bcrypt hashed passwords, role (`admin` | `faculty`), and foreign key to `faculty`.
- `houses`: Physical campus quarters with capacity, address, and status (`vacant`, `occupied`, `maintenance`).
- `tenancies`: Historical and active housing tenancies (`start_date`, `end_date`, `notes`), replacing legacy `occupiedhouses`.
- `applications`: Housing requests linking faculty to specific quarters with status tracking (`pending`, `allocated`, `rejected`, `withdrawn`).
- `maintenance_categories`: Configurable repair categories with default severity levels.
- `maintenance_requests`: Tenant maintenance tickets with status (`pending`, `in_progress`, `resolved`, `cancelled`) and resolution timestamps.
- `audit_logs`: Audit trail tracking administrative allocations, vacations, updates, and maintenance transitions.

Schema and seed definitions are located in [`database/schema.sql`](./database/schema.sql) and [`database/seed.sql`](./database/seed.sql).

---

## Quickstart & Local Development

### Prerequisites
- Node.js 20+
- npm 10+
- *(Optional)* Docker and Docker Compose (if running with MySQL container)

### 1. Zero-Dependency Instant Start (In-Memory Dev Mode)
You can run the entire application locally without configuring or running MySQL. The backend will automatically detect the absence of MySQL and boot with the pre-seeded in-memory store.

#### Terminal 1 — Backend API
```bash
cd backend
npm install
npm run dev
```
The backend starts on `http://localhost:5000`. Health check is available at `http://localhost:5000/api/health`.

#### Terminal 2 — Frontend App
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`. Open your browser to `http://localhost:5173`.

---

## Seed Accounts (For Dev & Testing)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@fhms.edu` | `Admin@12345` | Full administrative control |
| **Faculty (Applicant)** | `arun.sharma@fhms.edu` | `Faculty@123` | Prof. Computer Science (Senior rank, pending applicant) |
| **Faculty (Applicant)** | `vikram.singh@fhms.edu` | `Faculty@123` | Asst Prof. Mechanical (Junior applicant) |
| **Faculty (Resident)** | `priya.patel@fhms.edu` | `Faculty@123` | Assoc Prof. EE (Assigned Quarters A-102) |
| **Faculty (Resident)** | `neha.gupta@fhms.edu` | `Faculty@123` | Assoc Prof. Civil (Assigned Quarters B-201) |

> In development mode (`npm run dev`), convenient quick-login pills appear below the login form to switch identities with a single click. These are stripped in production builds.

---

## Running with Docker & MySQL

To run the complete production stack (MySQL 8.0 + Express API + Nginx SPA Frontend):

```bash
# Build and start all services in detached mode
docker-compose up --build -d

# View status
docker-compose ps

# Tail logs
docker-compose logs -f
```

- **Frontend**: `http://localhost:80`
- **Backend API**: `http://localhost:5000`
- **MySQL Database**: `localhost:3306` (`fhms_user` / `fhms_password`)

To stop and remove containers:
```bash
docker-compose down -v
```

---

## Automated Tests & Verification

### Backend Unit Tests (Vitest)
Comprehensive unit tests verify the deterministic allocation engine, tiebreakers, tenancy exclusion, conflict detection, and vacating logic:

```bash
cd backend
npm test
```
```text
✓ tests/allocation.test.ts (7 tests)
  ✓ Allocation Algorithm > sorts applications strictly by academic seniority (grade rank DESC)
  ✓ Allocation Algorithm > breaks rank ties by institutional joining date (joined_since ASC)
  ✓ Allocation Algorithm > breaks equal rank and joining date ties by application timestamp (id ASC)
  ✓ Allocation Algorithm > excludes faculty who already hold an active tenancy
  ✓ Allocation Algorithm > previews auto-allocations without mutating database state
  ✓ Allocation Algorithm > executes auto-allocation atomically and marks house occupied
  ✓ Allocation Algorithm > handles manual allocations and prevents double-booking
```

### Production Build Check
```bash
# Backend build (transpiles TypeScript to dist/)
cd backend && npm run build

# Frontend build (transpiles, chunks, and bundles to dist/)
cd frontend && npm run build
```

---

## CI/CD Pipeline

A GitHub Actions workflow is configured in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) that executes on every push and pull request to `main` or `master`:
- **Backend Pipeline**: Type-checking with `tsc`, build verification, and Vitest suite execution.
- **Frontend Pipeline**: Type-checking, Vite asset compilation, and production bundle size verification.

---

## Directory Structure

```
FHMS/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow
├── backend/
│   ├── src/
│   │   ├── config/              # Environment schema and validation
│   │   ├── controllers/         # Express endpoint controllers
│   │   ├── db/                  # Dual-mode DB connection & in-memory engine
│   │   ├── middlewares/         # Auth, Role Guard, Zod Validate, Error Handler
│   │   ├── routes/              # Modular route declarations
│   │   ├── services/            # Seniority allocation, House, Auth, Maintenance
│   │   └── index.ts             # Express app setup and server listener
│   ├── tests/
│   │   └── allocation.test.ts   # Vitest unit test suite for allocation logic
│   └── package.json
├── database/
│   ├── schema.sql               # Normalized DDL schema
│   └── seed.sql                 # Sample grades, faculty, houses, tenancies
├── docker/
│   ├── Dockerfile.backend       # Multi-stage production container for API
│   ├── Dockerfile.frontend      # Multi-stage Nginx container for React SPA
│   └── nginx.conf               # High-performance Nginx SPA reverse proxy config
├── docker-compose.yml           # Full-stack container orchestration
├── frontend/
│   ├── src/
│   │   ├── app/                 # Router, App root, Main entrypoint
│   │   ├── components/          # Shared UI widgets, layouts, theme toggles
│   │   ├── features/            # Feature pages (Auth, Dashboard, Houses, Allocations, Maintenance, Audit)
│   │   ├── lib/                 # Axios client, Zustand store, utilities
│   │   └── types/               # TypeScript interface definitions
│   └── package.json
├── FHMS/                        # Legacy Java Swing application (archived reference)
└── README.md
```

---

## License

This project is licensed under the MIT License.
