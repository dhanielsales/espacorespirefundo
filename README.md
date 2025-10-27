# Student Management System

A modern student registration system built with React, TypeScript, and serverless functions.

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **TanStack Router** for routing
- **TanStack Query** for data fetching and state management
- **TanStack Form** for form handling
- **Zustand** for global UI state
- **Radix UI** for accessible UI components
- **Tailwind CSS** for styling
- **Vite** for build tooling

### Backend

- **Vercel Functions** (serverless)
- **Fastify** for API framework
- **PostgreSQL** on Neon (or local Docker)
- **Drizzle ORM** for database operations
- **Zod** for schema validation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- **Either:**
  - Docker & Docker Compose (for local development)
  - A Neon PostgreSQL database (for production)

### Installation

1. Clone the repository

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

4. **Choose your database setup:**

   **Option A: Local Docker PostgreSQL (Recommended for Development)**

   Start the PostgreSQL container:

   ```bash
   pnpm docker:up
   ```

   Wait a few seconds for PostgreSQL to start, then push the schema:

   ```bash
   pnpm db:push
   ```

   The `.env` file is already configured for local Docker.

   **Option B: Neon PostgreSQL (Production)**

   Update your `.env` file with your Neon connection string:

   ```
   DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

   Then push the schema:

   ```bash
   pnpm db:push
   ```

### Development

Start the development server:

```bash
pnpm dev:vercel
```

The application will be available at `http://localhost:3000`

### Database Management

**(Optional) Drizzle Studio:**

```bash
pnpm db:studio
```

**Managing Docker Database:**

```bash
# Start the database
pnpm docker:up

# Stop the database
pnpm docker:down

# Reset the database (removes all data)
pnpm docker:reset
```

### Building for Production

```bash
pnpm build
```

### Deploying to Vercel

1. Connect your repository to Vercel
2. Add your `DATABASE_URL` environment variable in Vercel's dashboard
3. Deploy!

Vercel will automatically:

- Build your frontend with Vite
- Deploy your serverless functions
- Set up the necessary routing

## Project Structure

```
├── src/
│   ├── components/        # React components
│   │   ├── Layout.tsx
│   │   ├── StudentForm.tsx
│   │   └── Toast.tsx
│   ├── routes/           # TanStack Router routes
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   └── students/
│   │       └── $id.tsx
│   ├── store/            # Zustand stores
│   │   └── ui.ts
│   ├── lib/              # Utilities and API client
│   │   └── api.ts
│   ├── types/            # TypeScript types
│   │   └── student.ts
│   └── main.tsx          # Application entry point
├── db/                   # Database schema and config
│   ├── schema.ts
│   ├── index.ts
│   └── validations.ts
├── api/                  # Vercel serverless functions
│   └── index.ts
├── vercel.json           # Vercel configuration
├── drizzle.config.ts     # Drizzle ORM configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## API Endpoints

All API endpoints are available under `/api`:

- `GET /api/students` - List all students
- `POST /api/students` - Create a new student
- `GET /api/students/:id` - Get a single student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student

## Features

- ✅ Student CRUD operations
- ✅ Form validation with Zod
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ TypeScript throughout
- ✅ Accessible UI with Radix

## Design

#3A3768 Dark violet
#968EF5 Light violet
#D45D92 Medium pink
#FFBADC Light pink
#FFFFFF White
#0d0d16 Black (Not pure)

## TODO

- Adicionar date picker ???
