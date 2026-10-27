# Employee Attendance Management System

A full-stack application for tracking employee check-ins/check-outs, work hours, monthly
attendance reports, corrections with audit trails, holidays, weekend configuration, and
role-based dashboards for Employees, Managers, and Admins.

## 1. Project Overview

The system lets organizations:

- Manage employees and users
- Track daily check-in / check-out
- Automatically calculate work hours and attendance status
- Generate monthly attendance reports (excluding weekends/holidays)
- Correct attendance records with a full audit trail
- Manage holidays and configure organization weekends
- Provide role-based dashboards (Employee, Manager, Admin)
- Send in-app notifications
- Export attendance reports to CSV

## 2. Features

- JWT-based stateless authentication with BCrypt password hashing
- Role-based access control enforced on the backend (not just hidden UI)
- Automatic work-hour and status calculation using `java.time` (never string manipulation)
- Monthly reports that exclude configured weekends and holidays
- Attendance correction workflow restricted to Admins (any employee) and Managers (direct
  reports only), with a full `corrections` audit trail
- CSV export of attendance history
- In-app notifications, including automatic alerts for unusually long open check-ins
- Fully responsive Tailwind CSS UI

## 3. Technology Stack

**Frontend:** React 18 (Create React App - NOT Vite), React Router, Tailwind CSS, Fetch API
**Backend:** Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, JWT (jjwt), BCrypt, Bean Validation
**Database:** MySQL 8.x (H2 in-memory for automated tests)
**Deployment:** Docker, Docker Compose

## 4. Folder Structure

```
employee-attendance-management-system/
├── springapp/                  # Spring Boot backend
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/eams/
│       │   ├── config/         # Security config, CORS, data seeder
│       │   ├── controller/     # REST controllers
│       │   ├── dto/            # Request/response DTOs
│       │   ├── entity/         # JPA entities
│       │   ├── exception/      # Global exception handling
│       │   ├── repository/     # Spring Data repositories
│       │   ├── security/       # JWT filter, user details, current-user helper
│       │   └── service/        # Business logic
│       └── test/               # JUnit + MockMvc tests
│
├── reactapp/                   # React frontend (Create React App)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI + feature components
│   │   ├── pages/              # Route-level pages (per role)
│   │   ├── services/apiService.js
│   │   ├── context/AuthContext.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 5. Database Setup

The backend uses MySQL and will auto-create the schema via Hibernate (`ddl-auto=update`)
on first run, as well as auto-create the database itself
(`createDatabaseIfNotExist=true`).

1. Install and start MySQL 8.x locally (or use the provided Docker Compose service).
2. Ensure a MySQL server is reachable at `localhost:3306` with a `root` user (default
   password `root`), or override via environment variables (see below).

Environment variables (optional, defaults shown):

```
DB_USERNAME=root
DB_PASSWORD=root
JWT_SECRET=eamsSuperSecretKeyForJwtSigningPurposesMustBeLongEnough123456789
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

## 6. Backend Setup (local)

```
cd springapp
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

On first startup, a `DataSeeder` creates demo accounts and a default Saturday/Sunday
weekend configuration (see Demo Credentials below).

## 7. Frontend Setup (local)

**This project intentionally does NOT use Vite.** It is a standard Create React App
project.

```
cd reactapp
npm i
npm start
```

The frontend starts on **http://localhost:3000** (CRA default) and talks to the backend
at `http://localhost:8080` by default. To point it elsewhere, copy `.env.example` to
`.env` and set:

```
REACT_APP_API_URL=http://localhost:8080
```

(Note the `REACT_APP_` prefix — this is the Create React App convention. `VITE_*`
variables are NOT used anywhere in this project.)

## 8. Authentication

- `POST /api/auth/register` — self-registration (always creates an EMPLOYEE)
- `POST /api/auth/login` — returns a JWT plus user info (id, employeeId, name, email, role)
- All protected endpoints require `Authorization: Bearer <token>`
- Passwords are hashed with BCrypt; password hashes are never returned to the client

## 9. Roles and Permissions

