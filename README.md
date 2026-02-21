# Simple Task Manager with Role-Based Access Control (RBAC)

A **fully-featured, production-ready** full-stack web application built with **Next.js 14**, **TypeScript**, **PostgreSQL**, and **Prisma** — featuring JWT authentication, role-based access control, a modern SaaS dashboard UI with glassmorphism effects, dark/light mode, animations, and full CRUD task management.

---

## Features

- **Authentication** — Register, Login, Logout with JWT in httpOnly cookies
- **Role-Based Access Control** — ADMIN and USER roles with route protection
- **Task Management** — Full CRUD with search, filter (status/priority), pagination, optimistic UI
- **Admin Dashboard** — System analytics, user management, role assignment
- **Modern UI** — Glassmorphism, Framer Motion animations, dark/light mode, responsive design
- **Form Validation** — Zod schemas with React Hook Form
- **State Management** — Zustand stores for auth and theme
- **Toast Notifications** — react-hot-toast
- **Charts** — Recharts for priority distribution

---

## Tech Stack

| Layer       | Technology                                     |
| ----------- | ---------------------------------------------- |
| Framework   | Next.js 14 (App Router, TypeScript)            |
| Database    | PostgreSQL + Prisma ORM                        |
| Auth        | JWT (jsonwebtoken + jose for Edge middleware)   |
| Hashing     | bcrypt                                         |
| Validation  | Zod + React Hook Form + @hookform/resolvers    |
| State       | Zustand                                        |
| Styling     | TailwindCSS                                    |
| Animations  | Framer Motion                                  |
| Charts      | Recharts                                       |
| Toasts      | react-hot-toast                                |
| Utilities   | clsx, tailwind-merge, date-fns                 |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** installed and running on localhost:5432
- **npm** or **yarn**

### 1. Install Dependencies

```bash
cd "simple task manager"
npm install
```

### 2. Configure Environment

Create a `.env` file (one is already included) with:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskmanager?schema=public"
JWT_SECRET="super-secret-jwt-key-change-in-production-2024"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Important:** Update `postgres:password` with your actual PostgreSQL credentials.

### 3. Create the Database

```bash
createdb taskmanager

# Or via psql:
psql -U postgres -c "CREATE DATABASE taskmanager;"
```

### 4. Run Prisma Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed the Database

```bash
npx prisma db seed
```

This creates:

| Email                  | Password   | Role  |
| ---------------------- | ---------- | ----- |
| admin@taskmanager.com  | Admin@123  | ADMIN |
| john@taskmanager.com   | User@123   | USER  |
| jane@taskmanager.com   | User@123   | USER  |

Plus 10 sample tasks.

### 6. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## RBAC Rules

| Feature             | ADMIN | USER |
| ------------------- | ----- | ---- |
| View all tasks      | Yes   | No (own only) |
| Create tasks        | Yes   | Yes (assigned to self) |
| Edit any task       | Yes   | No (own only) |
| Delete any task     | Yes   | No (own only) |
| Admin dashboard     | Yes   | No   |
| User management     | Yes   | No   |
| Assign tasks        | Yes   | No   |

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login (sets httpOnly cookie)
- `POST /api/auth/logout` — Logout (clears cookie)
- `GET /api/auth/me` — Get current user

### Tasks
- `GET /api/tasks` — List tasks (filtered, paginated)
- `POST /api/tasks` — Create task
- `PATCH /api/tasks/[id]` — Update task
- `DELETE /api/tasks/[id]` — Delete task

### Users (Admin only)
- `GET /api/users` — List all users
- `POST /api/users` — Create user
- `PATCH /api/users/[id]` — Update user role
- `DELETE /api/users/[id]` — Delete user

### Analytics (Admin only)
- `GET /api/analytics` — System-wide analytics

---

## Build for Production

```bash
npm run build
npm start
```

---

## License

MIT
