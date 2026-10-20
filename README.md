# Mini Kanban

A full-stack Kanban application for managing personal projects and tasks.

## Features

- Register, login, and logout with Laravel Sanctum session authentication
- Create and view personal projects
- Create tasks with title, description, and initial status
- Move tasks between To Do, In Progress, and Done
- Edit and delete tasks
- Project and task data are only accessible to their owner

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Laravel
- Laravel Sanctum
- SQLite
- REST API

## Screenshots

> Screenshots will be added after the UI is finalized.

## Project Structure

```text
mini-kanban/
├── api/        # Laravel REST API
├── web/        # Next.js frontend
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:imamsyafii-dev/mini-kanban.git
cd mini-kanban
```

### 2. Set up the API

```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
```

Update these values in `api/.env`:

```env
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=null
```

Run the migration and API server:

```bash
php artisan migrate
php artisan serve --host=localhost --port=8000
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd web
npm install
```

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get authenticated user |
| POST | `/api/auth/logout` | Log out |
| GET, POST | `/api/projects` | List or create projects |
| GET | `/api/projects/{project}` | Get a project |
| GET, POST | `/api/projects/{project}/tasks` | List or create tasks |
| PATCH | `/api/tasks/{task}` | Update a task |
| DELETE | `/api/tasks/{task}` | Delete a task |

## Verification

```bash
# API
cd api
php artisan test

# Frontend
cd ../web
npm run lint
npx tsc --noEmit
```

## Author

[Imam Syafii](https://github.com/imamsyafii-dev)