| Capability                          | Employee | Manager (own team) | Admin |
|--------------------------------------|:--------:|:-------------------:|:-----:|
| Check in / out                      | ✅ (self) | ❌ (not applicable)  | ❌ |
| View own attendance/report           | ✅        | ✅                   | ✅ |
| View team attendance                | ❌        | ✅                   | ✅ (all) |
| Correct attendance                  | ❌        | ✅ (direct reports)  | ✅ (any) |
| Manage users                        | ❌        | ❌                   | ✅ |
| Manage holidays / weekends           | ❌        | ❌                   | ✅ |
| View org-wide reports                | ❌        | ❌ (team only)        | ✅ |

RBAC is enforced with Spring Security `@PreAuthorize` annotations and additional
service-level checks (e.g. a manager can only correct attendance for their own direct
reports; an employee can only check in/out and view reports for themselves).

## 10. API Documentation (selected)

### Mandatory contracts (paths, methods, and bodies preserved exactly)

**Create Employee**
```
POST /api/employees
{
  "employeeId": "EMP001",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "position": "Software Developer",
  "joiningDate": "2023-01-15"
}
→ 201 Created
```

**Get All Employees**
```
GET /api/employees
GET /api/employees?department=Engineering
→ 200 OK
```

**Get Employee By Id**
```
GET /api/employees/{employeeId}
→ 200 OK | 404 Not Found
```

**Check In**
```
POST /api/attendance/check-in
{ "employeeId": "EMP001", "checkInTime": "2023-06-01T09:00:00" }
→ 201 Created
```

**Check Out**
```
PUT /api/attendance/check-out
{ "employeeId": "EMP001", "checkOutTime": "2023-06-01T17:30:00" }
→ 200 OK
```

**Monthly Report**
```
GET /api/attendance/report?employeeId=EMP001&year=2023&month=6
→ 200 OK
```

### Additional endpoints

- `GET/POST /api/auth/*`, `GET /api/attendance/history`, `GET /api/attendance/team`
- `GET /api/attendance/report/export` (CSV)
- `POST /api/corrections`
- `GET/POST/PUT/DELETE /api/holidays`
- `GET/PUT /api/settings/weekends`
- `GET /api/users`, `GET /api/users/team`, `PUT /api/users/{employeeId}`, `PUT /api/users/{employeeId}/deactivate`
- `GET/PUT /api/profile`, `PUT /api/profile/password`
- `GET /api/notifications`, `PUT /api/notifications/{id}/read`

## 11. Testing

Backend (JUnit 5 + MockMvc, using an in-memory H2 database):

```
cd springapp
mvn test
```

Covers: employee creation & validation, department filtering, 404 handling, check-in and
duplicate check-in rejection, checkout validation (before check-in, before check-in time),
work-hour/status calculation, monthly report retrieval, registration, login (including
bad credentials and duplicate email), and unauthenticated request rejection.

Frontend (React Testing Library via `react-scripts test`):

```
cd reactapp
npm test
```

## 12. Docker Setup

```
docker compose up --build
```

This starts MySQL, the Spring Boot backend (port 8080), and the React frontend (port
3000). Local development without Docker continues to work exactly as described in
sections 6 and 7.

## 13. Demo Credentials

| Role     | Email                  | Password      |
|----------|-------------------------|---------------|
| Admin    | admin@eams.com          | Admin@123     |
| Manager  | manager@eams.com        | Manager@123   |
| Employee | john.doe@eams.com       | Employee@123  |

## 14. Troubleshooting

- **"Employee has already checked in today"** — an attendance record already exists for
  that employee/date; check out first, or ask an Admin/Manager to correct the record.
- **CORS errors in the browser** — confirm `CORS_ALLOWED_ORIGINS` on the backend includes
  the exact origin the frontend is served from (default `http://localhost:3000`).
- **401 Unauthorized on every request** — the JWT may have expired or wasn't attached;
  re-login. Check that `Authorization: Bearer <token>` is present on the request.
- **MySQL connection refused** — verify MySQL is running on `localhost:3306` and the
  credentials match `DB_USERNAME`/`DB_PASSWORD`.
- **`npm start` fails** — delete `node_modules` and run `npm i` again; ensure Node.js 18+
  is installed.
"# Employee-Attendance-Management-System" 
